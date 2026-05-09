# RT — Documento de Produto

**Projeto:** Boleto Guardian
**Programa:** Stellar 37 Degrees (NearX × Stellar Development Foundation)
**Mantido por:** Equipe Guardian
**Última atualização:** 08/05/2026

---

## Sobre este documento

Este é o **Documento de Produto** (RT — *Record of Thinking*) do Boleto Guardian. Ele consolida em um único lugar **todas as decisões importantes** já tomadas sobre o produto: o que está sendo construído, para quem, como, com quais tecnologias, e por quais motivos.

É atualizado a cada nova decisão, aprendizado ou pivô. O histórico de mudanças é preservado pelos commits do GitHub.

> **Princípio:** decisões são registradas com a justificativa que as motivou no momento. Quando uma decisão é revertida, a anterior **não é apagada** — é marcada como obsoleta com a nova decisão abaixo. Isso preserva a memória do raciocínio e permite revisitar suposições.

---

## 1. O que está sendo ofertado

O **Boleto Guardian** é o primeiro produto da **Guardian Labs** — uma marca-mãe que constrói infraestrutura pública de autenticidade para as chaves que movem dinheiro no Brasil. Outros instrumentos de pagamento brasileiros estão no roadmap futuro da Guardian Labs.

O **Boleto Guardian** é uma camada pública de autenticidade para boletos brasileiros, construída sobre a blockchain Stellar.

A empresa emissora registra cada boleto emitido na blockchain Stellar, e o pagador valida em segundos digitando os 47 números do próprio documento — sem app, sem cadastro, sem conhecimento técnico.

Cada boleto vira uma prova pública e imutável de autenticidade, auditável por qualquer pessoa, a qualquer momento, sem depender de banco, cartório ou intermediário.

---

## 2. Para quem é

### Persona alvo (cliente pagante — empresa emissora)

| Atributo | Definição |
|---|---|
| **Quem** | Gestor financeiro, controller, ou dono de empresa de pequeno e médio porte |
| **Cargo** | CFO, gerente financeiro, controller, analista de contas a receber, ou empresário decisor |
| **Porte da empresa** | R$ 10M–R$ 500M de faturamento, 1.000+ boletos emitidos por mês |
| **Setor** | Indústria, comércio, serviços B2B com cobrança recorrente, e-commerces médios |
| **Sistema usado** | Protheus, Sankhya, Omie, ContaAzul ou ERP equivalente (idealmente Protheus) |
| **Dor específica** | Cliente protestado em cartório por causa de boleto adulterado. Cliente perdeu dinheiro pagando um boleto fraudado, ficou com nome sujo, culpa a empresa pelo prejuízo, a empresa perde o cliente para sempre, e o golpista nunca é responsabilizado. |

### Beneficiário secundário (não-pagante — pagador final)

