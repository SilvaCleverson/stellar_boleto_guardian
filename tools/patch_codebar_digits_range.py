# -*- coding: utf-8 -*-
"""Patch marketing copy for codebar length 44-48 digits (PT/EN/ES index)."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def patch_index_pt(t: str) -> str:
    t = t.replace(
        "Valide em segundos com os 47 d\u00edgitos.",
        "Valide em segundos com os 44 a 48 d\u00edgitos do c\u00f3digo de barras.",
    )
    t = t.replace(
        "valida\u00e7\u00e3o em segundos com os 47 d\u00edgitos.",
        "valida\u00e7\u00e3o em segundos com os 44 a 48 d\u00edgitos.",
    )
    t = t.replace(
        '<span class="badge">47 d\u00edgitos</span>',
        '<span class="badge">44\u201348 d\u00edgitos</span>',
    )
    t = t.replace(
        "valida em segundos com os <strong>47 d\u00edgitos</strong> da linha digit\u00e1vel",
        "valida em segundos com os <strong>44 a 48 d\u00edgitos</strong> do c\u00f3digo de barras ou da linha digit\u00e1vel",
    )
    t = t.replace("validar com os 47 d\u00edgitos", "validar com os 44 a 48 d\u00edgitos")
    t, n = re.subn(
        r"<p>A linha digit\u00e1vel de um boleto banc\u00e1rio brasileiro possui <strong>47 d\u00edgitos</strong>\. "
        r"Essa sequ\u00eancia \u00e9 \u00fanica por boleto, impressa no documento, padronizada pela FEBRABAN e compacta "
        r"\(cabe nos 64 bytes do Manage Data da Stellar\)\. Essa escolha elimina a necessidade de o usu\u00e1rio "
        r"conhecer qualquer informa\u00e7\u00e3o t\u00e9cnica\. <strong>O boleto \u00e9 a pr\u00f3pria credencial de consulta\.</strong></p>",
        "<p>O c\u00f3digo de barras num\u00e9rico (e a linha digit\u00e1vel associada) de um boleto banc\u00e1rio brasileiro tem "
        "<strong>entre 44 e 48 d\u00edgitos</strong>, conforme o padr\u00e3o FEBRABAN. A sequ\u00eancia \u00e9 \u00fanica por boleto, "
        "impressa no documento e compacta (cabe nos 64 bytes do Manage Data da Stellar). "
        "Isso elimina a necessidade de o usu\u00e1rio conhecer qualquer informa\u00e7\u00e3o t\u00e9cnica. "
        "<strong>O boleto \u00e9 a pr\u00f3pria credencial de consulta.</strong></p>",
        t,
        count=1,
    )
    if n != 1:
        raise SystemExit("index.html: paragraph 3.2 not matched (%s)" % n)
    t = t.replace(
        "<td><strong>Linha digit\u00e1vel (47 d\u00edgitos)</strong></td>",
        "<td><strong>C\u00f3digo de barras (44\u201348 d\u00edgitos)</strong></td>",
    )
    t = t.replace("Digita os 47 n\u00fameros.", "Digita os 44 a 48 n\u00fameros do c\u00f3digo de barras.")
    t = t.replace(
        "Se a linha digit\u00e1vel n\u00e3o existir na blockchain, o boleto n\u00e3o foi emitido pela empresa",
        "Se o c\u00f3digo n\u00e3o existir na blockchain, o boleto n\u00e3o foi emitido pela empresa",
    )
    t = t.replace(
        "O pagador consulta a valida\u00e7\u00e3o p\u00fablica (47 d\u00edgitos). Para <strong>registro e consulta autenticados</strong>",
        "O pagador consulta a valida\u00e7\u00e3o p\u00fablica (44 a 48 d\u00edgitos). Para <strong>registro e gest\u00e3o autenticados</strong>",
    )
    return t


def patch_index_en(t: str) -> str:
    t = t.replace(
        "Validate in seconds with 47 digits.",
        "Validate in seconds with 44 to 48 barcode digits.",
    )
    t = t.replace(
        "validate in seconds with the 47-digit barcode.",
        "validate in seconds with the 44\u201348-digit barcode.",
    )
    t = t.replace('<span class="badge">47 digits</span>', '<span class="badge">44\u201348 digits</span>')
    t = t.replace(
        "validates in seconds with the <strong>47-digit</strong> barcode, with no app",
        "validates in seconds with the <strong>44 to 48 digit</strong> barcode, with no app",
    )
    t = t.replace("validate with 47 digits", "validate with 44 to 48 digits")
    t, n = re.subn(
        r"A Brazilian bank slip barcode has <strong>47 digits</strong>\. This sequence is unique per slip, "
        r"printed on the document, standardized by FEBRABAN and compact \(fits in Stellar's 64-byte Manage Data\)\. "
        r"This choice eliminates the need for the user to know any technical information\. "
        r"<strong>The slip is the query credential itself\.</strong></p>",
        "<p>A Brazilian bank slip numeric barcode has <strong>between 44 and 48 digits</strong>, per FEBRABAN layouts. "
        "The sequence is unique per slip, printed on the document and compact (fits in Stellar's 64-byte Manage Data). "
        "This eliminates the need for the user to know any technical information. "
        "<strong>The slip is the query credential itself.</strong></p>",
        t,
        count=1,
    )
    if n != 1:
        raise SystemExit("index-en.html: paragraph not matched (%s)" % n)
    t = t.replace(
        "<td><strong>Barcode (47 digits)</strong></td>",
        "<td><strong>Barcode (44\u201348 digits)</strong></td>",
    )
    t = t.replace("3) Types the 47 digits.", "3) Types the 44 to 48 digits.")
    t = t.replace(
        "If the barcode does not exist on the blockchain, the slip was not issued by the company",
        "If that code does not exist on the blockchain, the slip was not issued by the company",
    )
    t = t.replace(
        "The payer uses the public validation page (47 digits). For <strong>authenticated register and lookup</strong>",
        "The payer uses the public validation page (44 to 48 digits). For <strong>authenticated register and dashboard</strong>",
    )
    return t


def patch_index_es(t: str) -> str:
    t = t.replace(
        "Validaci\u00f3n en segundos con 47 d\u00edgitos.",
        "Validaci\u00f3n en segundos con 44 a 48 d\u00edgitos del c\u00f3digo de barras.",
    )
    t = t.replace(
        "validaci\u00f3n en segundos con los 47 d\u00edgitos.",
        "validaci\u00f3n en segundos con los 44 a 48 d\u00edgitos.",
    )
    t = t.replace(
        '<span class="badge">47 d\u00edgitos</span>',
        '<span class="badge">44\u201348 d\u00edgitos</span>',
    )
    t = t.replace(
        "valida en segundos con los <strong>47 d\u00edgitos</strong> de la l\u00ednea digit\u00e1vel, sin app",
        "valida en segundos con los <strong>44 a 48 d\u00edgitos</strong> del c\u00f3digo de barras o de la l\u00ednea digit\u00e1vel, sin app",
    )
    t = t.replace("validar con 47 d\u00edgitos", "validar con 44 a 48 d\u00edgitos")
    t, n = re.subn(
        r"La l\u00ednea digit\u00e1vel de un boleto bancario brasile\u00f1o tiene <strong>47 d\u00edgitos</strong>\. "
        r"Esta secuencia es \u00fanica por boleto, impresa en el documento, estandarizada por FEBRABAN y compacta "
        r"\(cabe en los 64 bytes del Manage Data de Stellar\)\. Esta elecci\u00f3n elimina la necesidad de que el usuario "
        r"conozca informaci\u00f3n t\u00e9cnica\. <strong>El boleto es la propia credencial de consulta\.</strong></p>",
        "<p>El c\u00f3digo de barras num\u00e9rico (y la l\u00ednea digit\u00e1vel asociada) de un boleto bancario brasile\u00f1o tiene "
        "<strong>entre 44 y 48 d\u00edgitos</strong>, seg\u00fan el est\u00e1ndar FEBRABAN. La secuencia es \u00fanica por boleto, "
        "impresa en el documento y compacta (cabe en los 64 bytes del Manage Data de Stellar). "
        "Esto elimina la necesidad de que el usuario conozca informaci\u00f3n t\u00e9cnica. "
        "<strong>El boleto es la propia credencial de consulta.</strong></p>",
        t,
        count=1,
    )
    if n != 1:
        raise SystemExit("index-es.html: paragraph not matched (%s)" % n)
    t = t.replace(
        "<td><strong>L\u00ednea digit\u00e1vel (47 d\u00edgitos)</strong></td>",
        "<td><strong>C\u00f3digo de barras (44\u201348 d\u00edgitos)</strong></td>",
    )
    t = t.replace("3) Digita los 47 n\u00fameros.", "3) Digita los 44 a 48 n\u00fameros del c\u00f3digo de barras.")
    t = t.replace(
        "<strong>Si la l\u00ednea digit\u00e1vel no existe en la blockchain, el boleto no fue emitido por la empresa",
        "<strong>Si el c\u00f3digo no existe en la blockchain, el boleto no fue emitido por la empresa",
    )
    t = t.replace(
        "El pagador usa la p\u00e1gina p\u00fablica de validaci\u00f3n (47 d\u00edgitos). Para <strong>registro y consulta autenticados</strong>",
        "El pagador usa la p\u00e1gina p\u00fablica de validaci\u00f3n (44 a 48 d\u00edgitos). Para <strong>registro y panel autenticados</strong>",
    )
    return t


def main() -> None:
    for name, fn in (
        ("index.html", patch_index_pt),
        ("index-en.html", patch_index_en),
        ("index-es.html", patch_index_es),
    ):
        p = ROOT / "web" / name
        t = p.read_text(encoding="utf-8")
        p.write_text(fn(t), encoding="utf-8", newline="\n")
        print("OK", name)


if __name__ == "__main__":
    main()
