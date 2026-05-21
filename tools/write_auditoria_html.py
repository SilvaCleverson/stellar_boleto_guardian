# -*- coding: utf-8 -*-
"""Gera auditoria-seguranca.html (PT/EN/ES) em UTF-8 com entidades HTML no corpo."""
from pathlib import Path

WEB = Path(__file__).resolve().parents[1] / "web"
COMMIT = "https://github.com/SilvaCleverson/stellar_boleto_guardian/commit/e7da273a3366e90addc22bd07a66afec06ecbe94"
REPORT_URL = "https://www.boletoguardian.xyz/auditoria-seguranca.html"

LANGS = {
    "pt": {
        "file": "auditoria-seguranca.html",
        "html_lang": "pt-BR",
        "self": "auditoria-seguranca.html",
        "en": "auditoria-seguranca-en.html",
        "es": "auditoria-seguranca-es.html",
        "desc": (
            "Auditoria de Seguran\u00e7a D-021 \u2014 Boleto Guardian. "
            "Exposi\u00e7\u00e3o de ADMIN_API_KEY no navegador e corre\u00e7\u00e3o por Sergio Artero (CTO)."
        ),
        "title": "Auditoria de Seguran\u00e7a D-021 | Guardian Labs \u00b7 Boleto Guardian",
        "back": "Whitepaper",
        "validate": "Validar boleto",
        "h1": "Auditoria de Seguran\u00e7a \u2014 D-021",
        "hero": (
            "Relat\u00f3rio p\u00fablico da vulnerabilidade cr\u00edtica identificada na Sprint 3 "
            "(Stellar 37 Degrees) e da corre\u00e7\u00e3o implementada."
        ),
        "meta": "Projeto: Boleto Guardian \u00b7 Corre\u00e7\u00e3o: Sergio Artero (CTO) \u00b7 Data: 20/05/2026",
        "s1": "1. Achado cr&iacute;tico",
        "s1_vuln": "Vulnerabilidade",
        "s1_vuln_p": (
            "Exposi&ccedil;&atilde;o da <code>ADMIN_API_KEY</code> (credencial administrativa secreta da API) "
            "no <strong>navegador</strong>, na p&aacute;gina interna <a href=\"registro.html\">registro.html</a>."
        ),
        "s1_how": "Como foi detectada",
        "s1_how_p": "Revis&atilde;o de seguran&ccedil;a com DevTools do Chrome no fluxo de registro interno:",
        "s1_li1": "<strong>Application &rarr; Session Storage:</strong> chave gravada ap&oacute;s &quot;Salvar chave na sess&atilde;o&quot;.",
        "s1_li2": "<strong>Network &rarr; POST /api/blockchain:</strong> cabe&ccedil;alho <code>x-admin-key</code> com o segredo em texto claro.",
        "s1_cap": (
            "Figura 1 &mdash; Evid&ecirc;ncia: cabe&ccedil;alho <code>x-admin-key</code> vis&iacute;vel no DevTools. "
            "A conta Stellar <code>G&hellip;</code> na tela &eacute; dado p&uacute;blico; o achado cr&iacute;tico &eacute; a "
            "<strong>chave administrativa secreta</strong>."
        ),
        "s1_risk": "Risco",
        "th_a": "Aspecto",
        "th_i": "Impacto",
        "td_c": "Confidencialidade",
        "td_c_v": "C&oacute;pia da chave admin e chamadas a endpoints privilegiados",
        "td_i": "Integridade",
        "td_i_v": "Registro indevido de boletos on-chain",
        "td_s": "Severidade",
        "td_s_v": "Cr&iacute;tica",
        "s2": "2. Corre&ccedil;&atilde;o realizada",
        "s2_commit": "Commit (corre&ccedil;&atilde;o final):",
        "s2_li1": "<code>web/registro.html</code> &mdash; removidos <code>sessionStorage</code> e <code>x-admin-key</code> no cliente.",
        "s2_li2": "<code>backend/server.js</code> &mdash; <code>requireAdmin()</code> usa apenas <code>ADMIN_API_KEY</code> no <code>.env</code> do servidor.",
        "s2_li3": "Docker &mdash; API na rede interna; segredo n&atilde;o trafega no navegador.",
        "s3": "3. Resumo para o formul&aacute;rio",
        "s3_v": "<strong>Vulnerabilidade:</strong>",
        "s3_r": "<strong>Risco:</strong>",
        "s3_r_v": "abuso de APIs administrativas (registro/consulta on-chain).",
        "s3_f": "<strong>Corre&ccedil;&atilde;o:</strong>",
        "s3_f_v": "chave s&oacute; no servidor; front sem segredo.",
        "s3_c": "<strong>Commit:</strong>",
        "s3_rep": "<strong>Relat&oacute;rio:</strong>",
        "s4": "4. Refer&ecirc;ncias",
        "s4_li1": "RT do produto &mdash; decis&atilde;o <strong>D-021</strong>",
        "index": "index.html",
        "validation": "validation.html",
    },
    "en": {
        "file": "auditoria-seguranca-en.html",
        "html_lang": "en",
        "self": "auditoria-seguranca-en.html",
        "en": "auditoria-seguranca-en.html",
        "es": "auditoria-seguranca-es.html",
        "desc": (
            "Security Audit D-021 \u2014 Boleto Guardian. ADMIN_API_KEY exposed in the browser; "
            "fix by Sergio Artero (CTO)."
        ),
        "title": "Security Audit D-021 | Guardian Labs \u00b7 Boleto Guardian",
        "back": "Whitepaper",
        "validate": "Validate slip",
        "h1": "Security Audit \u2014 D-021",
        "hero": (
            "Public report on the critical vulnerability identified in Sprint 3 "
            "(Stellar 37 Degrees) and the implemented fix."
        ),
        "meta": "Project: Boleto Guardian \u00b7 Fix: Sergio Artero (CTO) \u00b7 Date: 20/05/2026",
        "s1": "1. Critical finding",
        "s1_vuln": "Vulnerability",
        "s1_vuln_p": (
            "Exposure of <code>ADMIN_API_KEY</code> (secret administrative API credential) in the "
            "<strong>browser</strong> on the internal page <a href=\"registro.html\">registro.html</a>."
        ),
        "s1_how": "How it was detected",
        "s1_how_p": "Security review with Chrome DevTools during the internal registration flow:",
        "s1_li1": "<strong>Application &rarr; Session Storage:</strong> key saved after &quot;Save key to session&quot;.",
        "s1_li2": "<strong>Network &rarr; POST /api/blockchain:</strong> <code>x-admin-key</code> header with the secret in plain text.",
        "s1_cap": (
            "Figure 1 &mdash; Evidence: <code>x-admin-key</code> header visible in DevTools. "
            "The Stellar account <code>G&hellip;</code> on screen is public data; the critical finding is the "
            "<strong>secret administrative key</strong>."
        ),
        "s1_risk": "Risk",
        "th_a": "Aspect",
        "th_i": "Impact",
        "td_c": "Confidentiality",
        "td_c_v": "Copy admin key and call privileged endpoints",
        "td_i": "Integrity",
        "td_i_v": "Unauthorized on-chain slip registration",
        "td_s": "Severity",
        "td_s_v": "Critical",
        "s2": "2. Fix implemented",
        "s2_commit": "Commit (final fix):",
        "s2_li1": "<code>web/registro.html</code> &mdash; removed <code>sessionStorage</code> and client <code>x-admin-key</code>.",
        "s2_li2": "<code>backend/server.js</code> &mdash; <code>requireAdmin()</code> uses <code>ADMIN_API_KEY</code> from server <code>.env</code> only.",
        "s2_li3": "Docker &mdash; API on internal network; secret never travels in the browser.",
        "s3": "3. Form submission summary",
        "s3_v": "<strong>Vulnerability:</strong>",
        "s3_r": "<strong>Risk:</strong>",
        "s3_r_v": "abuse of admin APIs (on-chain register/query).",
        "s3_f": "<strong>Fix:</strong>",
        "s3_f_v": "key server-side only; no secret in the front end.",
        "s3_c": "<strong>Commit:</strong>",
        "s3_rep": "<strong>Full report:</strong>",
        "s4": "4. References",
        "s4_li1": "Product RT &mdash; decision <strong>D-021</strong>",
        "index": "index-en.html",
        "validation": "validation-en.html",
    },
    "es": {
        "file": "auditoria-seguranca-es.html",
        "html_lang": "es",
        "self": "auditoria-seguranca-es.html",
        "en": "auditoria-seguranca-en.html",
        "es": "auditoria-seguranca-es.html",
        "desc": (
            "Auditor\u00eda de Seguridad D-021 \u2014 Boleto Guardian. Exposici\u00f3n de ADMIN_API_KEY "
            "en el navegador; correcci\u00f3n por Sergio Artero (CTO)."
        ),
        "title": "Auditor\u00eda de Seguridad D-021 | Guardian Labs \u00b7 Boleto Guardian",
        "back": "Whitepaper",
        "validate": "Validar boleto",
        "h1": "Auditor\u00eda de Seguridad \u2014 D-021",
        "hero": (
            "Informe p\u00fablico de la vulnerabilidad cr\u00edtica identificada en la Sprint 3 "
            "(Stellar 37 Degrees) y la correcci\u00f3n implementada."
        ),
        "meta": "Proyecto: Boleto Guardian \u00b7 Correcci\u00f3n: Sergio Artero (CTO) \u00b7 Fecha: 20/05/2026",
        "s1": "1. Hallazgo cr&iacute;tico",
        "s1_vuln": "Vulnerabilidad",
        "s1_vuln_p": (
            "Exposici&oacute;n de <code>ADMIN_API_KEY</code> (credencial administrativa secreta de la API) en el "
            "<strong>navegador</strong>, en la p&aacute;gina interna <a href=\"registro.html\">registro.html</a>."
        ),
        "s1_how": "C&oacute;mo se detect&oacute;",
        "s1_how_p": "Revisi&oacute;n de seguridad con DevTools de Chrome en el flujo de registro interno:",
        "s1_li1": "<strong>Application &rarr; Session Storage:</strong> clave guardada tras &quot;Guardar clave en la sesi&oacute;n&quot;.",
        "s1_li2": "<strong>Network &rarr; POST /api/blockchain:</strong> cabecera <code>x-admin-key</code> con el secreto en texto claro.",
        "s1_cap": (
            "Figura 1 &mdash; Evidencia: cabecera <code>x-admin-key</code> visible en DevTools. "
            "La cuenta Stellar <code>G&hellip;</code> en pantalla es dato p&uacute;blico; el hallazgo cr&iacute;tico es la "
            "<strong>clave administrativa secreta</strong>."
        ),
        "s1_risk": "Riesgo",
        "th_a": "Aspecto",
        "th_i": "Impacto",
        "td_c": "Confidencialidad",
        "td_c_v": "Copia de la clave admin y llamadas a endpoints privilegiados",
        "td_i": "Integridad",
        "td_i_v": "Registro indebido de boletos on-chain",
        "td_s": "Severidad",
        "td_s_v": "Cr&iacute;tica",
        "s2": "2. Correcci&oacute;n realizada",
        "s2_commit": "Commit (correcci&oacute;n final):",
        "s2_li1": "<code>web/registro.html</code> &mdash; eliminados <code>sessionStorage</code> y <code>x-admin-key</code> en el cliente.",
        "s2_li2": "<code>backend/server.js</code> &mdash; <code>requireAdmin()</code> usa solo <code>ADMIN_API_KEY</code> en el <code>.env</code> del servidor.",
        "s2_li3": "Docker &mdash; API en red interna; el secreto no viaja en el navegador.",
        "s3": "3. Resumen para el formulario",
        "s3_v": "<strong>Vulnerabilidad:</strong>",
        "s3_r": "<strong>Riesgo:</strong>",
        "s3_r_v": "abuso de APIs administrativas (registro/consulta on-chain).",
        "s3_f": "<strong>Correcci&oacute;n:</strong>",
        "s3_f_v": "clave solo en el servidor; front sin secreto.",
        "s3_c": "<strong>Commit:</strong>",
        "s3_rep": "<strong>Informe:</strong>",
        "s4": "4. Referencias",
        "s4_li1": "RT del producto &mdash; decisi&oacute;n <strong>D-021</strong>",
        "index": "index-es.html",
        "validation": "validation-es.html",
    },
}

