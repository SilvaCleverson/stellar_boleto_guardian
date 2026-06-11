(function () {
  function getMessages(lang) {
    if (lang === 'en') {
      return {
        sending: 'Sending...',
        submit: 'Send message',
        success: 'Message sent. We will get back to you soon.',
        notConfigured: 'Contact form is not configured. Email us at guardianlabsw3@gmail.com',
        sendError: 'Could not send. Try again or email guardianlabsw3@gmail.com',
        networkError: 'Network error. Check your connection and try again.'
      };
    }
    if (lang === 'es') {
      return {
        sending: 'Enviando...',
        submit: 'Enviar mensaje',
        success: 'Mensaje enviado. Nos pondremos en contacto pronto.',
        notConfigured: 'Formulario no configurado. Escriba a guardianlabsw3@gmail.com',
        sendError: 'No se pudo enviar. Intente de nuevo o escriba a guardianlabsw3@gmail.com',
        networkError: 'Error de red. Verifique su conexion e intente de nuevo.'
      };
    }
    return {
      sending: 'Enviando...',
      submit: 'Enviar mensagem',
      success: 'Mensagem enviada. Em breve entraremos em contato.',
      notConfigured: 'Formulario nao configurado. Escreva para guardianlabsw3@gmail.com',
      sendError: 'Nao foi possivel enviar. Tente novamente ou escreva para guardianlabsw3@gmail.com',
      networkError: 'Erro de rede. Verifique sua conexao e tente novamente.'
    };
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var lang = document.documentElement.lang || 'pt-BR';
    var langKey = lang.indexOf('en') === 0 ? 'en' : lang.indexOf('es') === 0 ? 'es' : 'pt';
    var msg = getMessages(langKey);
    var successEl = document.getElementById('form-success');
    var errorEl = document.getElementById('form-error');
    var btn = form.querySelector('.form-submit');
    var webhookUrl = (window.CONTACT_WEBHOOK_URL || '').trim();

    if (new URLSearchParams(window.location.search).get('enviado') === '1' && successEl) {
      successEl.classList.add('visible');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (errorEl) errorEl.classList.remove('visible');
      if (successEl) successEl.classList.remove('visible');

      var nome = form.nome.value.trim();
      var email = form.email.value.trim();
      var mensagem = form.mensagem.value.trim();
      if (!nome || !email || !mensagem) return;

      if (!webhookUrl) {
        if (errorEl) {
          errorEl.textContent = msg.notConfigured;
          errorEl.classList.add('visible');
        }
        return;
      }

      btn.disabled = true;
      btn.textContent = msg.sending;

      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome, email: email, mensagem: mensagem })
      })
        .then(function (res) {
          if (!res.ok) throw new Error('http_' + res.status);
          if (successEl) successEl.classList.add('visible');
          form.reset();
          history.replaceState({}, '', window.location.pathname + '?enviado=1');
        })
        .catch(function () {
          if (errorEl) {
            errorEl.textContent = msg.sendError;
            errorEl.classList.add('visible');
          }
        })
        .finally(function () {
          btn.disabled = false;
          btn.textContent = msg.submit;
        });
    });
  });
})();
