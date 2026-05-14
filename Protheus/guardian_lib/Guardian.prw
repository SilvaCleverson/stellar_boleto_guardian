#INCLUDE "TOTVS.CH"

/*/{Protheus.doc} Guardian
    Classe para representar a integracao com Guardian
    @author Sergio Artero
    @since 13/05/2026
    @version 1.0    
/*/
Class Guardian
	Data cCodeBar As Char
	Data cEndpoint As Char
	Data oRest As Object
	Data aHeader As Array

	Method New() Constructor
	Method SetCodeBar( cBar )
	Method Send()
	Method Verify()
EndClass

/*/{Protheus.doc} Guardian:New
    Construtor da classe Guardian.
    @author Sergio Artero
    @since 13/05/2026
    @return Self, objeto Guardian inicializado
/*/
Method New() Class Guardian

	Local cKey     := GetMV("MV_GUARDKY",,"mSPClBaZsY5LOE3bW98xeRpN0UgcAIQF")

	Self:cEndpoint := "https://www.boletoguardian.xyz"
	Self:cCodeBar  := ""
	Self:aHeader   := {}

	AADD(Self:aHeader,"Content-Type: application/json")
	AADD(Self:aHeader,"x-admin-key: " + cKey)

	Self:oRest := FWRest():New( Self:cEndpoint )

Return Self

/*/{Protheus.doc} Guardian:SetCodeBar
    Define o codigo de barras a ser enviado na chamada a API.
    @author Sergio Artero
    @since 13/05/2026
    @param cBar, Character, codigo de barras (44 digitos)
/*/
Method SetCodeBar( cBar ) Class Guardian
	Default cBar := ""
	Self:cCodeBar := cBar
Return

/*/{Protheus.doc} Guardian:Send
    Realiza o POST na API Guardian com o codebar definido via SetCodeBar().    
    @author Sergio Artero
    @since 13/05/2026
    @return lOk, Logical, .T. se a API retornou HTTP 200 ou 201
/*/
Method Send() Class Guardian

	Local cPath      := "/api/blockchain"
	Local cBody := '{"codebar":"' + Self:cCodeBar + '"}'
	Local lOk   := .F.
	Local oResponse := JsonObject():new()

	Conout("Chamando endpoint: " + Self:cEndpoint + cPath)

	Self:oRest:SetPath(cPath)
	Self:oRest:SetChkStatus(.F.)
	Self:oRest:SetPostParams(cBody)

	If ( Self:oRest:Post(Self:aHeader) )
		oResponse:fromJson( Self:oRest:getResult() )
		lOk := oResponse["success"]
		//	EECVIEW( varInfo("oResponse", oResponse), "RESPONSE OK")
		//Else
		//	EECVIEW( Self:oRest:getLastError() + CRLF + CRLF + varInfo("oResponse", oResponse), "RESPONSE FAIL")
	EndIf

Return lOk

/*/{Protheus.doc} Guardian:Verify
    Realiza o POST na API BoletoGuardian com o codebar definido via SetCodeBar().
    Lê a chave de autenticação do parâmetro SX6 MV_GUARDKY via GetMV().
    @author Sergio Artero
    @since 13/05/2026
    @return lOk, Logical, .T. se a API encontrou o codebar
/*/
Method Verify() Class Guardian

	Local cPath      := "/api/admin/boletos/" + Self:cCodeBar
	Local lOk   := .F.
	Local oResponse := JsonObject():new()

	Conout("Chamando endpoint: " + Self:cEndpoint + cPath)

	Self:oRest:SetPath(cPath)
	Self:oRest:SetChkStatus(.F.)

	if ( Self:oRest:Get(Self:aHeader) )
		oResponse:fromJson( Self:oRest:getResult() )
		lOk := oResponse["success"] .And. oResponse["found"]
		//	EECVIEW( Self:oRest:getResult(), "RESPONSE OK")
		//Else
		//	oResponse:fromJson( Self:oRest:getResult() )
		//	EECVIEW( Self:oRest:getLastError() + CRLF + CRLF + "endpoint: " + Self:cEndpoint + cPath + CRLF + CRLF + varInfo("oResponse", oResponse), "RESPONSE FAIL")
	EndIf

Return lOk
