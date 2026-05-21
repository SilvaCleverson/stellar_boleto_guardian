# -*- coding: utf-8 -*-
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

MOJI = {
    "\u00c3\u00a1": "\u00e1", "\u00c3\u00a0": "\u00e0", "\u00c3\u00a2": "\u00e2",
    "\u00c3\u00a3": "\u00e3", "\u00c3\u00a9": "\u00e9", "\u00c3\u00aa": "\u00ea",
    "\u00c3\u00ad": "\u00ed", "\u00c3\u00b3": "\u00f3", "\u00c3\u00ba": "\u00fa",
    "\u00c3\u00a7": "\u00e7", "\u00e2\u20ac\u201d": "\u2014", "\u00e2\u20ac\u201c": "\u201c",
    "\u00c2\u00b7": "\u00b7", "\u00c2\u00a9": "\u00a9",
    "\u00c2\u2014": "\u2014", "\u00c2\u2013": "\u2013", "\u00c3\u2014": "\u2014",
    "\u00c3\u201a": "\u00ea", "\u00c3\u2013": "\u00f3",
}


def fix(s):
    for a, b in MOJI.items():
        s = s.replace(a, b)
    return s


def read_file(path):
    raw = path.read_bytes()
    try:
        return fix(raw.decode("utf-8"))
    except UnicodeDecodeError:
        return fix(raw.decode("latin-1"))


def rw(path, text):
    path.write_text(fix(text), encoding="utf-8", newline="\n")


def patch_rt():
    p = ROOT / "docs/RT-DocumentoDeProduto.md"
    t = read_file(p)
    snip = read_file(ROOT / "tools/rt_section_1_snippet.md")
    t = re.sub(r"## 1\. O que.*?(?=\n## 2\.)", snip, t, count=1, flags=re.DOTALL)
    t = re.sub(
        r"\*\*[^\n]*ltima atualiza[^\n]*\*\*:\s*19/05/2026 \(v1\.\d+\)",
        "**\u00daltima atualiza\u00e7\u00e3o:** 19/05/2026 (v1.18)",
        t,
        count=1,
    )
    if "(v1.18)" not in t.split("## 2.", 1)[0]:
        t = t.replace("(v1.17)", "(v1.18)", 1)
    if "| v1.18 |" not in t:
        t = t.replace(
            "| v1.17 | 19/05/2026 | **D-021:**",
            "| v1.18 | 19/05/2026 | Narrativa Guardian Labs (marca-m\u00e3e vs primeiro produto); Se\u00e7\u00e3o 1 reestruturada |\n| v1.17 | 19/05/2026 | **D-021:**",
        )
    rw(p, t)


def patch_readme(path, block, until_heading):
    p = ROOT / path
    t = read_file(p)
    t = re.sub(r"> \*\*.*?\*\*.*?(?=\n---\n\n## " + until_heading + ")", block, t, count=1, flags=re.DOTALL)
    rw(p, t)


BLOCK_PT = """> **Parte do ecossistema Guardian Labs**

> A **Guardian Labs** constr\u00f3i **infraestrutura p\u00fablica de autenticidade** para as chaves que movem dinheiro no Brasil \u2014 provas imut\u00e1veis e audit\u00e1veis de que um instrumento de pagamento \u00e9 leg\u00edtimo, sem depender s\u00f3 do emissor ou do banco. **Boleto Guardian** \u00e9 o **primeiro produto** da Guardian Labs (autenticidade de boletos na Stellar; valida\u00e7\u00e3o pelos 44 a 48 d\u00edgitos do c\u00f3digo de barras). Outros instrumentos de pagamento brasileiros est\u00e3o no roadmap.

## O que \u00e9 a Guardian Labs

A **Guardian Labs** \u00e9 a **marca do projeto** (marca-m\u00e3e) que desenvolve camadas p\u00fablicas de confian\u00e7a sobre identificadores de pagamento no Brasil. N\u00e3o \u00e9 banco, fintech de pagamento nem \u00e2ncora Stellar \u2014 \u00e9 a camada de **autenticidade** que emissores e pagadores usam via API, integrada a qualquer ERP.

| Guardian Labs | Boleto Guardian |
|---------------|-----------------|
| Marca e tese de longo prazo | Primeiro produto em produ\u00e7\u00e3o (MVP) |
| Infraestrutura para v\u00e1rios instrumentos | Boletos na blockchain Stellar hoje |
| Pitch: empresa + roadmap | Experi\u00eancia: registrar e validar boleto |

"""