STYLES = """
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: linear-gradient(145deg, #040d18 0%, #0B1F3A 50%, #102a4a 100%);
      color: #1e293b;
      min-height: 100vh;
      padding: 24px 16px 48px;
    }
    .wrap { max-width: 820px; margin: 0 auto; }
    .nav-top { margin-bottom: 12px; display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; }
    .nav-top a { color: #93c5fd; text-decoration: none; font-size: 0.88rem; }
    .nav-top a:hover { text-decoration: underline; color: #fff; }
    .lang-switch { display: flex; gap: 6px; margin-left: auto; }
    .lang-switch a {
      color: rgba(255,255,255,0.85);
      text-decoration: none;
      font-size: 0.78rem;
      padding: 4px 10px;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(11,31,58,0.5);
    }
    .lang-switch a:hover { background: rgba(255,255,255,0.15); color: #fff; }
    .lang-switch a.active {
      background: rgba(26,127,212,0.45);
      border-color: rgba(244,200,66,0.5);
      color: #fff;
      font-weight: 600;
    }
    .hero {
      position: relative;
      background: linear-gradient(135deg, #0B1F3A 0%, #061428 100%);
      border: 1px solid rgba(244, 200, 66, 0.35);
      border-radius: 16px;
      color: #f0f4f8;
      padding: 28px 24px;
      margin-bottom: 20px;
    }
    .hero-labs {
      font-size: 0.72rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #F4C842;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .hero h1 { font-size: 1.65rem; margin-bottom: 8px; }
    .hero p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }
    .hero .meta { margin-top: 14px; font-size: 0.85rem; color: #cbd5e1; }
    .card {
      background: #fff;
      border-radius: 12px;
      padding: 24px 28px;
      margin-bottom: 16px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.12);
    }
    .card h2 { font-size: 1.2rem; color: #0B1F3A; margin-bottom: 12px; border-bottom: 2px solid #F4C842; padding-bottom: 6px; }
    .card h3 { font-size: 1rem; color: #334155; margin: 16px 0 8px; }
    .card p, .card li { line-height: 1.6; margin-bottom: 10px; color: #475569; }
    .card ul { padding-left: 1.25rem; margin-bottom: 12px; }
    .card code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 0.88em; }
    .card a { color: #1A7FD4; word-break: break-all; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 0.9rem; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
    th { background: #f8fafc; color: #0B1F3A; }
    .evidence { margin: 16px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .evidence img { width: 100%; height: auto; display: block; }
    .evidence figcaption { padding: 10px 12px; font-size: 0.82rem; color: #64748b; background: #f8fafc; }
    .commit-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 14px; margin: 12px 0; }
    .form-box { background: #fefce8; border: 1px solid #fde047; border-radius: 8px; padding: 14px; font-size: 0.9rem; line-height: 1.5; }
    footer { text-align: center; margin-top: 24px; font-size: 0.85rem; color: #94a3b8; }
"""


