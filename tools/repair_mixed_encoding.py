# -*- coding: utf-8 -*-
from pathlib import Path

MOJIBAKE_MAP = {
    "\u00c3\u00a1": "\u00e1",
    "\u00c3\u00a0": "\u00e0",
    "\u00c3\u00a2": "\u00e2",
    "\u00c3\u00a3": "\u00e3",
    "\u00c3\u00a9": "\u00e9",
    "\u00c3\u00aa": "\u00ea",
    "\u00c3\u00ad": "\u00ed",
    "\u00c3\u00b3": "\u00f3",
    "\u00c3\u00ba": "\u00fa",
    "\u00c3\u00a7": "\u00e7",
    "\u00c3\u0091": "\u00f1",
    "\u00c3\u0192": "\u00c3",
    "\u00c3\u0083\u00c2\u00b1": "\u00f1",
    "\u00c3\u0083\u00c2\u00a9": "\u00e9",
    "\u00c3\u0083\u00c2\u00a3": "\u00e3",
    "\u00c3\u0083\u00c2\u00b3": "\u00f3",
    "\u00c3\u0083\u00c2\u00ba": "\u00fa",
    "\u00c3\u0083\u00c2\u00a1": "\u00e1",
    "\u00c3\u0083\u00c2\u00a7": "\u00e7",
    "\u00e2\u20ac\u201d": "\u2014",
    "\u00e2\u20ac\u201c": "\u201c",
    "\u00e2\u20ac\u009d": "\u201d",
    "\u00c2\u00b7": "\u00b7",
}

SKIP = {"node_modules", ".git", "tools"}


def decode_mixed(raw: bytes) -> str:
    out = []
    i = 0
    n = len(raw)
    while i < n:
        decoded = False
        for size in (4, 3, 2, 1):
            if i + size > n:
                continue
            chunk = raw[i : i + size]
            try:
                ch = chunk.decode("utf-8")
            except UnicodeDecodeError:
                continue
            if size == 1 or len(ch) >= 1:
                out.append(ch)
                i += size
                decoded = True
                break
        if not decoded:
            b = raw[i]
            out.append(bytes([b]).decode("cp1252"))
            i += 1
    return "".join(out)


def fix_text(text: str) -> str:
    for old, new in MOJIBAKE_MAP.items():
        text = text.replace(old, new)
    return text


def needs_fix(text: str) -> bool:
    return any(k in text for k in MOJIBAKE_MAP) or "\ufffd" in text


def main():
    changed = []
    for path in sorted(Path(".").rglob("*")):
        if any(s in path.parts for s in SKIP):
            continue
        if path.suffix not in {".html", ".js", ".md"}:
            continue
        raw = path.read_bytes()
        try:
            text = raw.decode("utf-8")
            if not needs_fix(text):
                continue
        except UnicodeDecodeError:
            text = decode_mixed(raw)
        fixed = fix_text(text)
        if fixed == text and raw == fixed.encode("utf-8"):
            continue
        path.write_text(fixed, encoding="utf-8", newline="\n")
        fixed.encode("utf-8")
        changed.append(str(path))
    print("repaired", len(changed))
    for c in changed:
        print(c)


if __name__ == "__main__":
    main()
