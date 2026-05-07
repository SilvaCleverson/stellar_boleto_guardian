# Guia de Entrevistas — Boleto Guardian

Roteiro de **descoberta de mercado** com potenciais usuários. Não é um script — é uma âncora para garantir que todas as conversas cobrem os mesmos pontos críticos e permitem comparação entre entrevistas.

**Princípio orientador:** este guia segue os fundamentos do *Mom Test* (Rob Fitzpatrick). Perguntas focam em **comportamento passado** (o que já aconteceu, o que já fizeram) e evitam **opiniões hipotéticas** (o que fariam, o que pagariam) — porque pessoas mentem por educação sobre futuro, mas contam fatos sobre o passado.

**Perfil-alvo:** CFO, gerente financeiro, controller, analista de contas a receber ou dono de empresa de pequeno e médio porte que emitem boletos em volume — preferencialmente via Protheus, Sankhya, Omie, ContaAzul ou sistemas equivalentes.

**Duração estimada:** 25–35 min  
**Formato:** conversa aberta, não apresentação. **A solução não deve ser descrita até o final da entrevista, e idealmente nem ali.**

---

## Regra de ouro

Se durante a entrevista o entrevistado perguntar *"o que você está construindo?"*, a resposta correta é:

> "Estou ainda explorando. Por isso essa pesquisa. Posso te contar com mais detalhes depois que terminar essa rodada — agora estou aqui pra ouvir, não pra te vender nada."

**Por quê:** se a solução é descrita antes da dor ser mapeada, o entrevistado passa a responder pra agradar ou pra evitar parecer ignorante. Os dados ficam contaminados e não são confiáveis para decisão de produto.

---

## Setup da entrevista

> "[Nome], obrigado pelo tempo. Vou te avisar de um truque dessa conversa: eu **não** vou te mostrar o que estou construindo. Quero te ouvir sobre como vocês operam hoje, e qualquer reclamação ou frustração que você tiver é exatamente o que eu preciso ouvir. Posso gravar pra não esquecer nada?"

---

## Perguntas base

### 1. Contexto operacional (~5 min)

1. Pode me contar rapidamente o que a empresa faz e qual o seu papel?
2. Quantos boletos vocês emitem por mês, mais ou menos?
3. Como esses boletos são gerados no dia a dia? Quem cuida do processo?
4. Tem algum sistema envolvido nisso? *(deixar ele dizer o nome — não sugerir)*

---

### 2. Dor real, com data e nome (~10 min — coração da entrevista)

5. Vocês já tiveram algum problema com boleto que deu trabalho — fraude, cliente reclamando, dado errado, qualquer coisa? Pode me contar a última vez que isso aconteceu?

   *Se ele contar uma história, mergulhe:*
   - Quando foi mais ou menos?
   - Como você ficou sabendo?
   - Qual foi o valor envolvido?
   - O que aconteceu com o cliente?
   - O que vocês fizeram a respeito?
   - Quem ficou no prejuízo no fim?

   *Se ele disser "nunca aconteceu":*
   - Você conhece alguma empresa parecida com a sua que passou por isso?
   - Quando um cliente liga reclamando de boleto, o que costuma ter acontecido?

6. Cliente seu já te ligou pedindo pra confirmar se um boleto era verdadeiro? Por que ele perguntou?

7. Vocês já tiveram cliente protestado por causa de problema com boleto — fraude, erro de processamento, qualquer coisa do tipo?

---

### 3. O que já tentaram fazer (~8 min — separa dor real de reclamação genérica)

8. Vocês já fizeram alguma coisa pra reduzir esse tipo de problema? Mudaram processo, contrataram alguém, compraram algum sistema?

9. Algum fornecedor já te procurou oferecendo solução pra isso? Como foi essa conversa? Por que vocês não fecharam?

10. Quanto tempo a equipe de vocês gasta lidando com problema de boleto — atendimento, conferência, retrabalho, ressarcimento?

11. Alguém na empresa já calculou quanto custa pra vocês esse tipo de incidente?

---

### 4. Modelo mental de risco (~5 min — testa a hipótese mais arriscada do produto)

12. Quando rola uma fraude desse tipo, na sua cabeça e na prática real, **de quem é a responsabilidade?**

13. Vocês já tiveram que ressarcir cliente, mesmo sem obrigação legal direta?

14. Da última vez que vocês contrataram um sistema ou serviço novo nesse tipo de área, como foi a decisão? Quem deu o OK final?

---

### 5. Encerramento (~2 min)

