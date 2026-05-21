# -*- coding: utf-8 -*-
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

TEAM_PT = """
## Equipe Guardian Labs

| Papel | Nome |
|-------|------|
| **CEO** | Cleverson Silva |
| **CTO** | Sergio Artero |
| **CMO** | Demetrio De Los Rios |

"""

TEAM_EN = """
## Guardian Labs team

| Role | Name |
|------|------|
| **CEO** | Cleverson Silva |
| **CTO** | Sergio Artero |
| **CMO** | Demetrio De Los Rios |

"""

TEAM_ES = """
## Equipo Guardian Labs

| Rol | Nombre |
|-----|--------|
| **CEO** | Cleverson Silva |
| **CTO** | Sergio Artero |
| **CMO** | Demetrio De Los Rios |

"""

RT_TEAM = (
    "## Equipe Guardian Labs\n\n"
    "| Papel | Nome |\n|-------|------|\n"
    "| **CEO** | Cleverson Silva |\n| **CTO** | Sergio Artero |\n| **CMO** | Demetrio De Los Rios |\n\n"
    "O **Boleto Guardian** (este reposit\u00f3rio) \u00e9 o primeiro produto da Guardian Labs; "
    "decis\u00f5es t\u00e9cnicas de seguran\u00e7a e integra\u00e7\u00f5es citam respons\u00e1veis por nome quando aplic\u00e1vel "
    "(ex.: **D-021** \u2014 Sergio Artero, CTO).\n\n"
)


def read_file(path):
    raw = path.read_bytes()
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError:
        return raw.decode("latin-1")


def write_file(path, text):
    path.write_text(text, encoding="utf-8", newline="\n")


def insert_team_readme(path, team_block, marker_end):
    p = ROOT / path
    t = read_file(p)
    if "## Equipe Guardian Labs" in t or "## Guardian Labs team" in t or "## Equipo Guardian Labs" in t:
        return
    needle = marker_end + "\n\n\n---"
    if needle not in t:
        needle = marker_end + "\n\n---"
    if needle not in t:
        return
    t = t.replace(needle, marker_end + "\n" + team_block + "---", 1)
    write_file(p, t)


def patch_rt():
    p = ROOT / "docs/RT-DocumentoDeProduto.md"
    t = read_file(p)
    t = re.sub(
        r"\*\*Mantido por:\*\*[^\n]+",
        "**Mantido por:** Guardian Labs \u2014 Cleverson Silva (CEO), Sergio Artero (CTO), Demetrio De Los Rios (CMO)",
        t,
        count=1,
    )
    t = re.sub(
        r"\(v1\.\d+\)",
        "(v1.19)",
        t,
        count=1,
    )
    if "## Equipe Guardian Labs" not in t:
        t = re.sub(
            r"(mainnet\.)\s*\n\n---\s*\n\n## 1\.",
            r"\1\n\n---\n" + RT_TEAM + "---\n\n## 1.",
            t,
            count=1,
        )
    if "| v1.19 |" not in t:
        t = t.replace(
            "| v1.18 | 19/05/2026 | Narrativa Guardian Labs",
            "| v1.19 | 19/05/2026 | Equipe Guardian Labs: Cleverson Silva (CEO), Sergio Artero (CTO), Demetrio De Los Rios (CMO) |\n| v1.18 | 19/05/2026 | Narrativa Guardian Labs",
            1,
        )
    write_file(p, t)