def render(code: str, L: dict) -> str:
    d = L[code]
    pt, en, es = L["pt"]["self"], L["en"]["self"], L["es"]["self"]
    apt = ' class="active"' if code == "pt" else ""
    aen = ' class="active"' if code == "en" else ""
    aes = ' class="active"' if code == "es" else ""
    urls = {
        "pt": "https://www.boletoguardian.xyz/auditoria-seguranca.html",
        "en": "https://www.boletoguardian.xyz/auditoria-seguranca-en.html",
        "es": "https://www.boletoguardian.xyz/auditoria-seguranca-es.html",
    }
    return f"""<!DOCTYPE html>
<html lang="{d["html_lang"]}">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{d["desc"]}">
  <title>{d["title"]}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>{STYLES}</style>
</head>
<body>
  <div class="wrap">
    <nav class="nav-top">
      <a href="{d["index"]}">&larr; {d["back"]}</a>
      <a href="{d["validation"]}">{d["validate"]}</a>
      <a href="https://github.com/SilvaCleverson/stellar_boleto_guardian" target="_blank" rel="noopener">GitHub</a>
      <div class="lang-switch">
        <a href="{pt}"{apt}>PT</a>
        <a href="{en}"{aen}>EN</a>
        <a href="{es}"{aes}>ES</a>
      </div>
    </nav>
    <header class="hero">
      <p class="hero-labs">Guardian Labs</p>
      <h1>{d["h1"]}</h1>
      <p>{d["hero"]}</p>
      <p class="meta"><strong>{d["meta"]}</strong></p>
    </header>
    <article class="card">
      <h2>{d["s1"]}</h2>
      <h3>{d["s1_vuln"]}</h3>
      <p>{d["s1_vuln_p"]}</p>
      <h3>{d["s1_how"]}</h3>
      <p>{d["s1_how_p"]}</p>
      <ul>
        <li>{d["s1_li1"]}</li>
        <li>{d["s1_li2"]}</li>
      </ul>
      <figure class="evidence">
        <img src="assets/auditoria/ChaveExposta.jpeg" alt="DevTools x-admin-key" width="1200" height="675" decoding="async">
        <figcaption>{d["s1_cap"]}</figcaption>
      </figure>
      <h3>{d["s1_risk"]}</h3>
      <table>
        <thead><tr><th>{d["th_a"]}</th><th>{d["th_i"]}</th></tr></thead>
        <tbody>
          <tr><td>{d["td_c"]}</td><td>{d["td_c_v"]}</td></tr>
          <tr><td>{d["td_i"]}</td><td>{d["td_i_v"]}</td></tr>
          <tr><td>{d["td_s"]}</td><td><strong>{d["td_s_v"]}</strong></td></tr>
        </tbody>
      </table>
    </article>
    <article class="card">
      <h2>{d["s2"]}</h2>
      <div class="commit-box">
        <p><strong>{d["s2_commit"]}</strong></p>
        <p><a href="{COMMIT}" target="_blank" rel="noopener">e7da273 &mdash; refactor: backend absorve ADMIN_API_KEY &mdash; nenhum header em tr&acirc;nsito</a></p>
      </div>
      <ul>
        <li>{d["s2_li1"]}</li>
        <li>{d["s2_li2"]}</li>
        <li>{d["s2_li3"]}</li>
      </ul>
    </article>
    <article class="card">
      <h2>{d["s3"]}</h2>
      <div class="form-box">
        <p>{d["s3_v"]} <code>ADMIN_API_KEY</code> + <code>sessionStorage</code> + <code>x-admin-key</code> (DevTools).</p>
        <p>{d["s3_r"]} {d["s3_r_v"]}</p>
        <p>{d["s3_f"]} {d["s3_f_v"]}</p>
        <p>{d["s3_c"]} <a href="{COMMIT}">e7da273</a></p>
        <p>{d["s3_rep"]} <a href="{urls[code]}">{urls[code].replace("https://", "")}</a></p>
      </div>
    </article>
    <article class="card">
      <h2>{d["s4"]}</h2>
      <ul>
        <li>{d["s4_li1"]}</li>
        <li><code>docs/Auditoria/AuditoriaDeSeguranca.md</code></li>
      </ul>
    </article>
    <footer>
      <p>&copy; 2026 Guardian Labs &middot; Boleto Guardian &middot; MIT</p>
    </footer>
  </div>
</body>
</html>
"""


def main():
    for code in ("pt", "en", "es"):
        path = WEB / LANGS[code]["file"]
        html = render(code, LANGS)
        path.write_text(html, encoding="utf-8", newline="\n")
        t = path.read_text(encoding="utf-8")
        assert "\ufffd" not in t, path.name
        print("OK", path.name)


if __name__ == "__main__":
    main()
