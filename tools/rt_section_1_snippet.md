## 1. O que está sendo ofertado

### Guardian Labs (marca-mãe)

A **Guardian Labs** é a **marca do projeto** que desenvolve **infraestrutura pública de autenticidade** para as chaves que movem dinheiro no Brasil — provas imutáveis e auditáveis de que um instrumento de pagamento é legítimo, sem depender apenas do emissor ou do banco.

A Guardian Labs **não é** banco, fintech de pagamento, âncora Stellar nem ERP. Constrói a **camada de confiança** que outros sistemas consomem via API. Outros instrumentos de pagamento brasileiros estão no roadmap da mesma infraestrutura (decisão **D-011**).

### Boleto Guardian (primeiro produto)

O **Boleto Guardian** é o **primeiro produto** da Guardian Labs: uma camada pública de autenticidade para boletos brasileiros, construída sobre a blockchain Stellar.

A empresa emissora registra cada boleto emitido na blockchain Stellar, e o pagador valida em segundos digitando os **44 a 48 números** do código de barras (ou linha digitável) do próprio documento — sem app, sem cadastro, sem conhecimento técnico.

Cada boleto vira uma prova pública e imutável de autenticidade, auditável por qualquer pessoa, a qualquer momento, sem depender de banco, cartório ou intermediário.

Para o MVP do hackathon, o Boleto Guardian também passa a demonstrar integração com uma Anchor existente da Stellar Testnet por meio de SEP-10 (Stellar Web Authentication), usando autenticação de carteira (*wallet*) antes dos fluxos de **registro e gestão** de boletos no **painel web** da empresa (login SEP-10). Isso não altera a validação pública do pagador (D-004: `validation.html` e `GET /api/validate/:codebar` permanecem sem login).

A camada de autenticidade do Boleto Guardian opera em duas dimensões: (a) cada boleto é registrado publicamente na blockchain Stellar pela empresa emissora e (b) o acesso aos fluxos de **registro e gestão** no aplicativo web (painel) é autenticado via SEP-10 contra uma Anchor consolidada da Stellar Testnet (`testanchor.stellar.org`), provando posse da carteira (*wallet*) antes de escrita on-chain pelos fluxos autenticados. O Boleto Guardian **não atua como Anchor** — atua como **parte confiante** (*relying party*, termo SEP) da âncora (Anchor) existente, aproveitando a infraestrutura de identidade já estabelecida no ecossistema Stellar.