def patch_web_footer(path, line):
    p = ROOT / path
    if not p.exists():
        return
    t = read_file(p)
    t = re.sub(
        r'<p style="margin-top: 12px; font-size: 0\.85rem;">[^<]*</p>',
        f'<p style="margin-top: 12px; font-size: 0.85rem;">{line}</p>',
        t,
        count=1,
    )
    if '<p class="meta"><strong>Author:</strong>' in t:
        t = re.sub(
            r'<p class="meta"><strong>Author:</strong>[^<]*</p>',
            '<p class="meta"><strong>Guardian Labs:</strong> Cleverson Silva (CEO) \u00b7 Sergio Artero (CTO) \u00b7 Demetrio De Los Rios (CMO) \u00b7 <strong>Date:</strong> March 2026</p>',
            t,
            count=1,
        )
    elif "Fecha" in t:
        t = re.sub(
            r'<p class="meta"><strong>Autor:</strong>[^<]*</p>',
            '<p class="meta"><strong>Guardian Labs:</strong> Cleverson Silva (CEO) \u00b7 Sergio Artero (CTO) \u00b7 Demetrio De Los Rios (CMO) \u00b7 <strong>Fecha:</strong> marzo 2026</p>',
            t,
            count=1,
        )
    else:
        t = re.sub(
            r'<p class="meta"><strong>Autor:</strong>[^<]*</p>',
            '<p class="meta"><strong>Guardian Labs:</strong> Cleverson Silva (CEO) \u00b7 Sergio Artero (CTO) \u00b7 Demetrio De Los Rios (CMO) \u00b7 <strong>Data:</strong> Mar\u00e7o 2026</p>',
            t,
            count=1,
        )
    write_file(p, t)


def patch_readme_footer(path, text):
    p = ROOT / path
    t = read_file(p)
    for old in (
        "**Feito por Equipe Guardian**",
        "**Built by Equipe Guardian**",
        "**Creado por Equipe Guardian**",
        "**Hecho por Equipe Guardian**",
    ):
        if old in t:
            t = t.replace(old, text, 1)
            break
    write_file(p, t)


def main():
    insert_team_readme(
        "README.pt-BR.md",
        TEAM_PT,
        "| Pitch: empresa + roadmap | Experi\u00eancia: registrar e validar boleto |",
    )
    insert_team_readme(
        "README.en.md",
        TEAM_EN,
        "| Pitch: company + roadmap | Experience: register and validate slips |",
    )
    insert_team_readme(
        "README.es.md",
        TEAM_ES,
        "| Pitch: empresa + roadmap | Experiencia: registrar y validar boletos |",
    )
    insert_team_readme(
        "README.md",
        TEAM_EN,
        "| Pitch: company + roadmap | Experience: register and validate slips |",
    )
    patch_rt()
    patch_web_footer(
        "web/index.html",
        "\u00a9 2026 Guardian Labs \u00b7 Cleverson Silva (CEO) \u00b7 Sergio Artero (CTO) \u00b7 Demetrio De Los Rios (CMO) \u00b7 MIT",
    )
    patch_web_footer(
        "web/index-en.html",
        "\u00a9 2026 Guardian Labs \u00b7 Cleverson Silva (CEO) \u00b7 Sergio Artero (CTO) \u00b7 Demetrio De Los Rios (CMO) \u00b7 MIT",
    )
    patch_web_footer(
        "web/index-es.html",
        "\u00a9 2026 Guardian Labs \u00b7 Cleverson Silva (CEO) \u00b7 Sergio Artero (CTO) \u00b7 Demetrio De Los Rios (CMO) \u00b7 MIT",
    )
    patch_readme_footer(
        "README.pt-BR.md",
        "**Guardian Labs** \u2014 Cleverson Silva (CEO) \u00b7 Sergio Artero (CTO) \u00b7 Demetrio De Los Rios (CMO)",
    )
    patch_readme_footer(
        "README.en.md",
        "**Guardian Labs** \u2014 Cleverson Silva (CEO) \u00b7 Sergio Artero (CTO) \u00b7 Demetrio De Los Rios (CMO)",
    )
    patch_readme_footer(
        "README.es.md",
        "**Guardian Labs** \u2014 Cleverson Silva (CEO) \u00b7 Sergio Artero (CTO) \u00b7 Demetrio De Los Rios (CMO)",
    )
    patch_readme_footer(
        "README.md",
        "**Guardian Labs** \u2014 Cleverson Silva (CEO) \u00b7 Sergio Artero (CTO) \u00b7 Demetrio De Los Rios (CMO)",
    )
    wp = ROOT / "WHITEPAPER.pt-BR.md"
    if wp.exists():
        t = read_file(wp)
        if "**Autor:** Equipe Guardian" in t:
            t = t.replace(
                "**Autor:** Equipe Guardian",
                "**Autor:** Guardian Labs \u2014 Cleverson Silva (CEO), Sergio Artero (CTO), Demetrio De Los Rios (CMO)",
                1,
            )
            write_file(wp, t)
    print("ok")


if __name__ == "__main__":
    main()
