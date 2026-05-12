# -*- coding: utf-8 -*-
"""RT revision v1.7: UTF-8 cleanup + editorial fixes."""
from pathlib import Path

import ftfy

RT = Path(__file__).resolve().parents[1] / "docs" / "RT-DocumentoDeProduto.md"

CAMADA4 = """### Camada 4 — Autenticação SEP-10 (fluxo web autenticado)

Complementa as camadas 1 a 3 no **painel web** (`login.html` / `dashboard.html`): SEP-10 contra a Anchor `testanchor.stellar.org` prova posse da wallet antes de operações autenticadas no app; o registro on-chain segue via **Manage Data**. A **validação pública** do pagador (`validation.html`, **D-004**) permanece em `GET /api/validate/:codebar` **sem** login.

Tabelas de endpoints, artefatos (`lib/sep10.js`, proxies `api/sep10/*`), JWT trust-based, `sessionStorage` e coexistência com `POST /api/blockchain`: ver **D-013** (decisão + implementação) e **D-014**.

"""


def main() -> None:
    raw = RT.read_bytes()
    text = ftfy.fix_text(raw.decode("latin-1"))

    # 8 — roadmap
    text = text.replace("no roadmap futuro da Guardian Labs", "no roadmap da Guardian Labs")

    # 6 — Sprint 1 verbal
    text = text.replace(
        "A Sprint 1 do programa exige entrevistas qualificadas com a persona alvo, seguindo metodologia *Mom Test*. O roteiro completo está em `docs/entrevistas.md` e a tabulação em planilha externa.",
        "A Sprint 1 do programa exigiu entrevistas qualificadas com a persona alvo, seguindo metodologia *Mom Test*. A Sprint 2 mantém entrevistas no ritmo do hackathon. O roteiro completo está em `docs/entrevistas.md` e a tabulação em planilha externa.",
    )

    # D-010
    needle = (
        "**Por quê:** Entrega oficial da Sprint 2 exige commit no GitHub com x402 ou justificativa formal de N/A. "
        "Decisão depende do modelo de receita escolhido (D-009).\n\n### D-011"
    )
    if needle not in text:
        raise SystemExit("D-010 anchor block not found")
    text = text.replace(
        needle,
        "**Por quê:** Entrega oficial da Sprint 2 exige commit no GitHub com x402 ou justificativa formal de N/A. "
        "Decisão depende do modelo de receita escolhido (D-009).\n"
        "**Próximo passo (até 16/05/2026):** registrar neste RT, na próxima revisão, o resultado (x402 adotado ou N/A justificado) e, se aplicável, o ID da decisão correspondente.\n\n### D-011",
    )

    # D-013 decisão + Implementação Anchor
    text = text.replace(
        "acessa os fluxos de registro e consulta de boletos dentro do Boleto Guardian.",
        "acessa os fluxos de registro e gestão de boletos no painel web do Boleto Guardian (sem alterar a validação pública do pagador; D-004).",
    )
    text = text.replace(
        "**Implementação (11/05/2026):** Âncora escolhida:",
        "**Implementação (11/05/2026):** Anchor escolhida:",
    )

    # Seção 7 + hipótese + pivô (9)
    text = text.replace(
        "Estou apostando que a vergonha de ver um cliente protestado por culpa de um boleto adulterado dói o suficiente para a empresa pagar pela prevenção. "
        "Mas pode ser que não doa. Pode ser que o gestor financeiro encare como \"azar do cliente\" e siga em frente. "
        "Se for esse o caso, construí uma solução elegante para um problema que ninguém quer pagar para resolver.",
        "A equipe aposta que a vergonha de ver um cliente protestado por culpa de um boleto adulterado dói o suficiente para a empresa pagar pela prevenção. "
        "Mas pode ser que não doa. Pode ser que o gestor financeiro encare como \"azar do cliente\" e siga em frente. "
        "Se for esse o caso, o projeto terá uma solução elegante para um problema que ninguém quer pagar para resolver.",
    )
    text = text.replace(
        "- 10+ entrevistas com perguntas específicas sobre quem ressarce, quem protesta, quem assume o desgaste reputacional",
        "- 10+ entrevistas com perguntas específicas sobre quem ressarce, quem protesta, quem assume o desgaste de imagem",
    )
    text = text.replace(
        "onde o relacionamento longo aumenta a dor reputacional).",
        "onde o relacionamento longo aumenta o peso de imagem).",
    )
    text = text.replace(
        "| Empresa emissora sente dor financeira/reputacional suficiente com fraude para pagar pela prevenção | Em teste |",
        "| Empresa emissora sente dor financeira e de imagem suficiente com fraude para pagar pela prevenção | Em teste |",
    )

    # D-012 variar reputacional (uma ocorrência)
    text = text.replace(
        "(a) a fraude eventual com alto impacto reputacional e operacional,",
        "(a) a fraude eventual com alto impacto de imagem e operacional,",
        1,
    )

    # Desafio oficial — citação do nome + Anchor técnico
    text = text.replace(
        "| MVP com Âncora no Testnet | Demonstrar 1 fluxo completo do app integrado com uma âncora na testnet e evidenciar commits |",
        "| MVP com âncora na testnet (nome do desafio oficial) | Demonstrar 1 fluxo completo do app integrado com uma Anchor na testnet e evidenciar commits |",
    )

    # Camada SEP-10 ? Camada 4 (remove duplicação com D-013)
    start = text.find("### Camada SEP-10")
    end = text.find("\n---\n\n## 4. Tecnologias adotadas", start)
    if start == -1 or end == -1:
        raise SystemExit("Camada SEP-10 or section 4 header not found")
    text = text[:start] + CAMADA4.rstrip() + text[end:]

    # Histórico v1.3 linha (coerência gestão)
    text = text.replace(
        "autenticação de wallet antes dos fluxos de registro e consulta",
        "autenticação de wallet antes dos fluxos de registro e gestão no painel",
    )

    # Cabeçalho + v1.7
    import re as _re

    text = _re.sub(
        r"\*\*Última atualização:\*\* \d{2}/\d{2}/\d{4} \(v[\d.]+\)",
        "**Última atualização:** 12/05/2026 (v1.7)",
        text,
        count=1,
    )
    row_v17 = (
        "| v1.7 | 12/05/2026 | Clareza arquitetural: Seção 3 x D-013 (Camada 4 remete às decisões); "
        "validação pública vs painel SEP-10; dois endpoints de registro na Camada 2; Anchor padronizado; "
        "Seção 6 e D-010 alinhados ao calendário; Seção 7 em voz institucional; ajustes de estilo |\n"
    )
    if "| v1.6 |" not in text:
        raise SystemExit("v1.6 row missing")
    text = text.replace("| v1.6 |", row_v17 + "| v1.6 |", 1)

    RT.write_text(text, encoding="utf-8", newline="\n")
    text.encode("utf-8")
    print("OK:", RT)


if __name__ == "__main__":
    main()
