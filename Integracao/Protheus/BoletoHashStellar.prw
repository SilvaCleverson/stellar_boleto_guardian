#INCLUDE "TbiCode.ch"
#INCLUDE "FWMvcDef.ch"

/*/{Protheus.doc} BolStlr
Geração de hash para boletos e registro na blockchain Stellar (Manage Data).
Chama API Node.js que assina e envia a operação Manage Data na conta do cliente.
@type function
@version 12.1.33
@author Cleverson Silva
@since 15/03/2025
@param cNossoNm, character, Nosso número do boleto
@param nValor, numeric, Valor do boleto
@param dVencto, date, Data de vencimento
@param cCodCli, character, Código do cliente
@return character, Hash SHA1 gerado (vazio se erro)
/*/
User Function BolStlr(cNossoNm, nValor, dVencto, cCodCli)
    Local cHash    := ""
    Local cPayload := ""
    Local aCliDat  := {}

    Default cNossoNm := ""
    Default nValor   := 0
    Default dVencto  := CToD("")
    Default cCodCli  := ""

    If Empty(cNossoNm) .Or. nValor <= 0 .Or. Empty(dVencto) .Or. Empty(cCodCli)
        ConOut("[STELLAR] BolStlr: parametros invalidos")
        Return ""
    EndIf

    aCliDat := GetCliDat(cCodCli)

    If Empty(aCliDat[1]) .Or. Empty(aCliDat[2])
        MsgAlert("Cliente sem conta Stellar cadastrada. Execute U_CriWltSt(cCodCli) antes.", "Boleto Stellar")
        Return ""
    EndIf

    cPayload := cNossoNm + Str(nValor, 15, 2) + DToS(dVencto) + cCodCli
    cHash    := SHA1(cPayload)

    If EnvStlr(cHash, cNossoNm, nValor, dVencto, aCliDat[1], aCliDat[2])
        GeraQRCod(cHash, aCliDat[1])
        ConOut("[STELLAR] BolStlr: hash registrado - " + cHash)
    Else
        ConOut("[STELLAR] BolStlr: falha ao registrar hash na Stellar")
    EndIf

Return cHash

/*/{Protheus.doc} EnvStlr
Envia hash para a API Node Stellar (Manage Data na conta do cliente).
@type static
@param cHash, character, Hash SHA1
@param cNossoNm, character, Nosso número
@param nValor, numeric, Valor
@param dVencto, date, Vencimento
@param cAccount, character, Account ID Stellar
@param cSecret, character, Chave privada Stellar
@return logical, .T. se enviado com sucesso
/*/
Static Function EnvStlr(cHash, cNossoNm, nValor, dVencto, cAccount, cSecret)
    Local cJSON := ""
    Local cResp := ""
    Local lRet  := .F.

    cJSON := '{'
    cJSON += '"hash":"'         + cHash              + '",'
    cJSON += '"nosso_numero":"' + cNossoNm           + '",'
    cJSON += '"valor":"'        + Str(nValor, 15, 2) + '",'
    cJSON += '"vencimento":"'   + DToS(dVencto)      + '",'
    cJSON += '"account":"'      + cAccount           + '",'
    cJSON += '"secret":"'       + cSecret            + '"'
    cJSON += '}'

    cResp := RestPOST(GetBaseURL(), "/api/blockchain", cJSON)
    lRet  := !Empty(cResp) .And. '"success":true' $ cResp

Return lRet

/*/{Protheus.doc} GeraQRCod
Monta URL de validação e QR Code com Account ID Stellar.
@type static
@param cHash, character, Hash SHA1
@param cAccount, character, Account ID Stellar
@return Nil
/*/
Static Function GeraQRCod(cHash, cAccount)
    Local cURL := ""
    Local cQR  := ""

    cURL := GetVldURL() + "/validation.html?account=" + cAccount + "&hash=" + cHash
    cQR  := "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + cURL
    ConOut("[STELLAR] QR Code: " + cQR)
Return

