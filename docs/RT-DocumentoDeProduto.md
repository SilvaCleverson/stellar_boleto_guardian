# RT — Documento de Produto

**Projeto:** Boleto Guardian
**Programa:** Stellar 37 Degrees (NearX × Stellar Development Foundation)
**Mantido por:** Equipe Guardian
**Última atualização:** 12/05/2026 (v1.7)

---

## Sobre este documento

Este é o **Documento de Produto** (RT — *Record of Thinking*) do Boleto Guardian. Ele consolida em um único lugar **todas as decisões importantes** já tomadas sobre o produto: o que está sendo construído, para quem, como, com quais tecnologias, e por quais motivos.

É atualizado a cada nova decisão, aprendizado ou pivô. O histórico de mudanças é preservado pelos commits do GitHub.

> **Princípio:** decisões são registradas com a justificativa que as motivou no momento. Quando uma decisão é revertida, a anterior **não é apagada** — é marcada como obsoleta com a nova decisão abaixo. Isso preserva a memória do raciocínio e permite revisitar suposições.

---

## 1. O que está sendo ofertado

O **Boleto Guardian** é o primeiro produto da **Guardian Labs** — uma marca-mãe que constrói infraestrutura pública de autenticidade para as chaves que movem dinheiro no Brasil. Outros instrumentos de pagamento brasileiros estão no roadmap da Guardian Labs.

O **Boleto Guardian** é uma camada pública de autenticidade para boletos brasileiros, construída sobre a blockchain Stellar.

A empresa emissora registra cada boleto emitido na blockchain Stellar, e o pagador valida em segundos digitando os 47 números do próprio documento — sem app, sem cadastro, sem conhecimento técnico.

Cada boleto vira uma prova pública e imutável de autenticidade, auditável por qualquer pessoa, a qualquer momento, sem depender de banco, cartório ou intermediário.

Para o MVP do hackathon, o Boleto Guardian também passa a demonstrar integração com uma Anchor existente da Stellar Testnet por meio de SEP-10 (Stellar Web Authentication), usando autenticação de wallet antes dos fluxos de **registro e gestão** de boletos no **painel web** da empresa (login SEP-10). Isso não altera a validação pública do pagador (D-004: `validation.html` e `GET /api/validate/:codebar` permanecem sem login).

A camada de autenticidade do Boleto Guardian opera em duas dimensões: (a) cada boleto é registrado publicamente na blockchain Stellar pela empresa emissora e (b) o acesso aos fluxos de **registro e gestão** no aplicativo web (painel) é autenticado via SEP-10 contra uma Anchor consolidada da Stellar Testnet (`testanchor.stellar.org`), provando posse da wallet antes de escrita on-chain pelos fluxos autenticados. O Boleto Guardian **não atua como Anchor** — atua como *relying party* da Anchor existente, aproveitando a infraestrutura de identidade já estabelecida no ecossistema Stellar.

---

## 2. Para quem é

### Persona alvo · Camila

**Quem é Camila:**
Camila tem entre 35 e 42 anos. É Gerente Financeira ou Controller em uma PME brasileira (R$ 10M – R$ 500M de faturamento), atuando em indústria, comércio B2B ou serviços recorrentes. Lidera uma equipe pequena, reporta ao CFO ou diretamente ao dono da empresa. A empresa emite mais de 1.000 boletos por mês, geralmente via Protheus, Sankhya ou Omie.

| Atributo | Definição |
|---|---|
| **Nome** | Camila (nome representativo — 95% das pessoas entrevistadas para o discovery são mulheres entre 25-45 anos) |
| **Idade** | 35-42 anos |
| **Cargo** | Gerente Financeira / Controller / Coordenadora Financeira |
| **Empresa** | PME brasileira, R$ 10M – R$ 500M de faturamento |
| **Setor** | Indústria, comércio B2B, serviços recorrentes |
| **Sistema** | Protheus, Sankhya, Omie ou ERP equivalente |
| **Volume** | 1.000+ boletos emitidos por mês |

**As duas dores da Camila:**

**Dor 1 — A descoberta tardia da fraude.**
A empresa de Camila emite o boleto e envia ao cliente. Tempo passa. O cliente não aparece como pago no sistema. Camila aciona a cobrança — primeiro por contato amigável, depois por carta, e em última instância protesta em cartório. É nesse momento que o cliente liga indignado, com comprovante de pagamento em mãos. Aí se descobre: o cliente pagou, mas pagou um boleto adulterado. O dinheiro foi para a conta de um criminoso. A empresa nunca recebeu. O cliente — que acreditava ter quitado a dívida — foi protestado em cartório por culpa de uma fraude que ele não cometeu.

A fraude é técnica do golpista, mas é Camila quem precisa:

