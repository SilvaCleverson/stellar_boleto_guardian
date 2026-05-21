# -*- coding: utf-8 -*-
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "web" / "auditoria-seguranca.html"
COMMIT = "https://github.com/SilvaCleverson/stellar_boleto_guardian/commit/e7da273a3366e90addc22bd07a66afec06ecbe94"

DESC = (
    "Auditoria de Seguran\u00e7a D-021 \u2014 Boleto Guardian. "
    "Exposi\u00e7\u00e3o de ADMIN_API_KEY no navegador e corre\u00e7\u00e3o por Sergio Artero (CTO)."
)
TITLE = "Auditoria de Seguran\u00e7a D-021 | Guardian Labs \u00b7 Boleto Guardian"
H1 = "Auditoria de Seguran\u00e7a \u2014 D-021"
HERO = (
    "Relat\u00f3rio p\u00fablico da vulnerabilidade cr\u00edtica identificada na Sprint 3 "
    "(Stellar 37 Degrees) e da corre\u00e7\u00e3o implementada."
)
META = "Projeto: Boleto Guardian \u00b7 Corre\u00e7\u00e3o: Sergio Artero (CTO) \u00b7 Data: 20/05/2026"

HTML = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="__DESC__">
  <title>__TITLE__</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: linear-gradient(145deg, #040d18 0%, #0B1F3A 50%, #102a4a 100%);
      color: #1e293b;
      min-height: 100vh;
      padding: 24px 16px 48px;
    }
    .wrap { max-width: 820px; margin: 0 auto; }
    .hero {
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
    .nav-top { margin-bottom: 12px; }
    .nav-top a { color: #93c5fd; text-decoration: none; font-size: 0.88rem; margin-right: 14px; }
    .nav-top a:hover { text-decoration: underline; color: #fff; }
    footer { text-align: center; margin-top: 24px; font-size: 0.85rem; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="wrap">
    <nav class="nav-top">
      <a href="index.html">&larr; Whitepaper</a>
      <a href="validation.html">Validar boleto</a>
      <a href="https://github.com/SilvaCleverson/stellar_boleto_guardian" target="_blank" rel="noopener">GitHub</a>
    </nav>
    <header class="hero">
      <p class="hero-labs">Guardian Labs</p>
      <h1>__H1__</h1>
      <p>__HERO__</p>
      <p class="meta"><strong>__META__</strong></p>
    </header>
    <article class="card">
      <h2>1. Achado cr&iacute;tico</h2>
      <h3>Vulnerabilidade</h3>
      <p>Exposi&ccedil;&atilde;o da <code>ADMIN_API_KEY</code> (credencial administrativa secreta da API) no <strong>navegador</strong>, na p&aacute;gina interna <a href="registro.html">registro.html</a>.</p>
      <h3>Como foi detectada</h3>
      <p>Revis&atilde;o de seguran&ccedil;a com DevTools do Chrome no fluxo de registro interno:</p>
      <ul>
        <li><strong>Application &rarr; Session Storage:</strong> chave gravada ap&oacute;s &quot;Salvar chave na sess&atilde;o&quot;.</li>
        <li><strong>Network &rarr; POST /api/blockchain:</strong> cabe&ccedil;alho <code>x-admin-key</code> com o segredo em texto claro.</li>
      </ul>
      <figure class="evidence">
        <img src="assets/auditoria/ChaveExposta.jpeg" alt="DevTools: cabe&ccedil;alho x-admin-key" width="1200" height="675" decoding="async">
        <figcaption>Figura 1 &mdash; Evid&ecirc;ncia: cabe&ccedil;alho <code>x-admin-key</code> vis&iacute;vel no DevTools. A conta Stellar <code>G&hellip;</code> na tela &eacute; dado p&uacute;blico; o achado cr&iacute;tico &eacute; a <strong>chave administrativa secreta</strong>.</figcaption>
      </figure>
      <h3>Risco</h3>
      <table>
        <thead><tr><th>Aspecto</th><th>Impacto</th></tr></thead>
        <tbody>
          <tr><td>Confidencialidade</td><td>C&oacute;pia da chave admin e chamadas a endpoints privilegiados</td></tr>
          <tr><td>Integridade</td><td>Registro indevido de boletos on-chain</td></tr>
          <tr><td>Severidade</td><td><strong>Cr&iacute;tica</strong></td></tr>
        </tbody>
      </table>
    </article>
    <article class="card">
      <h2>2. Corre&ccedil;&atilde;o realizada</h2>
      <div class="commit-box">
        <p><strong>Commit (corre&ccedil;&atilde;o final):</strong></p>
        <p><a href="__COMMIT__" target="_blank" rel="noopener">e7da273 &mdash; refactor: backend absorve ADMIN_API_KEY &mdash; nenhum header em tr&acirc;nsito</a></p>
      </div>
      <ul>
        <li><code>web/registro.html</code> &mdash; removidos <code>sessionStorage</code> e <code>x-admin-key</code> no cliente.</li>
        <li><code>backend/server.js</code> &mdash; <code>requireAdmin()</code> usa apenas <code>ADMIN_API_KEY</code> no <code>.env</code> do servidor.</li>
        <li>Docker &mdash; API na rede interna; segredo n&atilde;o trafega no navegador.</li>
      </ul>
    </article>
    <article class="card">
      <h2>3. Resumo para o formul&aacute;rio</h2>
      <div class="form-box">
        <p><strong>Vulnerabilidade:</strong> <code>ADMIN_API_KEY</code> em <code>sessionStorage</code> e header <code>x-admin-key</code> no DevTools.</p>
        <p><strong>Risco:</strong> abuso de APIs administrativas (registro/consulta on-chain).</p>
        <p><strong>Corre&ccedil;&atilde;o:</strong> chave s&oacute; no servidor; front sem segredo.</p>
        <p><strong>Commit:</strong> <a href="__COMMIT__">github.com/.../e7da273</a></p>
        <p><strong>Relat&oacute;rio:</strong> <a href="https://www.boletoguardian.xyz/auditoria-seguranca.html">boletoguardian.xyz/auditoria-seguranca.html</a></p>
      </div>
    </article>
    <article class="card">
      <h2>4. Refer&ecirc;ncias</h2>
      <ul>
        <li>RT do produto &mdash; decis&atilde;o <strong>D-021</strong></li>
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
    body = (
        HTML.replace("__DESC__", DESC)
        .replace("__TITLE__", TITLE)
        .replace("__H1__", H1)
        .replace("__HERO__", HERO)
        .replace("__META__", META)
        .replace("__COMMIT__", COMMIT)
    )
    OUT.write_text(body, encoding="utf-8", newline="\n")
    t = OUT.read_text(encoding="utf-8")
    assert "\ufffd" not in t and "cr&iacute;tico" in t
    print("OK", OUT)


if __name__ == "__main__":
    main()