/*/{Protheus.doc} VldBolSt
Valida boleto consultando a API Stellar (Horizon / account data).
@type function
@version 12.1.33
@author Cleverson Silva
@since 15/03/2025
@param cAccount, character, Account ID (conta Stellar do cliente)
@param cHash, character, Hash do boleto
@return logical, .T. se hash encontrado na conta
/*/
User Function VldBolSt(cAccount, cHash)
    Local cResp   := ""
    Local lValido := .F.

    Default cAccount := ""
    Default cHash    := ""

    If Empty(cAccount) .Or. Empty(cHash)
        ConOut("[STELLAR] VldBolSt: parametros invalidos")
        Return .F.
    EndIf

    cResp   := RestGET(GetBaseURL(), "/api/validate/" + cAccount + "/" + cHash)
    lValido := !Empty(cResp) .And. ( '"found":true' $ cResp .Or. '"found": true' $ cResp )

    ConOut("[STELLAR] Validacao: " + IIf(lValido, "VALIDO", "INVALIDO") + " | Account: " + cAccount)

Return lValido

/*/{Protheus.doc} CriWltSt
Cria conta Stellar via API Node (Friendbot testnet) e persiste na ZXH.
@type function
@version 12.1.33
@author Cleverson Silva
@since 15/03/2025
@param cCodCli, character, Código do cliente
@return character, Resposta da API (JSON)
/*/
User Function CriWltSt(cCodCli)
    Local cResp    := ""
    Local cAccount := ""
    Local cSecret  := ""

    Default cCodCli := ""

    If Empty(cCodCli)
        ConOut("[STELLAR] CriWltSt: codigo do cliente vazio")
        Return ""
    EndIf

    cResp := RestPOST(GetBaseURL(), "/api/wallet", "{}")

    If Empty(cResp)
        ConOut("[STELLAR] CriWltSt: falha na chamada da API")
        Return ""
    EndIf

    cAccount := ExtCmpJSON(cResp, "accountId")
    If Empty(cAccount)
        cAccount := ExtCmpJSON(cResp, "wallet")
    EndIf
    cSecret := ExtCmpJSON(cResp, "privateKey")

    If !Empty(cAccount) .And. !Empty(cSecret)
        SalvaWZXH(cCodCli, cAccount, cSecret)
        ConOut("[STELLAR] CriWltSt: wallet criada | Cliente: " + cCodCli + " | Account: " + cAccount)
    Else
        ConOut("[STELLAR] CriWltSt: resposta sem dados de conta")
    EndIf

Return cResp

/*/{Protheus.doc} SalvaWZXH
Grava Account ID e chave privada na tabela ZXH.
@type static
@param cCodCli, character, Código do cliente
@param cAccount, character, Account ID Stellar
@param cSecret, character, Chave privada Stellar
@return logical, .T. se gravou com sucesso
/*/
Static Function SalvaWZXH(cCodCli, cAccount, cSecret)
    Local lFound := .F.

    ZXH->(DbSetOrder(2))
    lFound := ZXH->(DbSeek(xFilial("ZXH") + cCodCli))

    If lFound
        If !RecLock("ZXH", .F.)
            ConOut("[STELLAR] SalvaWZXH: falha ao bloquear registro existente")
            Return .F.
        EndIf
    Else
        If !RecLock("ZXH", .T.)
            ConOut("[STELLAR] SalvaWZXH: falha ao incluir novo registro")
            Return .F.
        EndIf
    EndIf

    ZXH->ZXH_FILIAL := xFilial("ZXH")
    ZXH->ZXH_CODCLI := cCodCli
    ZXH->ZXH_WALLET := cAccount
    ZXH->ZXH_TOPIC  := ""
    ZXH->ZXH_PRVKEY := cSecret
    ZXH->ZXH_DTGER  := Date()
    MsUnlock()

Return .T.

/*/{Protheus.doc} ExtCmpJSON
Extrai valor de campo em JSON simples (ex.: "accountId":"GABC...").
@type static
@param cJSON, character, String JSON
@param cCampo, character, Nome do campo
@return character, Valor extraído
/*/
Static Function ExtCmpJSON(cJSON, cCampo)
    Local nPos   := 0
    Local nIni   := 0
    Local nFim   := 0
    Local cValor := ""

    nPos := At('"' + cCampo + '":', cJSON)
    If nPos > 0
        nIni := nPos + Len('"' + cCampo + '":') + 1
        nFim := At('"', SubStr(cJSON, nIni + 1)) + nIni
        If nFim > nIni
            cValor := SubStr(cJSON, nIni, nFim - nIni)
        EndIf
    EndIf