- Explicar à diretoria a perda do cliente
- Mediar a crise com o cliente lesado, mesmo sem culpa formal
- Reverter o protesto em cartório (quando ainda dá tempo)
- Justificar o tempo da equipe gasto resolvendo o caso
- Aguentar a percepção, dentro e fora da empresa, de que "a empresa não protege seus clientes"

**Dor 2 — A operação diária da desconfiança.**
Mesmo quando não há fraude, Camila e sua equipe gastam horas todos os dias atendendo clientes desconfiados:

- Clientes que ligam para confirmar se o boleto recebido é mesmo da empresa
- Clientes que pedem reenvio do boleto por outro canal "para ter certeza"
- Clientes que questionam pequenas diferenças visuais no documento
- Clientes que pagam com atraso porque ficaram inseguros e foram conferir antes

Cada chamada é curta, mas o volume é diário. O custo não é uma fraude pontual — é **o atrito permanente de operar em um sistema onde o pagador não tem como verificar a autenticidade do que recebeu**.

Camila não escolhe entre as duas dores. Ela vive as duas ao mesmo tempo: a fraude eventual com impacto alto, e a desconfiança operacional com impacto contínuo.

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

                          Painel web (SEP-10)
                          login.html / dashboard.html
```

Para o MVP do hackathon, a arquitetura inclui uma integração complementar com uma Anchor existente da Stellar Testnet via SEP-10. A Anchor autentica a wallet no fluxo do painel; o registro imutável dos boletos continua sendo feito pelo Boleto Guardian via Manage Data na conta Stellar da empresa emissora. Resumo da superfície SEP-10 na **Camada 4** abaixo; implementação completa em **D-013** / **D-014**.

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
| `POST /api/blockchain` | Registra um boleto via Manage Data; **rota legada/admin** (ex.: Protheus com chave de serviço), **sem** Bearer SEP-10 |
| `POST /api/boleto/register` | Registro pelo fluxo web autenticado; exige `Authorization: Bearer <sep10-jwt>`; detalhes em **D-013** |
| `GET /api/validate/:codebar` | Consulta pública de autenticidade pelos 47 dígitos (pagador; sem login; D-004) |
| `GET /api/account/:id/data` | Lista boletos registrados por uma conta (uso operacional; conforme implantação) |

A página pública de validação (`validation.html`) consome o endpoint `validate/:codebar` para que o pagador final confira o boleto sem cadastro. O painel (`dashboard.html`) usa os endpoints SEP-10 e `POST /api/boleto/register` descritos em **D-013**.

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

### Camada 4 — Autenticação SEP-10

Implementada em 11/05/2026 como parte do MVP do hackathon Sprint 2. O Boleto Guardian **não atua como Anchor** — consome `testanchor.stellar.org` (Anchor oficial da SDF na Testnet) como *relying party*, via proxy no backend para evitar restrições CORS no browser. A chave privada do usuário é usada apenas em memória no browser para assinar o challenge e descartada imediatamente após a assinatura. JWT armazenado em `sessionStorage` (escopo de aba). Implementação completa (endpoints, frontend, biblioteca e decisões de proxy) em **D-013** e **D-014**.

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

### D-012 · Persona alvo nomeada como Camila

**Data:** 08/05/2026
**Decisão:** Adotar "Camila" como nome representativo da persona alvo do Boleto Guardian — Gerente Financeira / Controller de PME brasileira, mulher entre 35-42 anos. A dor da Camila tem duas dimensões: (a) a fraude eventual com alto impacto reputacional e operacional, descoberta apenas quando o protesto/cobrança revela que o cliente já tinha pago um boleto adulterado; e (b) o atrito diário da operação atendendo clientes desconfiados que ligam para confirmar autenticidade ou pedir reenvio.
**Por quê:** Em discovery inicial (Sprint 1), 95% das pessoas entrevistadas correspondendo ao perfil-alvo são mulheres entre 25-45 anos atuando em gestão financeira. O nome "Camila" foi escolhido por sua frequência demográfica na faixa etária (pico de nomes registrados entre 1985-2000), por funcionar em pitch internacional (pronúncia natural em inglês), e por reduzir a abstração no discurso interno do time e em pitch — em vez de "gestor financeiro de PME", o time passa a falar "a Camila". A separação entre dor pontual (fraude descoberta tardiamente) e dor contínua (atendimento de desconfiança) é importante porque cada uma sustenta uma proposta de valor diferente: a primeira é argumento de risco; a segunda é argumento de eficiência operacional.

### D-013 · Integração com Anchor existente via SEP-10

**Data:** 11/05/2026
**Decisão:** O Boleto Guardian passa a integrar uma Anchor existente da Stellar Testnet usando **SEP-10 (Stellar Web Authentication)** para autenticação de wallet. O usuário autentica sua wallet por meio de um challenge SEP-10 emitido pela Anchor, assina esse challenge, recebe uma sessão autenticada e, a partir daí, acessa os fluxos de registro e consulta de boletos dentro do Boleto Guardian.
**Por quê:** SEP-10 permite demonstrar interoperabilidade real com o ecossistema Stellar ao provar controle sobre uma conta Stellar antes de executar ações no aplicativo. Essa autenticação fortalece o MVP do hackathon porque conecta o Boleto Guardian a uma Anchor da Testnet sem alterar sua função principal: registrar e validar boletos com evidência pública via Manage Data. SEP-12 poderá ser avaliado futuramente para KYC/KYB complementar, caso o produto precise associar a wallet autenticada a dados cadastrais da empresa emissora.

**Implementação (11/05/2026):** Anchor escolhida: `testanchor.stellar.org` (Anchor oficial da SDF na Testnet, endpoint `https://testanchor.stellar.org/auth`). O Boleto Guardian **não atua como Anchor** — consome a Anchor existente via proxy no backend para evitar restrições CORS no browser. Chave privada do usuário é usada apenas em memória no browser para assinar o challenge e descartada imediatamente após a assinatura. JWT armazenado em `sessionStorage` (escopo de aba, não persiste entre sessões).