BLOCK_EN = """> **Part of the Guardian Labs ecosystem**

> **Guardian Labs** builds **public authenticity infrastructure** for the keys that move money in Brazil \u2014 immutable, auditable proof that a payment instrument is legitimate, without relying only on the issuer or the bank. **Boleto Guardian** is the **first product** of Guardian Labs (bank slip authenticity on Stellar; validation via 44 to 48 barcode digits). Other Brazilian payment instruments are on the roadmap.

## What is Guardian Labs

**Guardian Labs** is the **project brand** (parent brand) developing public trust layers over payment identifiers in Brazil. It is not a bank, payment fintech, or Stellar Anchor \u2014 it is the **authenticity layer** issuers and payers use via API, integrated with any ERP.

| Guardian Labs | Boleto Guardian |
|---------------|-----------------|
| Brand and long-term thesis | First product in production (MVP) |
| Infrastructure for multiple instruments | Bank slips on Stellar today |
| Pitch: company + roadmap | Experience: register and validate slips |

"""

BLOCK_ES = """> **Parte del ecosistema Guardian Labs**

> **Guardian Labs** construye **infraestructura p\u00fablica de autenticidad** para las claves que mueven dinero en Brasil \u2014 pruebas inmutables y auditables de que un instrumento de pago es leg\u00edtimo, sin depender solo del emisor o del banco. **Boleto Guardian** es el **primer producto** de Guardian Labs (autenticidad de boletos en Stellar; validaci\u00f3n con 44 a 48 d\u00edgitos del c\u00f3digo de barras). Otros instrumentos de pago brasile\u00f1os est\u00e1n en la hoja de ruta.

## Qu\u00e9 es Guardian Labs

**Guardian Labs** es la **marca del proyecto** (marca madre) que desarrolla capas p\u00fablicas de confianza sobre identificadores de pago en Brasil. No es banco, fintech de pagos ni ancla Stellar \u2014 es la capa de **autenticidad** que emisores y pagadores usan v\u00eda API, integrada a cualquier ERP.

| Guardian Labs | Boleto Guardian |
|---------------|-----------------|
| Marca y tesis de largo plazo | Primer producto en producci\u00f3n (MVP) |
| Infraestructura para varios instrumentos | Boletos en Stellar hoy |
| Pitch: empresa + roadmap | Experiencia: registrar y validar boletos |

"""


def patch_html_h1_sub(path, sub):
    p = ROOT / path
    if not p.exists():
        return
    t = read_file(p)
    t = re.sub(r"(<h1>Boleto Guardian</h1>\s*<p>)[^<]*(</p>)", rf"\1{sub}\2", t, count=1)
    rw(p, t)


FOOTER_EN = """<footer>
    <div class="wrap">
      <p><strong>Guardian Labs</strong> \u2014 public authenticity infrastructure for payments in Brazil.<br>
      <strong>Boleto Guardian</strong> \u2014 first product: bank slip authenticity on Stellar.</p>
      <p class="footer-links">
        <a href="https://boletoguardian.xyz">boletoguardian.xyz</a> \u00b7
        <a href="validation-en.html">Validate slip</a> \u00b7
        <a href="https://stellar.org" target="_blank" rel="noopener">Stellar</a> \u00b7
        <a href="https://github.com/SilvaCleverson/stellar_boleto_guardian" target="_blank" rel="noopener">GitHub</a>
      </p>
      <p style="margin-top: 12px; font-size: 0.85rem;">\u00a9 2026 Guardian Team \u00b7 MIT</p>
    </div>
  </footer>"""

FOOTER_ES = """<footer>
    <div class="wrap">
      <p><strong>Guardian Labs</strong> \u2014 infraestructura p\u00fablica de autenticidad para pagos en Brasil.<br>
      <strong>Boleto Guardian</strong> \u2014 primer producto: autenticidad de boletos en Stellar.</p>
      <p class="footer-links">
        <a href="https://boletoguardian.xyz">boletoguardian.xyz</a> \u00b7
        <a href="validation-es.html">Validar boleto</a> \u00b7
        <a href="https://stellar.org" target="_blank" rel="noopener">Stellar</a> \u00b7
        <a href="https://github.com/SilvaCleverson/stellar_boleto_guardian" target="_blank" rel="noopener">GitHub</a>
      </p>
      <p style="margin-top: 12px; font-size: 0.85rem;">\u00a9 2026 Equipo Guardian \u00b7 MIT</p>
    </div>
  </footer>"""

FOOTER_PT = """<footer>
    <div class="wrap">
      <p><strong>Guardian Labs</strong> \u2014 infraestrutura p\u00fablica de autenticidade para pagamentos no Brasil.<br>
      <strong>Boleto Guardian</strong> \u2014 primeiro produto: autenticidade de boletos na Stellar.</p>
      <p class="footer-links">
        <a href="https://boletoguardian.xyz">boletoguardian.xyz</a> \u00b7
        <a href="validation.html">Validar boleto</a> \u00b7
        <a href="https://stellar.org" target="_blank" rel="noopener">Stellar</a> \u00b7
        <a href="https://github.com/SilvaCleverson/stellar_boleto_guardian" target="_blank" rel="noopener">GitHub</a>
      </p>
      <p style="margin-top: 12px; font-size: 0.85rem;">\u00a9 2026 Equipe Guardian \u00b7 MIT</p>
    </div>
  </footer>"""