Return cValor

/*/{Protheus.doc} GetCliDat
Retorna Account ID e chave privada Stellar do cliente (um único DbSeek).
@type static
@param cCodCli, character, Código do cliente
@return array, {cAccount, cSecret}
/*/
Static Function GetCliDat(cCodCli)
    Local aRet := {"", ""}

    ZXH->(DbSetOrder(2))
    If ZXH->(DbSeek(xFilial("ZXH") + cCodCli))
        aRet[1] := ZXH->ZXH_WALLET
        aRet[2] := ZXH->ZXH_PRVKEY
    EndIf

Return aRet

/*/{Protheus.doc} TstStlr
Testa conectividade com a API Node Stellar (GET /).
@type function
@version 12.1.33
@author Cleverson Silva
@since 15/03/2025
@return Nil
/*/
User Function TstStlr()
    Local cResp := ""

    cResp := RestGET(GetBaseURL(), "/")

    If !Empty(cResp) .And. At("Stellar", cResp) > 0
        MsgInfo("Conexão com API Stellar OK!", "Teste de Integração")
    Else
        MsgAlert("Falha na conexão com API Stellar. Verifique URL e se o servidor Node estÁ rodando.", "Teste")
    EndIf

Return

/*/{Protheus.doc} RestPOST
Executa requisição HTTP POST via FWRest com tratamento de erro.
@type static
@param cBase, character, URL base (ex.: http://localhost:3000)
@param cPath, character, Endpoint (ex.: /api/blockchain)
@param cBody, character, Corpo da requisição (JSON)
@return character, Resposta da API (vazio se erro)
/*/
Static Function RestPOST(cBase, cPath, cBody)
    Local oRest   := Nil
    Local cResp   := ""
    Local cError  := ""
    Local bOldErr := ErrorBlock({|e| cError := e:Description, Break(e)})

    Begin Sequence
        oRest := FWRest():New(cBase)
        oRest:SetPath(cPath)
        oRest:SetPostParams(EncodeUTF8(cBody))

        If oRest:Post()
            cResp := DecodeUTF8(oRest:GetResult())
        Else
            ConOut("[STELLAR] RestPOST erro: " + cBase + cPath)
        EndIf
    Recover
        ConOut("[STELLAR] RestPOST exceção: " + cError)
    End Sequence

    ErrorBlock(bOldErr)

Return cResp

/*/{Protheus.doc} RestGET
Executa requisição HTTP GET via FWRest com tratamento de erro.
@type static
@param cBase, character, URL base
@param cPath, character, Endpoint
@return character, Resposta da API (vazio se erro)
/*/
Static Function RestGET(cBase, cPath)
    Local oRest   := Nil
    Local cResp   := ""
    Local cError  := ""
    Local bOldErr := ErrorBlock({|e| cError := e:Description, Break(e)})

    Begin Sequence
        oRest := FWRest():New(cBase)
        oRest:SetPath(cPath)

        If oRest:Get()
            cResp := DecodeUTF8(oRest:GetResult())
        Else
            ConOut("[STELLAR] RestGET erro: " + cBase + cPath)
        EndIf
    Recover
        ConOut("[STELLAR] RestGET exceção: " + cError)
    End Sequence

    ErrorBlock(bOldErr)

Return cResp

/*/{Protheus.doc} GetBaseURL
URL base da API Node Stellar (parâmetro MV_XURLST).
@type static
@return character, URL base
/*/
Static Function GetBaseURL()
Return GetMV("MV_XURLST", .F., "http://localhost:3000")

/*/{Protheus.doc} GetVldURL
URL da pÁgina de validação (parâmetro MV_XURLVL).
@type static
@return character, URL de validação
/*/
Static Function GetVldURL()
Return GetMV("MV_XURLVL", .F., "http://localhost:3000")