| Arquivo | Função |
|---|---|
| `lib/sep10.js` | Biblioteca utilitária central: `getChallenge()`, `exchangeToken()`, `validateAnchorJwt()` |
| `api/sep10/challenge.js` | `GET /api/sep10/challenge?account=G...` — proxy para `testanchor.stellar.org/auth` |
| `api/sep10/token.js` | `POST /api/sep10/token` — proxy para troca de XDR assinado por JWT |
| `api/sep10/verify.js` | `POST /api/sep10/verify` — valida JWT e retorna `{ valid, account, anchor, exp }` |
| `api/boleto/register.js` | `POST /api/boleto/register` — exige `Authorization: Bearer <sep10-jwt>`; usa `COMPANY_SECRET` server-side para assinar a transação Stellar |
| `web/login.html` | Fluxo SEP-10 de 4 etapas: Carteira → Assinatura → Token JWT → Painel |
| `web/dashboard.html` | Painel autenticado; usa JWT do `sessionStorage` como Bearer token; auto-logout em HTTP 401 |

Validação JWT: trust-based — verifica `iss === 'testanchor.stellar.org'`, expiração e formato do `sub` (endereço G de 56 chars). Sem necessidade do segredo de assinatura da Anchor. Compatibilidade retroativa: `api/blockchain.js` existente não foi alterado; integração Protheus/ERP continua funcionando via chave de admin.

### D-014 · Padrão de proxy SEP-10 e validação JWT por confiança

**Data:** 11/05/2026
**Decisão:** Implementar o fluxo SEP-10 usando o Boleto Guardian como **proxy reverso** para `testanchor.stellar.org`, evitando restrições CORS no browser. A validação do JWT emitido pela Anchor usa abordagem **trust-based** — verificando `iss`, `exp` e formato do `sub` — sem necessidade do segredo de assinatura da Anchor. O JWT é armazenado em `sessionStorage` (escopo de aba, não persiste entre sessões) para reduzir exposição em caso de XSS por scripts de terceiros.
**Por quê:** (1) O browser não pode chamar `testanchor.stellar.org` diretamente por restrições CORS — o proxy no backend (`api/sep10/challenge.js` e `api/sep10/token.js`) resolve sem comprometer a experiência do usuário e sem expor a URL da Anchor no frontend. (2) A validação trust-based é adequada porque o campo `iss` identifica unicamente a Anchor de confiança e o `sub` confirma a carteira autenticada; obter o segredo de assinatura exigiria acesso privilegiado não fornecido por design pelo `testanchor.stellar.org`. (3) `sessionStorage` é preferível a `localStorage` porque isola a sessão por aba — se o usuário fechar a aba o token expira automaticamente, reduzindo a janela de exposição. (4) A chave privada da carteira é usada apenas em memória no browser para assinar o challenge e descartada imediatamente após a assinatura — nunca armazenada, nunca enviada ao servidor.

### D-015 · Identidade visual no site e alinhamento com o RT

