// Kontaktformular: schickt die Nachricht an den Server, der sie an info@bookery-app.de mailt (api/testen.py).
// Klappt das nicht, bietet der Hinweis eine vorbereitete E-Mail mit demselben Text an.
(() => {
  const form = document.getElementById('kontakt');
  const email = document.getElementById('k-email');
  const text = document.getElementById('k-text');
  const note = document.getElementById('k-note');
  const noteText = note.innerHTML;
  const button = form.querySelector('.send');
  const label = button.querySelector('span');
  const count = document.querySelector('#k-text-hint .count');
  const max = Number(text.maxLength);
  const themen = { frage: 'Frage', fehler: 'Fehler', idee: 'Idee', sonstiges: 'Sonstiges' };

  const err = (field, msg) => {
    field.setAttribute('aria-invalid', 'true');
    document.querySelector('#' + field.getAttribute('aria-describedby') + ' .err').textContent = msg;
  };
  const clear = field => {
    field.removeAttribute('aria-invalid');
    document.querySelector('#' + field.getAttribute('aria-describedby') + ' .err').textContent = '';
  };
  const fail = html => { note.innerHTML = html; note.classList.add('error'); };

  // Zeichenzähler erst gegen Ende, damit das Formular ruhig bleibt.
  const zaehlen = () => {
    const rest = max - text.value.length;
    count.textContent = rest < 500 ? 'noch ' + rest + ' Zeichen' : '';
    count.classList.toggle('near', rest < 100);
  };
  [email, text].forEach(f => f.addEventListener('input', () => {
    clear(f);
    note.classList.remove('error'); note.innerHTML = noteText;
  }));
  text.addEventListener('input', zaehlen);

  const mailto = (thema, msg) => 'mailto:info@bookery-app.de?subject=' + encodeURIComponent('bookery: ' + themen[thema]) +
    '&body=' + encodeURIComponent(msg);

  form.addEventListener('submit', async ev => {
    ev.preventDefault();
    const addr = email.value.trim();
    const msg = text.value.trim();
    const thema = form.elements.thema.value;
    let erstes = null;
    if (!msg) { err(text, 'Schreib uns kurz, worum es geht.'); erstes = text; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(addr)) {
      err(email, addr ? 'Das sieht noch nicht nach einer E-Mail-Adresse aus.' : 'Damit wir dir antworten können.');
      erstes = email;
    }
    if (erstes) return erstes.focus();

    button.disabled = true;
    label.textContent = 'Wird gesendet …';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new URLSearchParams(new FormData(form)) });
      if (res.status === 429) throw new Error('limit');
      if (!res.ok) throw new Error('server');
      document.getElementById('k-sent-to').textContent = addr;
      form.classList.add('sent');
      const box = document.getElementById('k-sent');
      box.hidden = false;
      box.focus({ preventScroll: true });
      form.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    } catch (e) {
      const link = '<a href="' + mailto(thema, msg) + '">';
      fail(e.message === 'limit'
        ? 'Gerade kamen sehr viele Nachrichten. ' + link + 'Per E-Mail senden</a> – dein Text ist schon drin.'
        : 'Das hat gerade nicht geklappt. ' + link + 'Per E-Mail senden</a> – dein Text ist schon drin.');
    } finally {
      button.disabled = false;
      label.textContent = 'Nachricht senden';
    }
  });

  document.getElementById('k-again').addEventListener('click', () => {
    text.value = '';
    zaehlen();
    form.classList.remove('sent');
    document.getElementById('k-sent').hidden = true;
    text.focus();
  });
})();
