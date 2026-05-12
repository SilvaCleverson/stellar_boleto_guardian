# -*- coding: utf-8 -*-
"""
Recupera HTML salvo com bytes Latin-1 (cp1252) misturados em arquivo declarado UTF-8.
Percorre o binario: sequencias UTF-8 validas (2-4 bytes) preservadas; caso contrario,
cada byte 0x80-0xFF vira o caractere Unicode U+00xx (Latin-1).
"""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

TARGETS = [
    ROOT / "web" / "validation.html",
    ROOT / "web" / "validation-es.html",
    ROOT / "web" / "registro.html",
]


def repair_mixed_utf8_latin1(data: bytes) -> str:
    out: list[str] = []
    i = 0
    n = len(data)
    while i < n:
        c = data[i]
        if c < 0x80:
            out.append(chr(c))
            i += 1
            continue
        if 0xC2 <= c <= 0xDF and i + 1 < n and 0x80 <= data[i + 1] <= 0xBF:
            seq = data[i : i + 2]
            try:
                out.append(seq.decode("utf-8"))
                i += 2
                continue
            except UnicodeDecodeError:
                pass
        if 0xE0 <= c <= 0xEF and i + 2 < n and 0x80 <= data[i + 1] <= 0xBF and 0x80 <= data[i + 2] <= 0xBF:
            seq = data[i : i + 3]
            try:
                out.append(seq.decode("utf-8"))
                i += 3
                continue
            except UnicodeDecodeError:
                pass
        if 0xF0 <= c <= 0xF4 and i + 3 < n:
            seq = data[i : i + 4]
            if all(0x80 <= b <= 0xBF for b in seq[1:4]):
                try:
                    out.append(seq.decode("utf-8"))
                    i += 4
                    continue
                except UnicodeDecodeError:
                    pass
        out.append(chr(c))
        i += 1
    return "".join(out)


def main() -> None:
    for path in TARGETS:
        if not path.exists():
            print("skip missing", path)
            continue
        raw = path.read_bytes()
        text = repair_mixed_utf8_latin1(raw)
        text.encode("utf-8")
        path.write_text(text, encoding="utf-8", newline="\n")
        print("repaired", path.relative_to(ROOT))


if __name__ == "__main__":
    main()