**Data:** 12/05/2026
**Decisão:** Adotar o logotipo oficial do Boleto Guardian (arquivos em `docs/logo/`, cópia servida em `web/assets/brand/`) no cabeçalho das páginas públicas (`index*.html`, `validation*.html`, `login.html`, `dashboard.html`) e atualizar a paleta CSS para refletir o selo: azul-marinho **#0B1F3A**, azul **#1A7FD4** e destaque **#F4C842** (conforme SVG do logo). O conteúdo do whitepaper/landing em PT, EN e ES passa a mencionar explicitamente **Guardian Labs**, o posicionamento de infraestrutura pública de autenticidade, a persona **Camila** (duas dores), **SEP-10** com `testanchor.stellar.org` e link para o fluxo do painel.
**Por quê:** (1) D-011 já consolidou Guardian Labs como marca-mãe — o site precisava refletir isso visual e textualmente. (2) Cores do logo substituem a paleta genérica "Stellar teal" para reforçar reconhecimento de marca e coerência com materiais gráficos. (3) Visitantes internacionais e investidores (Sprint 4 / Village) enxergam em uma tela produto, holding e prova técnica (47 dígitos + SEP-10) alinhados ao RT.

---

## 6. Pesquisa em curso (entrevistas e descobertas)

A Sprint 1 do programa exigiu entrevistas qualificadas com a persona alvo, seguindo metodologia *Mom Test*. O roteiro completo está em `docs/entrevistas.md` e a tabulação em planilha externa.

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

### Atualização de andamento · 11/05/2026

A Sprint 1 — Bootcamp foi finalizada com sucesso. As três entregas avaliadas no painel do programa foram aprovadas:

- Identificação do Produto
- Primeira Transação Testnet
- FLG e Entrevistas com Usuários

A Sprint 2 — Hackathon começa em 11/05/2026 com quatro desafios oficiais:

| Desafio | Entrega exigida |
|---|---|
| MVP com Âncora no Testnet | Demonstrar 1 fluxo completo do app integrado com uma âncora na testnet e evidenciar commits |
| Entrevistas com Usuários | Realizar 3 entrevistas gravadas validando as dores e a proposta de valor do produto |
| Integração x402 | Implementar o protocolo x402 no produto, se aplicável ao modelo de negócio; caso contrário, registrar justificativa de N/A |
| Entrega Final do Hackathon | Submissão completa do MVP com demo ao vivo, vídeo do produto, pitch deck de 5 slides e posts de divulgação |

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
| Dependência de Anchor externa na Testnet para autenticação SEP-10 | Média | Médio | Escolher Anchor de referência estável; isolar a integração em módulo próprio; manter fallback documentado para troca de Anchor; deixar claro que a Anchor autentica a wallet, mas não registra boletos |

---

## 10. Histórico de versões deste documento

| Versão | Data | Mudanças |
|---|---|---|
| v1.0 | 08/05/2026 | Versão inicial: persona, arquitetura, decisões D-001 a D-010, hipóteses, riscos |
| v1.1 | 08/05/2026 | Adoção da marca-mãe Guardian Labs (D-011); atualização da Seção 1 e do README |
| v1.2 | 08/05/2026 | Persona alvo nomeada como Camila (D-012); Seção 2 reescrita com narrativa correta das duas dores |
| v1.3 | 11/05/2026 | Integração com Anchor existente via SEP-10 (D-013); arquitetura atualizada para autenticação de wallet antes dos fluxos de registro e consulta |
| v1.4 | 11/05/2026 | Sprint 1 marcada como finalizada com sucesso; Seção 8 atualizada com os quatro desafios oficiais da Sprint 2 — Hackathon |
| v1.5 | 11/05/2026 | SEP-10 implementado end-to-end (D-013, D-014): `lib/sep10.js`, endpoints proxy `challenge`/`token`/`verify`, `web/login.html` (4 etapas), `web/dashboard.html` autenticado, `POST /api/boleto/register` exigindo Bearer JWT; Seção 1 corrigida — Boleto Guardian é *relying party* de `testanchor.stellar.org`, **não** Anchor |
| v1.6 | 12/05/2026 | Identidade visual no site: logo em `web/assets/brand/`, paleta #0B1F3A / #1A7FD4 / #F4C842; whitepaper PT/EN/ES e fluxos web alinhados ao RT (Guardian Labs, Camila, SEP-10, link painel); decisão D-015 |
| v1.7 | 12/05/2026 | Arquitetura: Camada 4 (SEP-10) adicionada à Seção 3; tabela de endpoints distingue rota legada `/api/blockchain` de rota autenticada `/api/boleto/register`; D-013 expandida com tabela de arquivos e detalhes de implementação; D-014 adicionada (proxy SEP-10, validação JWT trust-based); Seção 1 reescrita para deixar explícito que o Boleto Guardian é *relying party*, não Anchor; voz da Seção 7 ajustada para primeira pessoa direta |

---

*Documento mantido vivo durante todo o programa. Cada decisão nova é registrada com ID, data e justificativa. Revisitar suposições é parte do processo, não falha.*
