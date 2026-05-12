# -*- coding: utf-8 -*-
"""Atualiza secao 3.2 (index PT/EN/ES) e whitepapers: 44 no codigo; 47/48 na linha."""
from __future__ import annotations

import codecs
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

INDEX_PATCHES = [
    (
        "web/index.html",
        r"(<h3>3\.2 Por que a linha digit\u00e1vel como chave\?</h3>\s*)<p>.*?</p>",
        (
            "<p>O <strong>c\u00f3digo de barras</strong> num\u00e9rico tem <strong>44 d\u00edgitos</strong>. "
            "A <strong>linha digit\u00e1vel</strong> costuma ter <strong>47 d\u00edgitos</strong> em boletos banc\u00e1rios ou "
            "<strong>48</strong> em boletos de concession\u00e1ria ou de arrecada\u00e7\u00e3o (layouts FEBRABAN). "
            "Na valida\u00e7\u00e3o aceitamos <strong>44 a 48 d\u00edgitos</strong> porque o pagador pode informar s\u00f3 o c\u00f3digo de barras ou a linha digit\u00e1vel completa. "
            "A sequ\u00eancia \u00e9 \u00fanica por boleto, impressa no documento e compacta (cabe nos 64 bytes do Manage Data da Stellar). "
            "Isso elimina a necessidade de o usu\u00e1rio conhecer qualquer informa\u00e7\u00e3o t\u00e9cnica. "
            "<strong>O boleto \u00e9 a pr\u00f3pria credencial de consulta.</strong></p>"
        ),
    ),
    (
        "web/index-en.html",
        r"(<h3>3\.2 Why the barcode as key\?</h3>\s*)<p>.*?</p>",
        (
            "<p>The numeric <strong>barcode</strong> is <strong>44 digits</strong>. The <strong>typable line (linha digit\u00e1vel)</strong> is usually <strong>47 digits</strong> for bank-issued slips "
            "or <strong>48</strong> for utility or tax-collection slips (FEBRABAN layouts). We accept <strong>44 to 48 digits</strong> in validation because the payer may enter only the barcode "
            "or the full typable line. The sequence is unique per slip, printed on the document and compact (fits in Stellar's 64-byte Manage Data). "
            "This eliminates the need for the user to know any technical information. <strong>The slip is the query credential itself.</strong></p>"
        ),
    ),
    (
        "web/index-es.html",
        r"(<h3>3\.2 \u00bfPor qu\u00e9 la l\u00ednea digit\u00e1vel como clave\?</h3>\s*)<p>.*?</p>",
        (
            "<p>El <strong>c\u00f3digo de barras</strong> num\u00e9rico tiene <strong>44 d\u00edgitos</strong>. La <strong>l\u00ednea digit\u00e1vel</strong> suele tener "
            "<strong>47 d\u00edgitos</strong> en boletos bancarios o <strong>48</strong> en boletos de concesionaria o de recaudaci\u00f3n (layouts FEBRABAN). "
            "La validaci\u00f3n acepta <strong>de 44 a 48 d\u00edgitos</strong> porque el pagador puede informar solo el c\u00f3digo o la l\u00ednea completa. "
            "La secuencia es \u00fanica por boleto, impresa en el documento y compacta (cabe en los 64 bytes del Manage Data de Stellar). "
            "Esto elimina la necesidad de que el usuario conozca informaci\u00f3n t\u00e9cnica. <strong>El boleto es la propia credencial de consulta.</strong></p>"
        ),
    ),
]


def decode_escapes(s: str) -> str:
    """Decode \\uXXXX in an ASCII-only source string to Unicode text."""
    return codecs.decode(s.encode("utf-8"), "unicode_escape")


def patch_index() -> None:
    en = (ROOT / "web/index-en.html").read_text(encoding="utf-8")
    if "The numeric <strong>barcode</strong>" in en and "44 digits" in en:
        print("skip web/index*.html (secao 3.2 ja atualizada)")
        return
    for rel, pat_ascii, repl_ascii in INDEX_PATCHES:
        path = ROOT / rel
        text = path.read_text(encoding="utf-8")
        pat = decode_escapes(pat_ascii)
        body = decode_escapes(repl_ascii)
        text2, n = re.subn(pat, lambda m, b=body: m.group(1) + b, text, count=1, flags=re.S)
        if n != 1:
            raise SystemExit(f"{rel}: esperado 1 match, obteve {n}")
        path.write_text(text2, encoding="utf-8", newline="\n")
        print("patched", rel)


