#Include 'Protheus.ch'

/*/{Protheus.doc} FI040ROT
Ponto de entrada para adicionar itens no menu Outras Ações do Contas a Receber/Clientes.
/*/
User Function FI040ROT()
	Local aRotina := ParamIXB // Recebe o array original da rotina

	// Adicionando uma nova opção ao menu
	AAdd(aRotina, { "Registrar no Boleto Guardian", "U_ExceAdct(1)", 0, 4 })
	AAdd(aRotina, { "Consultar no Boleto Guardian", "U_ExceAdct(2)", 0, 4 })

Return aRotina

/*/{Protheus.doc} MinhaFunc
Função de exemplo disparada pelo botão criado.
/*/
User Function ExceAdct( nOpc )

	Local aArea     := GetArea()

	If ( !Empty( SE1->E1_CODBAR ) )
		FwMsgRun(NIL, {|oSay| GoGuardian(oSay, SE1->E1_CODBAR, nOpc)}, "Guardian", "Conectando com o Guardian...")
	Else
		MsgInfo("Boleto selecionado não tem código de barras!", "Aviso")
	EndIf

	RestArea( aArea )

Return


/*/{Protheus.doc} GoGuardian
Função de exemplo disparada pelo botão criado.
/*/  
Static Function GoGuardian( oSay, cCodeBar, nOpc )

	Local lOk       As Logical
	Local cMsgOk    As Char
	Local cMsgNok   As Char
	Local oGuardian := Guardian():New()

	oGuardian:SetCodeBar( cCodeBar )
	Sleep(3000)

	If ( nOpc == 1 )
		oSay:SetText("Registrando boleto ["+ cCodeBar + "] no Guardian...")
		ProcessMessages()
		Sleep(2000)
		cMsgOk := "Boleto registrado com sucesso no Guardian!"
		cMsgNok := "Falha ao registrar boleto no Guardian!"
		lOk := oGuardian:Send()
	Else
		oSay:SetText("Consultando boleto ["+ cCodeBar + "] no Guardian...")
		ProcessMessages()
		Sleep(2000)
		cMsgOk := "Boleto está registrado no Guardian!"
		cMsgNok := "Boleto não encontrado no Guardian!"
		lOk := oGuardian:Verify()
	EndIf

	If lOk
		FWAlertInfo(cMsgOk)
	Else
		FWAlertWarning(cMsgNok)
	EndIf

Return
