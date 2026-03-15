#INCLUDE "TbiCode.ch"

/*/{Protheus.doc} BoletoHashStellar
GeraÃƒÂ§ÃƒÂ£o de hash para boletos e registro na blockchain Stellar (Manage Data).
Chama API Node.js que assina e envia a operaÃƒÂ§ÃƒÂ£o.
@type function
@version 12.1.33
@author Cleverson Silva
@since 15/03/2025
@param cNossoNum, character, Nosso nÃƒÂºmero do boleto
@param nValor, numeric, Valor do boleto
@param dVencimento, date, Data de vencimento
@param cCodCli, character, CÃƒÂ³digo do cliente
@return character, Hash gerado
/*/
User Function BoletoHashStellar(cNossoNum, nValor, dVencimento, cCodCli)
    Local cHash    := ""
    Local cPayload := ""
    Local cAccount := ""
    Local cSecret  := ""

    cAccount := GetAccountCliente(cCodCli)
    cSecret  := GetSecretCliente(cCodCli)

    If Empty(cAccount) .Or. Empty(cSecret)
        MsgAlert("Cliente sem conta Stellar cadastrada. Execute U_CriaWalletStellar(cCodCli) antes.", "Boleto Stellar")
        Return ""
    EndIf

    cPayload := cNossoNum + Str(nValor, 15, 2) + DToS(dVencimento) + cCodCli
    cHash    := SHA1(cPayload)

    EnviaParaStellar(cHash, cNossoNum, nValor, dVencimento, cAccount, cSecret)
    GeraQRCodeStellar(cHash, cAccount)

Return cHash

/*/{Protheus.doc} EnviaParaStellar
Envia hash para a API Node Stellar (Manage Data na conta do cliente).
@type static
@param cHash, cNossoNum, nValor, dVencimento, cAccount, cSecret
@return Nil
/*/
Static Function EnviaParaStellar(cHash, cNossoNum, nValor, dVencimento, cAccount, cSecret)
    Local cURL     := GetBaseURLStellar() + "/api/blockchain"
    Local cJSON    := ""
    Local cHeaders := ""

    cJSON := '{'
    cJSON += '"hash":"' + cHash + '",'
    cJSON += '"nosso_numero":"' + cNossoNum + '",'
    cJSON += '"valor":"' + Str(nValor, 15, 2) + '",'
    cJSON += '"vencimento":"' + DToS(dVencimento) + '",'
    cJSON += '"account":"' + cAccount + '",'
    cJSON += '"secret":"' + cSecret + '"'
    cJSON += '}'

    cHeaders := "Content-Type: application/json" + CRLF + "Accept: application/json"
    HTTPRequest(cURL, "POST", cJSON, cHeaders)
Return

/*/{Protheus.doc} GeraQRCodeStellar
Monta URL de validaÃƒÂ§ÃƒÂ£o e QR Code (Stellar Ã¢â‚¬â€œ Account ID).
@type static
/*/
Static Function GeraQRCodeStellar(cHash, cAccount)
    Local cURL  := ""
    Local cQR   := ""

    cURL := GetValidationURLStellar() + "/validation.html?account=" + cAccount + "&hash=" + cHash
    cQR  := "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + cURL
    ConOut("QR Code Stellar: " + cQR)
Return

/*/{Protheus.doc} ValidaBoletoStellar
Valida boleto consultando a API Stellar (Horizon / account data).
@type function
@param cAccount, character, Account ID (conta Stellar do cliente)
@param cHash, character, Hash do boleto
@return logical, .T. se hash encontrado na conta
/*/
User Function ValidaBoletoStellar(cAccount, cHash)
    Local cURL     := ""
    Local cResponse:= ""
    Local lValido  := .F.

    cURL := GetBaseURLStellar() + "/api/validate/" + cAccount + "/" + cHash
    cResponse := HTTPRequest(cURL, "GET", "", "Accept: application/json")
    lValido := ( '"found":true' $ cResponse .Or. '"found": true' $ cResponse )
    ConOut("ValidaÃƒÂ§ÃƒÂ£o Stellar: " + IIf(lValido, "VÃƒï¿½LIDO", "INVÃƒï¿½LIDO"))
Return lValido