def patch_whitepapers() -> None:
    md = ROOT / "WHITEPAPER.md"
    t = md.read_text(encoding="cp1252")
    new = (
        "### 3.2 Why the barcode number as the key?\n\n"
        "The numeric **barcode** is **44 digits**. The **typable line (linha digitavel)** is usually **47 digits** on bank-issued slips or **48** on utility or tax-collection slips (FEBRABAN layouts). "
        "Validation accepts **44 to 48 digits** because the payer may type only the barcode or the full typable line. This sequence is:\n\n"
        "- **Unique** per boleto -- no two boletos share the same barcode number\n"
        "- **Printed** on the physical and digital document -- the payer always has access to it\n"
        "- **Standardized** by FEBRABAN -- consistent format across the entire banking system\n"
        "- **Compact** -- up to 48 numeric characters fit comfortably within Stellar's Manage Data 64-byte limit\n\n"
        "This choice eliminates the need for the user to know any technical information. There are no hashes, public keys, or account identifiers. **The boleto itself is the lookup credential.**\n\n"
        "| Approach | Lookup key | What the user needs to know | Experience |\n"
        "|----------|-----------|----------------------------|------------|\n"
        "| Traditional (hash) | Cryptographic hash of the boleto | Account ID + SHA1 Hash | Complex, technical |\n"
        "| **Boleto Guardian** | **Barcode / typable line (44\u201348 digits)** | **Nothing beyond the boleto itself** | **Simple, intuitive** |\n"
    )
    new = new.replace("\\u2013", "\u2013")
    t2, n = re.subn(
        r"### 3\.2 Why the barcode number as the key\?.*?(?=\n### 3\.3 )",
        new.rstrip() + "\n\n",
        t,
        count=1,
        flags=re.S,
    )
    if n != 1:
        raise SystemExit(f"WHITEPAPER.md: secao 3.2 nao encontrada (matches={n})")
    md.write_text(t2, encoding="utf-8", newline="\n")
    print("patched WHITEPAPER.md")

    pt = ROOT / "WHITEPAPER.pt-BR.md"
    tp = pt.read_text(encoding="utf-8")
    newp = (
        "### 3.2 Por que a linha digitavel como chave?\n\n"
        "O codigo de barras numerico tem **44 digitos**. A linha digitavel costuma ter **47 digitos** em boleto bancario ou **48** em boleto de concessionaria ou arrecadacao (layouts FEBRABAN). "
        "A validacao aceita **44 a 48 digitos** porque o pagador pode informar so o codigo de barras ou a linha digitavel completa. Essa sequencia e:\n\n"
        "- **Unica** por boleto -- nao existem dois boletos com a mesma linha digitavel\n"
        "- **Impressa** no documento fisico e digital -- o pagador sempre tem acesso a ela\n"
        "- **Padronizada** pela FEBRABAN -- formato consistente em todo o sistema bancario\n"
        "- **Compacta** -- sequencias de ate 48 caracteres numericos cabem confortavelmente nos 64 bytes do Manage Data da Stellar\n\n"
        "Essa escolha elimina a necessidade de o usuario conhecer qualquer informacao tecnica. Nao ha hashes, chaves publicas ou identificadores de conta. **O boleto e a propria credencial de consulta.**\n\n"
        "| Abordagem | Chave de consulta | O que o usuario precisa saber | Experiencia |\n"
        "|-----------|-------------------|-------------------------------|-------------|\n"
        "| Tradicional (hash) | Hash criptografico do boleto | Account ID + Hash SHA1 | Complexa, tecnica |\n"
        "| **Boleto Guardian** | **Codigo de barras / linha digitavel (44 a 48 digitos)** | **Nada alem do proprio boleto** | **Simples, intuitiva** |\n"
    )
    tp2, n2 = re.subn(
        r"### 3\.2 Por que a linha digitavel como chave\?.*?(?=\n### 3\.3 )",
        newp.rstrip() + "\n\n",
        tp,
        count=1,
        flags=re.S,
    )
    if n2 != 1:
        raise SystemExit(f"WHITEPAPER.pt-BR.md: secao 3.2 nao encontrada (matches={n2})")
    pt.write_text(tp2, encoding="utf-8", newline="\n")
    print("patched WHITEPAPER.pt-BR.md")


def main() -> None:
    import sys

    if "--index-only" in sys.argv:
        patch_index()
        return
    if "--whitepapers-only" in sys.argv:
        patch_whitepapers()
        return
    patch_index()
    patch_whitepapers()


if __name__ == "__main__":
    main()
