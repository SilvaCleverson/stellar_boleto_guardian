#INCLUDE "TbiCode.ch"

/*/{Protheus.doc} ZXH
Criação da tabela ZXH e índices para cadastro de Wallets Blockchain.
@type function
@version 12.1.33
@author Cleverson Silva
@since 31/07/2025
@return Nil
/*/
User Function ZXH()
    Local aSX2 := {}
    Local aSX3 := {}
    Local aSIX := {}

    AAdd(aSX2, {"ZXH", "Cadastro de Wallets Blockchain", "C"})

    AAdd(aSX3, {"ZXH", "ZXH_FILIAL", "Filial",              "C",   2, 0})
    AAdd(aSX3, {"ZXH", "ZXH_CODCLI", "Codigo Cliente",      "C",   6, 0})
    AAdd(aSX3, {"ZXH", "ZXH_WALLET", "Stellar Account ID",  "C",  60, 0})
    AAdd(aSX3, {"ZXH", "ZXH_TOPIC",  "Reservado",           "C",  20, 0})
    AAdd(aSX3, {"ZXH", "ZXH_PRVKEY", "Chave Privada",       "C", 300, 0})
    AAdd(aSX3, {"ZXH", "ZXH_DTGER",  "Data Geração",        "D",   8, 0})

    AAdd(aSIX, {"ZXH", "1", "ZXH_FILIAL+ZXH_WALLET",  "Filial+Wallet"})
    AAdd(aSIX, {"ZXH", "2", "ZXH_FILIAL+ZXH_CODCLI",  "Filial+Cliente"})

    CriaSX2(aSX2)
    CriaSX3(aSX3)
    CriaSIX(aSIX)

    MsgInfo("Tabela ZXH criada com sucesso!", "Sucesso")

Return
