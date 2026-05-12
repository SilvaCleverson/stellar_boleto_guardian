"""Converte RT-DocumentoDeProduto.md para UTF-8 e aplica revisão editorial (v1.7)."""
from __future__ import annotations

import re
from pathlib import Path

import ftfy

ROOT = Path(__file__).resolve().parents[1]
RT = ROOT / "docs" / "RT-DocumentoDeProduto.md"


def main() -> None:
    raw = RT.read_bytes()
    text = ftfy.fix_text(raw.decode("latin-1"))

    # --- 8. roadmap pleonasmo ---
    text = text.replace("no roadmap futuro da Guardian Labs", "no roadmap da Guardian Labs")

    # --- 6. Sprint 1 tempo verbal ---
    text = text.replace(
        "A Sprint 1 do programa exige entrevistas qualificadas com a persona alvo",
        "A Sprint 1 do programa exigiu entrevistas qualificadas com a persona alvo",
    )
    text = text.replace(
        "O roteiro completo está em `docs/entrevistas.md`",
        "A Sprint 2 mantém entrevistas em ritmo de hackathon. O roteiro completo está em `docs/entrevistas.md`",
    )

    # --- D-010 próximo passo ---
    text = text.replace(
        "**Por quê:** Entrega oficial da Sprint 2 exige commit no GitHub com x402 ou justificativa formal de N/A. Decisão depende do modelo de receita escolhido (D-009).",
        "**Por quê:** Entrega oficial da Sprint 2 exige commit no GitHub com x402 ou justificativa formal de N/A. Decisão depende do modelo de receita escolhido (D-009).\n"
        "**Próximo passo (até 16/05/2026):** registrar neste RT, na próxima revisão, o resultado (x402 adotado ou N/A justificado) e, se aplicável, o ID da decisão correspondente.",
    )

    # --- D-013: gestão + Anchor na implementação ---
    text = text.replace(
        "acessa os fluxos de registro e consulta de boletos dentro do Boleto Guardian.",
        "acessa os fluxos de registro e gestão de boletos no painel web do Boleto Guardian (sem alterar a validação pública do pagador; D-004).",
    )
    text = text.replace(
        "**Implementação (11/05/2026):** Âncora escolhida:",
        "**Implementação (11/05/2026):** Anchor escolhida:",
    )

    # --- Seção 7: voz institucional + variar "reputacional" na última frase ---
    text = text.replace(
        "Estou apostando que a vergonha de ver um cliente protestado por culpa de um boleto adulterado dói o suficiente para a empresa pagar pela prevenção. Mas pode ser que não doa. Pode ser que o gestor financeiro encare como \"azar do cliente\" e siga em frente. Se for esse o caso, construí uma solução elegante para um problema que ninguém quer pagar para resolver.",
        "A equipe aposta que a vergonha de ver um cliente protestado por culpa de um boleto adulterado dói o suficiente para a empresa pagar pela prevenção. Mas pode ser que não doa. Pode ser que o gestor financeiro encare como \"azar do cliente\" e siga em frente. Se for esse o caso, o projeto terá uma solução elegante para um problema que ninguém quer pagar para resolver.",
    )
    text = text.replace(
        "- 10+ entrevistas com perguntas específicas sobre quem ressarce, quem protesta, quem assume o desgaste reputacional",
        "- 10+ entrevistas com perguntas específicas sobre quem ressarce, quem protesta, quem assume o desgaste de imagem",
    )
    text = text.replace(
        "onde o relacionamento longo aumenta a dor reputacional).",
        "onde o relacionamento longo aumenta o peso de imagem).",
    )

    # --- Hipótese tabela: variar reputacional ---
    text = text.replace(
        "| Empresa emissora sente dor financeira/reputacional suficiente com fraude para pagar pela prevenção | Em teste |",
        "| Empresa emissora sente dor financeira e de imagem suficiente com fraude para pagar pela prevenção | Em teste |",
    )

    # --- Desafio Sprint 2: citação literal do programa mantém "âncora" minúsculo ---
    text = text.replace(
        "| MVP com Âncora no Testnet | Demonstrar 1 fluxo completo do app integrado com uma âncora na testnet e evidenciar commits |",
        "| MVP com âncora na testnet (nome do desafio oficial) | Demonstrar 1 fluxo completo do app integrado com uma Anchor na testnet e evidenciar commits |",
    )

    # --- Seção 3: substituir bloco duplicado Camada SEP-10 por Camada 4 resumida ---
    pattern = re.compile(
        r"### Camada SEP-10 . Autenticação de Wallet\n\n"
        r"Implementada em 11/05/2026.*?via chave de admin\.\n\n---",
        re.DOTALL,
    )
    replacement = """### Camada 4 — Autenticação SEP-10 (fluxo web autenticado)

Complementa as camadas 1 a 3 no **painel web** (`login.html` / `dashboard.html`): SEP-10 contra a Anchor `testanchor.stellar.org` prova posse da wallet antes de operações autenticadas no app; o registro on-chain segue via **Manage Data**. A **validação pública** do pagador (`validation.html`, **D-004**) permanece em `GET /api/validate/:codebar` **sem** login.

Tabelas de endpoints, artefatos (`lib/sep10.js`, proxies `api/sep10/*`), JWT trust-based, `sessionStorage` e coexistência com `POST /api/blockchain`: ver **D-013** (decisão + implementação) e **D-014**.

---"""
    new_text, n = pattern.subn(replacement, text, count=1)
    if n != 1:
        raise SystemExit(f"Expected 1 Camada SEP-10 block replaced, got {n}")

    # --- Histórico v1.3 linha (opcional alinhar gestão) ---
    new_text = new_text.replace(
        "autenticação de wallet antes dos fluxos de registro e consulta",
        "autenticação de wallet antes dos fluxos de registro e gestão no painel",
    )

    # --- v1.7 cabeçalho e histórico ---
    new_text = re.sub(
        r"\*\*Última atualização:\*\* \d{2}/\d{2}/\d{4} \(v[\d.]+\)",
        "**Última atualização:** 12/05/2026 (v1.7)",
        new_text,
        count=1,
    )
    if "| v1.6 |" not in new_text:
        raise SystemExit("v1.6 row missing")
    insert = (
        "| v1.7 | 12/05/2026 | Clareza arquitetural: Seção 3 x D-013 (Camada 4 remete às decisões); "
        "validação pública vs painel SEP-10; dois endpoints de registro explicados na Camada 2; "
        "Anchor padronizado; Seção 6 e D-010 alinhados ao calendário; Seção 7 em voz institucional; "
        "ajustes de estilo (roadmap, repetições) |\n"
    )
    new_text = new_text.replace("| v1.6 |", insert + "| v1.6 |", 1)

    RT.write_text(new_text, encoding="utf-8", newline="\n")
    print("Wrote", RT, "chars", len(new_text))


if __name__ == "__main__":
    main()