def patch_index(name, tagline, resumo, footer):
    p = ROOT / "web" / name
    t = read_file(p)
    t = re.sub(r'<p class="tagline">[^<]*</p>', f'<p class="tagline">{tagline}</p>', t, count=1)
    t = re.sub(
        r'(<section class="sec" id="resumo">\s*<h2>[^<]*</h2>\s*<p>)[^<]*(</p>)',
        rf"\1{resumo}\2",
        t,
        count=1,
    )
    t = re.sub(r"<footer>[\s\S]*?</footer>", footer, t, count=1)
    rw(p, t)


def normalize_utf8(paths):
    for rel in paths:
        p = ROOT / rel
        if p.exists():
            rw(p, read_file(p))


def main():
    patch_readme("README.pt-BR.md", BLOCK_PT, "Entenda")
    patch_readme("README.md", BLOCK_EN, "How")
    patch_readme("README.en.md", BLOCK_EN, "Understand")
    patch_readme("README.es.md", BLOCK_ES, "Entiende")
    patch_rt()

    sub_pt = "Primeiro produto da Guardian Labs \u00b7 Valida\u00e7\u00e3o na blockchain Stellar"
    sub_en = "First Guardian Labs product \u00b7 Stellar blockchain validation"
    sub_es = "Primer producto de Guardian Labs \u00b7 Validaci\u00f3n en Stellar"
    for f in ["web/validation.html", "web/dashboard.html", "web/login.html"]:
        patch_html_h1_sub(f, sub_pt)
    for f in ["web/validation-en.html", "web/dashboard-en.html", "web/login-en.html"]:
        patch_html_h1_sub(f, sub_en)
    for f in ["web/validation-es.html", "web/dashboard-es.html", "web/login-es.html"]:
        patch_html_h1_sub(f, sub_es)

    tag_pt = (
        "Guardian Labs: autenticidade p\u00fablica para pagamentos no Brasil. "
        "Boleto Guardian: primeiro produto \u2014 boletos na Stellar, 44 a 48 d\u00edgitos."
    )
    res_pt = (
        "A <strong>Guardian Labs</strong> desenvolve infraestrutura p\u00fablica de autenticidade para as chaves que movem dinheiro no Brasil. "
        "O <strong>Boleto Guardian</strong> \u00e9 o <strong>primeiro produto</strong> dessa marca: a empresa emissora registra cada boleto na Stellar; "
        "o pagador valida em segundos com os <strong>44 a 48 d\u00edgitos</strong> do c\u00f3digo de barras, sem app nem cadastro."
    )
    patch_index("index.html", tag_pt, res_pt, FOOTER_PT)

    tag_en = (
        "Guardian Labs: public authenticity for payments in Brazil. "
        "Boleto Guardian: first product \u2014 bank slips on Stellar, 44 to 48 digits."
    )
    res_en = (
        "<strong>Guardian Labs</strong> builds public authenticity infrastructure for the keys that move money in Brazil. "
        "<strong>Boleto Guardian</strong> is the <strong>first product</strong> of that brand: issuers register each slip on Stellar; "
        "payers validate in seconds with the <strong>44 to 48 digit</strong> barcode, with no app or signup."
    )
    patch_index("index-en.html", tag_en, res_en, FOOTER_EN)

    tag_es = (
        "Guardian Labs: autenticidad p\u00fablica para pagos en Brasil. "
        "Boleto Guardian: primer producto \u2014 boletos en Stellar, 44 a 48 d\u00edgitos."
    )
    res_es = (
        "La <strong>Guardian Labs</strong> desarrolla infraestructura p\u00fablica de autenticidad para las claves que mueven dinero en Brasil. "
        "El <strong>Boleto Guardian</strong> es el <strong>primer producto</strong> de esa marca: la empresa emisora registra cada boleto en Stellar; "
        "el pagador valida en segundos con los <strong>44 a 48 d\u00edgitos</strong> del c\u00f3digo de barras, sin app ni registro."
    )
    patch_index("index-es.html", tag_es, res_es, FOOTER_ES)

    ip = ROOT / "Integracao/README.md"
    if ip.exists():
        t = read_file(ip)
        if "primeiro produto" not in t[:600].lower() and "primer producto" not in t[:600].lower():
            t = re.sub(
                r"(# Integra[^\n]+\n)",
                r"\1\nParte da infraestrutura do **Boleto Guardian**, primeiro produto da **Guardian Labs**.\n",
                t,
                count=1,
            )
            rw(ip, t)

    touched = [
        "README.md", "README.pt-BR.md", "README.en.md", "README.es.md",
        "docs/RT-DocumentoDeProduto.md", "Integracao/README.md",
        "web/index.html", "web/index-en.html", "web/index-es.html",
        "web/validation.html", "web/validation-en.html", "web/validation-es.html",
        "web/dashboard.html", "web/dashboard-en.html", "web/dashboard-es.html",
        "web/login.html", "web/login-en.html", "web/login-es.html",
    ]
    normalize_utf8(touched)
    print("ok")


if __name__ == "__main__":
    main()
