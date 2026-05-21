# -*- coding: utf-8 -*-
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
META = (
    '<p class="meta"><strong>Guardian Labs:</strong> Cleverson Silva (CEO) '
    "\u00b7 Sergio Artero (CTO) \u00b7 Demetrio De Los Rios (CMO) "
    "\u00b7 <strong>{date_label}:</strong> {date_val} 2026</p>"
)
for name, label, val in [
    ("index.html", "Data", "Mar\u00e7o"),
    ("index-en.html", "Date", "March"),
    ("index-es.html", "Fecha", "marzo"),
]:
    p = ROOT / "web" / name
    t = p.read_text(encoding="utf-8")
    new = META.format(date_label=label, date_val=val)
    t2 = re.sub(r'<p class="meta">.*?</p>', new, t, count=1)
    p.write_text(t2, encoding="utf-8", newline="\n")
    print(name, "updated" if t2 != t else "unchanged")
