# Stellar 37° Degrees — Tarefas e Entregas

Documento vivo de tracking das entregas oficiais do programa **Stellar 37 Degrees** (NearX × Stellar Development Foundation), aplicadas ao projeto **Boleto Guardian**.

> **Período do programa:** 04 de maio a 12 de junho  
> **Time:** 4 pessoas  
> **Status atual:** Testnet, sem cliente comercial ativo  
> **Objetivo:** chegar à última etapa (Stellar Village & Pitch Night, Rio de Janeiro)

---

## Ýndice de sprints

| Sprint | Foco | Deadline | Status |
|---|---|---|---|
| [Sprint 1](#sprint-1--bootcamp) | Bootcamp · Discovery + FLG + Testnet | Sáb 09/mai 23:59 | Em andamento |
| [Sprint 2](#sprint-2--hackathon) | Hackathon · MVP + entrevistas + pitch deck | Sáb 16/mai 23:59 | A iniciar |
| [Sprint 3](#sprint-3--refinamento) | Refinamento · Segurança + monetização + grants | Sáb 23/mai 23:59 | A iniciar |
| [Sprint 4](#sprint-4--mainnet) | Mainnet · Produto vivo + 5 usuários reais | Sáb 30/mai 23:59 | A iniciar |
| [Semana de Preparação](#semana-de-preparação) | Polimento + ensaios | 01–05/jun | A iniciar |
| [Sprint 5](#sprint-5--stellar-village) | Stellar Village & Pitch Night | 09–12/jun (RJ) | A iniciar |

---

## Sprint 1 — Bootcamp

**Deadline:** Sábado, 09 de maio, 23:59

### Identificação do Produto

- [x] **Nome do produto:** Boleto Guardian
- [x] **Descrição do produto** *(2-3 frases)*  
  > Boleto Guardian é uma camada pública de autenticidade para boletos brasileiros, construída sobre a blockchain Stellar. A empresa registra cada boleto emitido na blockchain; o pagador valida em segundos digitando os 44 a 47 números impressos no próprio documento — sem app, sem cadastro. Cada boleto vira uma prova pública e imutável de autenticidade.
- [x] **Premissa mais arriscada** *(versão sincera)*  
  > Estou apostando que a vergonha de ver um cliente protestado por culpa de um boleto adulterado dói o suficiente para a empresa pagar pela prevenção. Mas pode ser que não doa. Pode ser que o gestor financeiro encare como "azar do cliente" e siga em frente. Se for esse o caso, construí uma solução elegante para um problema que ninguém quer pagar para resolver.

### Primeira Transação Testnet

- [ ] **Chave pública na Stellar Testnet**
  - Rodar `createClientAccount.js` para gerar par de chaves
  - Financiar via Friendbot
  - Registrar a chave pública (formato `G...`)
- [ ] **Hash da transação na Testnet**
  - Rodar `sendHashToAccount.js` registrando um boleto de teste
  - Capturar o hash retornado
  - Validar via Stellar Expert: `https://stellar.expert/explorer/testnet/tx/<HASH>`

### FLG e Entrevistas com Usuários

- [ ] **2 posts publicados (LinkedIn / X)**
  - **Post 1:** Anúncio de aprovação no Stellar 37 Degrees (já redigido — falta publicar)
  - **Post 2:** Aprendizado das entrevistas — *"3 coisas que aprendi falando com gestores financeiros sobre fraude em boletos"*
- [ ] **1 vídeo de entrevista com usuário**
  - Gravar entrevista em vídeo (Zoom/Meet com gravação ligada)
  - Pedir permissão de uso de trecho **logo no início**
  - Editar trecho de 30–60s com legendas
- [ ] **Link do RT** *(retweet/repost)*
  - Identificar post relevante de NearX, Stellar ou parceiro do programa
  - Fazer repost com comentário próprio
  - Capturar link público do repost
- [x] **Nome da persona alvo:** Gestor financeiro / controller / dono de PME brasileira que emite boletos em volume
- [x] **Cargo da persona alvo:** CFO, gerente financeiro, controller, analista de contas a receber, ou dono em empresa de pequeno/médio porte
- [x] **Dor específica da persona alvo:**
  > Cliente protestado em cartório por causa de boleto adulterado. Cliente perdeu dinheiro pagando boleto fraudado, ficou com nome sujo, culpa a empresa pelo prejuízo, a empresa perde o cliente para sempre, e o golpista nunca é responsabilizado.

### Entregáveis adicionais (auto-impostos)

- [ ] Realizar **5 entrevistas qualificadas** (mínimo) com persona alvo — registrar na planilha `BoletoGuardian_Entrevistas_Tabulacao.xlsx`
- [ ] Atualizar `docs/entrevistas.md` no GitHub com versão Mom Test
- [ ] Confirmar URL pública estável da demo no Vercel
- [ ] Definir papéis informais entre os 4 membros do time (decisor, dev, produto, negócio)

---

## Sprint 2 — Hackathon

**Deadline:** Sábado, 16 de maio, 23:59  
**Esta sprint é decisiva** — desempenho aqui define acesso a mentoria 1:1 e prêmios.

### MVP com Âncora no Testnet

- [ ] **Vídeo Loom do fluxo completo** *(2–3 min)*
  - Roteiro:
    1. Abertura (15s) — apresentação pessoal e do produto
    2. Cena 1 (45s) — empresa emitindo boleto (Protheus / API)
    3. Cena 2 (30s) — Stellar Expert confirmando registro
    4. Cena 3 (45s) — pagador validando com os 44 a 47 dígitos
    5. Fechamento (15s) — call to action
  - Ferramenta: Loom (gratuito, 5 min limite por vídeo)
- [ ] **3 commits no GitHub** *(no mínimo, evolução real do código)*
  - Sugestões de evolução: dashboard de métricas, validação por QR, polimento da página de validação

### Entrevistas com Usuários

- [ ] **3 vídeos de entrevistas com usuários** *(soma com o 1 da Sprint 1 = 4 totais)*
  - Sempre gravar com permissão de uso de trecho
  - Editar trechos curtos (30–60s) destacando frases-chave
  - Idealmente: 1 entrevista revelando dor real específica + frase impactante

### Integração x402

- [ ] **Commit no GitHub com protocolo x402** *(ou justificativa de N/A)*
  - x402 é o protocolo HTTP de pagamento da Coinbase (2024) — permite cobrar por uso de API via crypto direto no header
  - **Decisão pendente:** implementar (vira diferencial técnico) OU justificar N/A documentando por que o modelo de receita atual não se beneficia
  - Se for justificativa de N/A, escrever `docs/x402-evaluation.md` com análise honesta

### Entrega Final do Hackathon

- [ ] **URL da demo ao vivo** *(Vercel pública, estável)*
- [ ] **Vídeo do produto** *(pode ser o próprio Loom, ou versão refinada)*
- [ ] **Pitch deck (5 slides)**
  - Slide 1 — Hook + problema
  - Slide 2 — Solução (com captura da demo)
  - Slide 3 — Diferencial técnico (Manage Data, custo, velocidade)
  - Slide 4 — Tração e mercado (4 bi boletos/ano, R$ 25-29 bi em fraude)
  - Slide 5 — Time + ask
- [ ] **3 posts nas redes sociais** *(soma com os 2 da Sprint 1 = 5 posts até aqui)*
  - Possíveis temas: bastidores do hackathon, aprendizado técnico de Stellar, depoimento de entrevistado

---

## Sprint 3 — Refinamento

**Deadline:** Sábado, 23 de maio, 23:59

### Auditoria de Segurança

- [ ] **Documentar 1 vulnerabilidade crítica encontrada e corrigida**
  - Possíveis pontos de auditoria:
    - Gestão da chave privada no servidor (rotação? HSM/Secret Manager?)
    - Validação de entrada na API (sanitização do `codebar` recebido)
    - Idempotência da operação Manage Data (e se cair entre Protheus e Stellar?)
    - Rate limiting na API pública
    - Exposição de dados sensíveis em logs
  - Documentar em `docs/security-audit.md` com: descrição da vulnerabilidade, severidade, correção aplicada, data

### Modelo de Monetização e Posicionamento

- [ ] **Descrição do modelo de receita**
  - Opções a avaliar:
    - SaaS por boleto registrado (R$ 0,05–0,30 com tier de volume)
    - Mensalidade fixa por empresa
    - Setup + recorrente
    - x402 pay-per-use via API
  - Documentar critério de escolha + tabela de pricing inicial
- [ ] **Documento de posicionamento de mercado**
  - Tabela comparativa: Boleto Guardian vs. DDA vs. antifraude bancário vs. SEC/Serpro
  - Mapa de ICP (Ideal Customer Profile)
  - Mensagem-âncora de posicionamento

### Demos com Usuários Reais

- [ ] **2 demos por screen-share (Zoom/Meet)** *(usuários reais, prospects, não amigos)*
  - Capturar reação, perguntas, objeções
  - Cada demo termina com pergunta direta: *"Você toparia testar isso na sua empresa em junho?"*
- [ ] **1 post com insight** *(do que foi aprendido nas demos)*

### Rascunho de Aplicação SCF / Instawards

- [ ] **Rascunho da aplicação para grant**
  - SCF (Stellar Community Fund): fundo da Stellar Foundation
  - Instawards: prêmio rápido para projetos do ecossistema
  - Aproveitar briefing recebido na Sprint 3 (sexta 22/mai)

---

## Sprint 4 — Mainnet

**Deadline:** Sábado, 30 de maio, 23:59  
**Esta é a sprint mais difícil — exige clientes reais.**

### Produto ao Vivo na Mainnet

- [ ] **URL do produto ao vivo na Stellar Mainnet**
  - Migrar conta da empresa demo para mainnet
  - Configurar HSM ou Secret Manager para chave privada
  - Financiar conta com XLM mínimo necessário
  - Atualizar API para usar Horizon mainnet em produção
  - Manter testnet como ambiente de homologação

### Materiais de Apresentação

- [ ] **Pitch deck (7 slides)** *(evolução do deck de 5 slides da Sprint 2)*
  - Slides adicionados: tração detalhada, modelo de receita expandido, roadmap
- [ ] **Landing page** *(transformar boletoguardian.xyz em LP de venda, não site institucional)*
  - Hero com proposta clara
  - Social proof (5 clientes / casos)
  - Demo embutida ou vídeo
  - CTA único: marcar demo ou começar piloto
- [ ] **README no GitHub** *(reformulação para parecer projeto vivo, não MVP)*

### 5 Usuários Reais na Mainnet 🚨

- [ ] **5 chaves públicas de wallets reais com atividade**
  - **Esta é a entrega mais difícil do programa inteiro**
  - Significa 5 empresas reais usando o Boleto Guardian em mainnet
  - Não basta abrir 5 contas — precisa ter atividade (registros reais de boleto)
  - Estratégia: começar prospecção comercial **AGORA** (Sprint 1), não esperar Sprint 4

### GTM e Logística do Village

- [ ] **Hash de transação na Mainnet** *(comprovante de produção real)*
- [ ] **Plano GTM** *(go-to-market formal)*
  - Canais de aquisição (parcerias com ERP, outbound direto, conteúdo)
  - Funil de conversão
  - CAC vs. LTV estimado
- [ ] **Confirmação de viagem** *(Stellar Village, Rio de Janeiro)*
  - Decisão pessoal: ao menos 1 membro do time precisa estar fisicamente presente
  - Resolver passagem, hospedagem, custos
- [ ] **Aplicação SCF/Instawards** *(versão final, submetida)*

---

## Semana de Preparação

**Período:** 01 a 05 de junho

### Polimento

- [ ] Pitch final em inglês — 5 minutos com Q&A simulado
- [ ] Backup de demo (vídeo gravado caso live falhe)
- [ ] Materiais físicos para o Village (cartões, banner se aplicável)
- [ ] Lista de 30+ pessoas-alvo para abordar no Village
- [ ] Briefing interno do time: papéis e responsabilidades durante o evento

---

## Sprint 5 — Stellar Village

**Período:** 09 a 12 de junho · Rio de Janeiro

### Apresentação e Networking

- [ ] Pitch final ao vivo no Village
- [ ] Demo ao vivo no estande / encontros 1:1
- [ ] Networking direcionado: 30+ contatos qualificados
- [ ] Captura de leads em planilha em tempo real
- [ ] Follow-up por e-mail dentro de 24h após cada conversa
- [ ] Conteúdo nas redes durante o evento (LinkedIn, X)
- [ ] Reunião diária de retrô interna do time (15min ao final do dia)

---

## Pipeline transversal — não é tarefa de uma sprint só

Estas atividades atravessam todas as 5 semanas e devem ter ritmo contínuo:

- **Prospecção comercial diária** — meta: 1 conversa nova por dia útil
- **Engajamento no Discord oficial** da NearX — perguntas inteligentes em público chamam atenção de mentores
- **Treino de pitch oral em inglês** — gravar áudio diariamente, evoluir versão semanalmente
- **Posts FLG no LinkedIn / X** — meta mínima: 2 posts por semana, foco em DM gerada (não like)

---

## Decisões pendentes que precisam ser tomadas

- [ ] **Implementar x402 ou justificar N/A?** *(decisão da Sprint 2 — afeta arquitetura)*
- [ ] **Qual modelo de receita seguir como hipótese principal?** *(decisão da Sprint 3)*
- [ ] **Quem do time vai ao Stellar Village no Rio?** *(decisão até Sprint 4)*
- [ ] **Aplicar para SCF, Instawards ou ambos?** *(decisão da Sprint 3)*
- [ ] **Substituir ou manter nome "Boleto Guardian"?** *(decisão tomada — manter)*

---

## Riscos críticos a mitigar

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Não conseguir 5 pilotos reais até 30/mai | Alta | Crítico | Iniciar prospecção na Sprint 1, oferecer piloto gratuito 30-60 dias |
| Pitch em inglês fraco no Village | Média | Crítico | Treinar oral desde Sprint 1, gravar e revisar, buscar feedback de nativos |
| Hackathon mal sucedido (Sprint 2) | Média | Alto | Definir entregável único e claro, polir 1 coisa em vez de refazer tudo |
| Demo quebrar ao vivo no Village | Média | Alto | Backup em vídeo, testar 24h antes |
| Migração mainnet com problemas de chave | Baixa | Crítico | HSM ou Secret Manager, nunca commitar chave, backup separado |

---

*Documento mantido vivo durante o programa. Atualizar checkboxes ao concluir tarefas, e adicionar novos itens conforme briefings das masterclasses semanais.*