/*/{Protheus.doc} CriaWalletStellar
Cria conta Stellar via API Node (Friendbot testnet) e persiste na ZXH.
@type function
@param cCodCli, character, CÃƒÂ³digo do cliente
@return character, Resposta da API (JSON)
/*/
User Function CriaWalletStellar(cCodCli)
    Local cURL      := GetBaseURLStellar() + "/api/wallet"
    Local cResponse := ""
    Local cHeaders  := ""
    Local cAccount  := ""
    Local cSecret   := ""

    cHeaders := "Content-Type: application/json" + CRLF + "Accept: application/json"
    cResponse := HTTPRequest(cURL, "POST", "{}", cHeaders)

    cAccount := ExtraiCampoJSONStellar(cResponse, "accountId")
    If Empty(cAccount)
        cAccount := ExtraiCampoJSONStellar(cResponse, "wallet")
    EndIf
    cSecret := ExtraiCampoJSONStellar(cResponse, "privateKey")

    If !Empty(cAccount) .And. !Empty(cSecret)
        SalvaWalletZXHStellar(cCodCli, cAccount, cSecret)
    EndIf

Return cResponse

/*/{Protheus.doc} SalvaWalletZXHStellar
Grava Account ID e chave na ZXH (Stellar: ZXH_WALLET = account, ZXH_TOPIC em branco).
@type static
/*/
Static Function SalvaWalletZXHStellar(cCodCli, cAccount, cSecret)
    Local lFound := .F.

    ZXH->(DbSetOrder(2))
    lFound := ZXH->(DbSeek(xFilial("ZXH") + cCodCli))

    If lFound
        RecLock("ZXH", .F.)
    Else
        RecLock("ZXH", .T.)
    EndIf
    ZXH->ZXH_FILIAL  := xFilial("ZXH")
    ZXH->ZXH_CODCLI  := cCodCli
    ZXH->ZXH_WALLET  := cAccount
    ZXH->ZXH_TOPIC   := ""  // Reservado (Stellar usa apenas ZXH_WALLET)
    ZXH->ZXH_PRIVKEY := cSecret
    ZXH->ZXH_DTGER   := Date()
    MsUnlock()
Return

/*/{Protheus.doc} ExtraiCampoJSONStellar
Extrai valor de campo em JSON (ex.: "accountId":"GABC...").
@type static
/*/
Static Function ExtraiCampoJSONStellar(cJSON, cCampo)
    Local nPos := 0
    Local nIni := 0
    Local nFim := 0
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

/*/{Protheus.doc} GetAccountCliente
Retorna ZXH_WALLET (Account ID) do cliente.
@type static
/*/
Static Function GetAccountCliente(cCodCli)
    Local cAccount := ""

    ZXH->(DbSetOrder(2))
    If ZXH->(DbSeek(xFilial("ZXH") + cCodCli))
        cAccount := ZXH->ZXH_WALLET
    EndIf
Return cAccount

/*/{Protheus.doc} GetSecretCliente
Retorna ZXH_PRIVKEY do cliente (chave Stellar).
@type static
/*/
Static Function GetSecretCliente(cCodCli)
    Local cSecret := ""

    ZXH->(DbSetOrder(2))
    If ZXH->(DbSeek(xFilial("ZXH") + cCodCli))
        cSecret := ZXH->ZXH_PRIVKEY
    EndIf
Return cSecret

/*/{Protheus.doc} TestaIntegracaoStellar
Testa conectividade com a API Stellar (GET /).
@type function
/*/
User Function TestaIntegracaoStellar()
    Local cURL      := GetBaseURLStellar() + "/"
    Local cResponse := ""

    cResponse := HTTPRequest(cURL, "GET", "", "Accept: application/json")
    If At("Stellar", cResponse) > 0
        MsgInfo("ConexÃƒÂ£o com API Stellar OK!", "Teste de IntegraÃƒÂ§ÃƒÂ£o")
    Else
        MsgAlert("Falha na conexÃƒÂ£o com API Stellar. Verifique URL e se o servidor Node estÃƒÂ¡ rodando.", "Teste")
    EndIf
Return

/*/{Protheus.doc} GetBaseURLStellar
URL base da API Node Stellar (ex.: http://localhost:3000).
@type static
/*/
Static Function GetBaseURLStellar()
    Local cURL := ""

    // Configurar no Protheus (parÃƒÂ¢metro, .ini ou constante)
    cURL := GetMV("MV_XURLST", .F., "http://localhost:3000")
Return cURL

/*/{Protheus.doc} GetValidationURLStellar
URL da pÃƒÂ¡gina de validaÃƒÂ§ÃƒÂ£o (ex.: http://localhost:3000).
@type static
/*/
Static Function GetValidationURLStellar()
    Local cURL := ""

    cURL := GetMV("MV_XURLVL", .F., "http://localhost:3000")
Return cURL
