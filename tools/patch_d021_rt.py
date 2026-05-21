# -*- coding: utf-8 -*-
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
RT = ROOT / "docs/RT-DocumentoDeProduto.md"
COMMIT_URL = "https://github.com/SilvaCleverson/stellar_boleto_guardian/commit/e7da273a3366e90addc22bd07a66afec06ecbe94"

D021_NEW = (
    "### D-021 \u00b7 Exposi\u00e7\u00e3o de credencial administrativa via DevTools (`registro.html`)\n\n"
    "**Data:** 19/05/2026  \n"
    "**Status:** **Corrigido** (20/05/2026) \u2014 **Sergio Artero** (CTO).  \n"
    "**Descoberta:** Durante revis\u00e3o de seguran\u00e7a (Sprint 3), a p\u00e1gina **`web/registro.html`** gravava **`ADMIN_API_KEY`** em **`sessionStorage`** e reenviava no cabe\u00e7alho **`x-admin-key`**, vis\u00edvel no DevTools. "
    "Evid\u00eancia: `docs/Auditoria/ChaveExposta.jpeg`; relat\u00f3rio p\u00fablico: https://www.boletoguardian.xyz/auditoria-seguranca.html (`docs/Auditoria/AuditoriaDeSeguranca.md`).  \n"
    "**Nota:** A chave p\u00fablica Stellar (`G\u2026`) na p\u00e1gina \u00e9 dado p\u00fablico; o achado cr\u00edtico \u00e9 a **chave administrativa secreta**.  \n"
    "**Decis\u00e3o:** Remover segredos do navegador; auth admin apenas no servidor (`.env`, Docker).  \n"
    "**Implementa\u00e7\u00e3o:** commit [`e7da273`](" + COMMIT_URL + ") \u2014 "
    "`refactor: backend absorve ADMIN_API_KEY \u2014 nenhum header em tr\u00e2nsito`.\n\n"
)


def read_rt():
    return RT.read_bytes().decode("utf-8")


def main():
    t = read_rt()
    t, n = re.subn(
        r"### D-021[\s\S]*?(\r?\n---\r?\n\r?\n## 6\. Pesquisa)",
        D021_NEW + r"\1",
        t,
        count=1,
    )
    if n == 0:
        raise SystemExit("D-021 section not found in RT")
    t = re.sub(
        r"\*\*[^\n]*ltima atualiza[^\n]*\*\*:[^\n]+",
        "**\u00daltima atualiza\u00e7\u00e3o:** 21/05/2026 (v1.20)",
        t,
        count=1,
    )
    t = t.replace(
        "corre\u00e7\u00e3o em andamento por **Sergio Artero**",
        "corre\u00e7\u00e3o **D-021** conclu\u00edda por **Sergio Artero** (commit `e7da273`)",
    )
    t = t.replace(
        "**D-021** \u2014 remover segredo do cliente; proxy servidor ou SEP-10; corre\u00e7\u00e3o **Sergio Artero**",
        "**D-021** \u2014 corrigido (`e7da273`): segredo removido do cliente; auth admin s\u00f3 no servidor",
    )
    if "| v1.20 |" not in t:
        t = t.replace(
            "| v1.19 | 19/05/2026 | Equipe Guardian Labs",
            "| v1.20 | 21/05/2026 | **D-021 corrigido:** pagina publica auditoria-seguranca.html; commit Sergio `e7da273` |\n| v1.19 | 19/05/2026 | Equipe Guardian Labs",
        )
    RT.write_text(t, encoding="utf-8", newline="\n")
    print("ok")


if __name__ == "__main__":
    main()
