#INCLUDE "TbiCode.ch"
#INCLUDE "TbiCode.ch"

/*/{Protheus.doc} ZXH
Tabela para cadastro de Wallets Blockchain
@type function
@version 12.1.33
@author Cleverson Silva
@since 31/07/2025
@return Nil
/*/
User Function ZXH()
    Local aSX2 := {}
    Local aSX3 := {}
    
    // Criação da tabela ZXH
    AAdd(aSX2, {"ZXH", "Cadastro de Wallets Blockchain", "C"})
    
    // Estrutura da tabela
    AAdd(aSX3, {"ZXH", "ZXH_FILIAL", "Filial", "C", 2, 0})
    AAdd(aSX3, {"ZXH", "ZXH_CODCLI", "Codigo Cliente", "C", 6, 0})
    AAdd(aSX3, {"ZXH", "ZXH_WALLET", "Stellar Account ID", "C", 60, 0})
    AAdd(aSX3, {"ZXH", "ZXH_TOPIC", "Reservado", "C", 20, 0})
    AAdd(aSX3, {"ZXH", "ZXH_PRIVKEY", "Chave Privada", "C", 300, 0})
    AAdd(aSX3, {"ZXH", "ZXH_DTGER", "Data Geracao", "D", 8, 0})
    
    // Cria a tabela
    CriaSX2(aSX2)
    CriaSX3(aSX3)
    
    MsgInfo("Tabela ZXH criada com sucesso!", "Sucesso")
Return 