15. Tem algo sobre esse assunto que você acha que eu deveria saber e que eu não te perguntei?

16. Você conhece alguém que sente ainda mais essa dor que você? Posso te pedir uma apresentação?

17. Posso voltar a conversar daqui a 30 dias quando eu tiver evoluído um pouco mais?

---

## Por que este roteiro evita perguntas comuns mas perigosas

Algumas perguntas que **parecem boas mas geram dados falsos** foram intencionalmente removidas:

| Pergunta evitada | Por que foi removida |
|---|---|
| *"Se existisse uma solução X, isso resolveria seu problema?"* | Hipotética — entrevistado responde por educação, não por verdade |
| *"Quanto você pagaria por isso?"* | Pessoas superestimam disposição a pagar quando não há cobrança real |
| *"Você usaria uma ferramenta que faz Y?"* | Mesma armadilha — gera "sim" educado, não compromisso |
| *"Você acha que fraude de boleto é um problema grande?"* | Sugestiva, vai gerar "sim" automático, sem informação |
| *"O cliente ligou ou o banco avisou?"* | Múltipla escolha disfarçada limita a resposta natural |

A regra é: **substituir perguntas sobre o futuro por perguntas sobre o passado.** Em vez de *"se existisse X você usaria?"*, perguntar *"da última vez que esse problema apareceu, o que você fez?"*.

---

## Template de registro pós-entrevista

Preencher logo após cada conversa, idealmente nos primeiros 15 minutos enquanto a memória está fresca.

```
Data:
Entrevistado: [cargo, setor, tamanho da empresa — sem nome/empresa por LGPD]
Duração:

== Contexto ==
Volume de boletos/mês:
Sistema usado:                   [Protheus / Sankhya / Omie / Outro / Manual]
Cargo do entrevistado:           [Decisor / Operador / Influenciador]

== Dor ==
Já teve fraude/problema?         [Sim / Não / Conhece quem teve]
Frequência (se sim):             [Único / Recorrente / Frequente]
Como descobriu:                  [Cliente ligou / Banco / Extrato / Outro]
Valor estimado do prejuízo:      [R$ ___ / Não sabe]
Tempo gasto resolvendo:          [Horas / Dias]
Quem ficou com o prejuízo:       [Empresa / Cliente / Dividido]

== Comportamento atual ==
Já tentou resolver de alguma forma?   [Detalhar]
Já avaliou fornecedor antes?          [Sim/Não — por que não fechou]
Cliente já pediu pra confirmar?       [Sim/Não]    (? testa adoção pelo pagador)
Já protestou cliente por boleto?      [Sim/Não]    (? testa dor reputacional)
Já ressarciu cliente sem obrigação?   [Sim/Não]    (? testa "free rider problem")

== Decisão ==
Decisor de compra (cargo/nome se possível):

== Sinais subjetivos ==
Citação literal mais forte: "_____________________________________"
Energia ao falar do problema:    [Frustrado / Resignado / Indiferente]
Sinal de mercado (1-5):          [minha leitura subjetiva]

== Próximos passos ==
Vai me apresentar a alguém:      [Sim/Não — quem]
Próxima conversa marcada:        [Sim/Não — quando]

== Insights inesperados ==
[Coisas que ele disse que mudaram minha forma de ver o produto]
```

---

## Análise pós-rodada

Após cada bloco de 5 entrevistas, revisar:

- **Padrões de dor:** que problema apareceu em quantas entrevistas?
- **Padrões de comportamento:** o que as pessoas tentam fazer hoje? Funciona?
- **Validação ou refutação da hipótese mais arriscada:** o emissor enxerga isso como problema dele, ou como problema do cliente?
- **Sinais de prontidão para piloto:** quem deu indicação real de querer participar de teste?
- **Decisores reais:** quem aparece consistentemente como quem aprova compra?

Se 4 em 5 entrevistas mostram que o emissor **não** considera fraude um problema dele, a hipótese mais arriscada está sendo refutada e o produto precisa de pivot na proposta de valor (talvez vender ao pagador via banco/parceiro, ou talvez achar outro segmento).

---

## Consolidado de entrevistas

| # | Data | Cargo | Setor | Vol/mês | Sistema | Fraude? | Já ressarciu? | Decisor | Insight principal |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|   |   |   |   |   |   |   |   |   |   |
|   |   |   |   |   |   |   |   |   |   |

---

*Este guia é um documento vivo. Após cada bloco de entrevistas, revisar e ajustar perguntas que não estão gerando aprendizado, e adicionar perguntas que se mostraram úteis.*