O pagador do boleto é quem **mais ganha** com a solução, mas **não é quem paga** por ela. Esta assimetria é a base da [suposição mais arriscada](#7-suposição-mais-arriscada-do-produto) do produto e está sob teste ativo.

---

## 3. Arquitetura escolhida

### Visão geral em três camadas

```
ERP do cliente            API Boleto Guardian          Blockchain Stellar
(Protheus/ADVPL)   ─────▶ (Node.js + Express)   ─────▶ (Manage Data nativa)

U_BolStlr()               POST /api/blockchain         Operação manageData
ZXH (tabela)              GET  /api/validate/          key:   codebar
                                                       value: dados do boleto

                          Página de validação
                          (HTML público, Vercel)
                          validation.html
```

### Camada 1 — ERP (Protheus / ADVPL)

A integração foi desenhada para Protheus (TOTVS) por ser o ERP brasileiro mais usado em empresas de médio porte e o que o autor domina.

| Componente | Função |
|---|---|
| `ZXH` (tabela customizada) | Armazena par de chaves Stellar e metadados da empresa emissora |
| `U_ZXH()` | Cria a tabela ZXH no banco do Protheus (executa uma vez) |
| `U_CriWltSt()` | Cria a conta Stellar da empresa via Friendbot e grava chaves na ZXH |
| `U_BolStlr(cCodebar, cNossoNum, nValor, dVencto, cCodCli)` | Função executada a cada emissão de boleto, registra na blockchain |
| Parâmetros do sistema | `MV_XURLST` (URL da API) e `MV_XURLVL` (URL da página de validação) |

A arquitetura é **agnóstica ao ERP** — o mesmo padrão pode ser implementado em Sankhya, Omie, Bling, ou qualquer outro sistema que emita boletos. Protheus é o primeiro caso de uso, não o único.

### Camada 2 — API Node.js / Express

API REST que recebe os dados do boleto, assina a transação Stellar com a chave privada da empresa emissora, e submete via Horizon.

| Endpoint | Função |
|---|---|
| `GET /` | Status da API |
| `POST /api/wallet` | Cria conta Stellar de uma nova empresa cliente |
| `POST /api/blockchain` | Registra um boleto via Manage Data |
| `GET /api/validate/:codebar` | Consulta a autenticidade de um boleto pelos 47 dígitos |
| `GET /api/account/:id/data` | Lista todos os boletos registrados por uma empresa |

A página pública de validação (`validation.html`) consome o endpoint `validate/:codebar` para que o pagador final confira o boleto sem cadastro.

### Camada 3 — Blockchain Stellar

Modelo: **uma conta Stellar por empresa emissora.**

| Aspecto | Decisão |
|---|---|
| Operação utilizada | `Operation.manageData({ name, value })` |
| `key` (até 64 bytes) | Linha digitável de 47 dígitos do boleto |
| `value` (até 64 bytes) | `nossonumero\|valor\|vencimento\|status` |
| Reserva exigida | 1 XLM base + 0,5 XLM por subentry (cada boleto = 1 subentry) |
| Custo da transação | aprox. 0,00001 XLM por operação |
| Rede atual | **Testnet** |
| Migração planejada | **Mainnet** até 30/05/2026 (Sprint 4 do programa) |

---

## 4. Tecnologias adotadas

| Camada | Tecnologia | Justificativa |
|---|---|---|
| ERP | ADVPL / xBase (Protheus 12.1.33+) | Linguagem nativa do Protheus, com `SHA1()` e `FWRest` disponíveis. Domínio pessoal do autor. |
| Backend | Node.js + Express | SDK Stellar oficial em JavaScript é o mais maduro. Stack leve, hospedagem barata. |
| SDK | `@stellar/stellar-sdk` | Biblioteca oficial mantida pela Stellar Development Foundation |
| Blockchain | Stellar (Manage Data) | Operação nativa, sem necessidade de smart contract. Custo e latência baixíssimos. |
| Hospedagem (frontend) | Vercel | Free tier suficiente para a fase atual. Deploy automático via Git. |
| Hospedagem (API) | A definir (Railway / Fly.io / VPS) | Decisão pendente para Sprint 4 (mainnet) |
| Auditoria pública | Stellar Expert | Explorer oficial do ecossistema Stellar |
| Documentação | Markdown no GitHub | Versionamento automático e link público |

---

## 5. Decisões de produto tomadas

Cada decisão segue o formato: **ID → Data → Decisão → Por quê**.

### D-001 · Nome do produto: Boleto Guardian

**Data:** 06/05/2026
**Decisão:** Manter o nome "Boleto Guardian", já consolidado em whitepaper, repositório público e domínio próprio.
**Por quê:** Foram avaliadas alternativas em latim (Probo, Verum, Sigil) durante o processo de discovery, mas a marca já tinha tração inicial. Trocar o nome agora implicaria perda de momentum sem ganho mensurável. A decisão pode ser revisitada se a expansão futura para NF-e e contratos exigir um nome menos vinculado a "boleto".

### D-002 · Modelo "uma conta Stellar por empresa emissora"

**Data:** 15/03/2026
**Decisão:** Cada empresa cliente possui sua própria conta Stellar, com sua própria chave. A API Boleto Guardian apenas orquestra a operação.
**Por quê:** Mantém a responsabilidade da assinatura na empresa emissora, o que reforça o argumento institucional de fé pública (cada empresa "selou" cada boleto que emitiu). Alternativa rejeitada: conta única multi-tenant gerida pela própria Boleto Guardian, que perderia a clareza de autoria.

### D-003 · Persistência via Manage Data, não smart contract (Soroban)

**Data:** 15/03/2026
**Decisão:** Usar a operação nativa `Manage Data` da Stellar para registrar os dados do boleto.
**Por quê:** Manage Data é nativo, gratuito (apenas custo da transação) e não exige deploy de contrato. Soroban (smart contracts da Stellar) é overkill para o caso de uso atual. Se a expansão futura exigir lógica programável on-chain, Soroban entra como camada adicional, não substituta.

### D-004 · Validação pública sem cadastro

**Data:** 15/03/2026
**Decisão:** A página de validação não exige login, cadastro nem instalação de app. O pagador apenas digita os 47 dígitos da linha digitável.
**Por quê:** Diferencial central da UX. Toda solução existente de antifraude exige adesão prévia (DDA, app bancário). O Boleto Guardian aposta que a validação **só funciona em escala se for instantânea para o pagador**, sem barreira nenhuma.

### D-005 · Whitepaper público trilíngue

**Data:** 15/03/2026
**Decisão:** Manter o whitepaper em português, inglês e espanhol, todos públicos no repositório.
**Por quê:** O programa Stellar 37 Degrees aponta para Stellar Village em junho com investidores internacionais. A presença do whitepaper em inglês desde o início reduz fricção de avaliação por terceiros não-brasileiros. Espanhol foi adicionado pensando em expansão futura para LATAM.

### D-006 · Open source com licença MIT

**Data:** 15/03/2026
**Decisão:** Manter o código aberto sob licença MIT.
**Por quê:** Reforça a tese de transparência radical e fé pública digital. O valor do produto não está no código (que é simples) — está na rede de empresas que o adotam. MIT incentiva fork, contribuição e auditoria por parceiros.

### D-007 · Foco inicial em Protheus (TOTVS)

**Data:** 15/03/2026
**Decisão:** Implementar primeiro a integração com Protheus, antes de expandir para outros ERPs.
**Por quê:** Protheus tem grande participação no mercado de ERP brasileiro e domínio pessoal do autor. Integrar primeiro com Protheus reduz tempo de validação e abre porta para parceria com TOTVS no futuro.

### D-008 · Migração para mainnet em maio

**Data:** 06/05/2026
**Decisão:** Migrar de testnet para mainnet até o fim da Sprint 4 (30/05/2026), com pelo menos um piloto comercial real registrando boletos.
**Por quê:** Entrega oficial do programa exige cinco wallets reais com atividade na mainnet. Migrar sem piloto não cumpre o critério. Migrar sem segurança aprimorada (HSM ou Secret Manager) também não é aceitável. Decisão liga as duas pontas: piloto comercial + segurança de chaves.

### D-009 · Modelo de receita ainda em aberto

**Data:** 06/05/2026
**Decisão:** Manter o modelo de receita como hipótese a validar até a Sprint 3 (até 23/05/2026).
**Por quê:** As entrevistas das Sprints 1 e 2 vão revelar:
- Disposição real a pagar (DAP) das empresas emissoras
- Sensibilidade a SaaS por boleto vs. mensalidade fixa
- Aceitação de modelo pay-per-use via x402

Decidir o modelo agora seria precoce. A Sprint 3 fecha esta decisão com base em dados.

### D-010 · Avaliação do protocolo x402 (pendente)

**Data:** 06/05/2026
**Decisão:** Avaliar formalmente até a Sprint 2 (16/05/2026) se o protocolo x402 faz sentido para o modelo de receita do Boleto Guardian.
**Por quê:** Entrega oficial da Sprint 2 exige commit no GitHub com x402 ou justificativa formal de N/A. Decisão depende do modelo de receita escolhido (D-009).

### D-011 · Adoção de marca-mãe Guardian Labs

**Data:** 08/05/2026
**Decisão:** Adotar Guardian Labs como marca-mãe do projeto. O Boleto Guardian passa a ser oficialmente o primeiro produto do ecossistema Guardian Labs. O posicionamento institucional passa a ser: "infraestrutura pública de autenticidade para as chaves que movem dinheiro no Brasil".
**Por quê:** A tese de longo prazo do projeto sempre foi maior que apenas boletos — a categoria comum entre boleto e outros instrumentos de pagamento brasileiros é "chaves que movem dinheiro". Adotar a marca-mãe agora resolve quatro problemas: (1) permite expansão futura sem perder marca acumulada; (2) facilita o pitch internacional, em que "boleto" exige explicação; (3) dá ao programa Stellar 37 Degrees uma narrativa de empresa, não só de produto; (4) cria um sistema visual coerente para futuros produtos da família. Decisão tomada com base na lógica de holding/conglomerado em fase early — adotar nome forte de família agora custa pouco e abre muito.

---

## 6. Pesquisa em curso (entrevistas e descobertas)

A Sprint 1 do programa exige entrevistas qualificadas com a persona alvo, seguindo metodologia *Mom Test*. O roteiro completo está em `docs/entrevistas.md` e a tabulação em planilha externa.

### Hipóteses principais sob teste

| Hipótese | Status | Como testar |
|---|---|---|
| Empresa emissora sente dor financeira/reputacional suficiente com fraude para pagar pela prevenção | Em teste | Entrevistas qualitativas com 10+ gestores |
| Pagadores adotarão a validação se tiver fricção zero (digitar 47 dígitos) | Em teste | Demos de usabilidade após entrevista de dor |
| Empresas que usam Protheus aceitam integração via ADVPL sem resistência | Em teste | Conversa com analistas Protheus em entrevistas |
| Custo de reserva XLM em escala (0,5 XLM por subentry) é aceitável | Em teste | Modelo financeiro com cenários de volume |

### Aprendizados consolidados (atualizar a cada bloco de 5 entrevistas)

*Esta seção será preenchida ao longo das Sprints 1 e 2 conforme as entrevistas avançam.*

---

## 7. Suposição mais arriscada do produto

Estou apostando que a vergonha de ver um cliente protestado por culpa de um boleto adulterado dói o suficiente para a empresa pagar pela prevenção. Mas pode ser que não doa. Pode ser que o gestor financeiro encare como "azar do cliente" e siga em frente. Se for esse o caso, construí uma solução elegante para um problema que ninguém quer pagar para resolver.

**Como vamos refutar ou confirmar:**
- 10+ entrevistas com perguntas específicas sobre quem ressarce, quem protesta, quem assume o desgaste reputacional
- Duas perguntas-chave em toda entrevista:
  1. Quem ficou com o prejuízo da fraude — empresa ou cliente?
  2. A empresa enxerga isso como problema dela, ou problema do cliente?

Se 4 em 5 entrevistas indicarem que a empresa não considera fraude um problema dela, a hipótese está sendo refutada e o produto precisa de pivô — provavelmente vendendo ao pagador via banco/parceiro, ou achando outro segmento (ex.: cobrança recorrente em saúde ou educação, onde o relacionamento longo aumenta a dor reputacional).

---

## 8. Roadmap operacional do programa

| Sprint | Período | Foco | Entrega-chave |
|---|---|---|---|
| Sprint 1 — Bootcamp | 04 a 09/05/2026 | Discovery + FLG + Testnet | Persona, premissa, transação testnet, 2 posts, 1 vídeo de entrevista |
| Sprint 2 — Hackathon | 11 a 16/05/2026 | MVP + entrevistas + pitch | Loom do fluxo, 3 entrevistas em vídeo, x402 (ou N/A), pitch deck 5 slides |
| Sprint 3 — Refinamento | 18 a 23/05/2026 | Segurança + monetização | Vulnerabilidade documentada, modelo de receita, posicionamento, rascunho SCF |
| Sprint 4 — Mainnet | 25 a 30/05/2026 | Mainnet + 5 usuários reais | Produto na mainnet, 5 wallets reais, deck 7 slides, landing page, plano GTM |
| Preparação | 01 a 05/06/2026 | Polimento + ensaios | Pitch final em inglês, materiais físicos, lista de contatos |
| Sprint 5 — Stellar Village | 09 a 12/06/2026 (RJ) | Apresentação + networking | Pitch ao vivo, demos 1:1, 30+ contatos qualificados |

---

## 9. Riscos críticos identificados

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Não conseguir 5 pilotos reais até 30/05/2026 | Alta | Crítico | Iniciar prospecção na Sprint 1; oferecer piloto gratuito 30–60 dias |
| Pitch em inglês fraco no Village | Média | Crítico | Treinar oral desde Sprint 1; gravar e revisar; buscar feedback de nativos |
| Hackathon mal sucedido (Sprint 2) | Média | Alto | Definir entregável único e claro; polir uma coisa em vez de refazer tudo |
| Demo quebrar ao vivo no Village | Média | Alto | Backup em vídeo; testar 24h antes |
| Migração mainnet com problemas de chave | Baixa | Crítico | HSM ou Secret Manager; nunca commitar chave; backup separado |
| Custo de reserva XLM em escala | Baixa | Médio | Modelar custo com cenários antes da mainnet; repassar como setup ao cliente |
| Concorrência institucional (banco/FEBRABAN lança equivalente) | Baixa | Alto | Reforçar diferencial de independência, transparência e auditoria pública |

---

## 10. Histórico de versões deste documento

| Versão | Data | Mudanças |
|---|---|---|
| v1.0 | 08/05/2026 | Versão inicial: persona, arquitetura, decisões D-001 a D-010, hipóteses, riscos |
| v1.1 | 08/05/2026 | Adoção da marca-mãe Guardian Labs (D-011); atualização da Seção 1 e do README |

---

*Documento mantido vivo durante todo o programa. Cada decisão nova é registrada com ID, data e justificativa. Revisitar suposições é parte do processo, não falha.*
