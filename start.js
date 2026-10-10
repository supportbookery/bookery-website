(() => {
  // Farbwelten aus der App (ThemePalette), jeweils [hell, dunkel].
  const P = {
    sage:     { paper:['#E6F6E8','#16241B'], card:['#FAFCF6','#26382D'], border:['#D6EDDA','#3D5744'], chip:['#E7F6E9','#314434'], ink:['#283C34','#FAFBFA'], muted:['#7D8379','#BFC4BD'], accent:['#47785B','#AFD0BB'], soft:['#A4BC9C','#799D72'], 'accent-card':['#D2F2DD','#223E2A'] },
    rose:     { paper:['#F9E4E9','#241619'], card:['#FEF7F8','#3E282F'], border:['#F2D1D9','#65414B'], chip:['#FAE5EA','#4C333A'], ink:['#4A2B33','#FCF9F9'], muted:['#8C7479','#C5B7BA'], accent:['#B0405F','#EEB0C1'], soft:['#E2A5B4','#B77E8C'], 'accent-card':['#F6D1DB','#4A2832'] },
    lavender: { paper:['#EAE4F9','#191625'], card:['#F9F7FE','#2F2A42'], border:['#DAD2F1','#4D456C'], chip:['#EAE5F9','#3B3551'], ink:['#342E48','#F9F9FB'], muted:['#7C7790','#BBB8C5'], accent:['#634EA8','#C3B7EE'], soft:['#B2A4DD','#9185BC'], 'accent-card':['#DBD2F6','#332B50'] },
    sky:      { paper:['#E4EFF9','#151D25'], card:['#F7FBFE','#26313D'], border:['#D1E2F2','#3B4F60'], chip:['#E5F0F9','#2F3D4C'], ink:['#24384A','#FAFBFC'], muted:['#728290','#B6BFC7'], accent:['#336A98','#A4C8E5'], soft:['#99BCD8','#6894B5'], 'accent-card':['#D0E5F6','#233648'] },
    peach:    { paper:['#F9EBE1','#241A14'], card:['#FEFAF5','#3B2E26'], border:['#F2DBCC','#5E4939'], chip:['#FAECE2','#4A382D'], ink:['#4A3226','#FCFBF9'], muted:['#8D7A6E','#C7BCB5'], accent:['#B8511B','#F0B694'], soft:['#E6B18E','#C2825B'], 'accent-card':['#F6DDCE','#442F21'] },
    graphite: { paper:['#EAEDEF','#191A1C'], card:['#FBFCFD','#2D2E31'], border:['#DCE0E2','#484B51'], chip:['#EBEDEF','#393A3E'], ink:['#2B2B2E','#FAFAFB'], muted:['#7A7A7F','#BABABE'], accent:['#4B5B6B','#B5C1CE'], soft:['#B4BEC7','#838F9B'], 'accent-card':['#DEE4EA','#2E3238'] },
  };
  const dark = matchMedia('(prefers-color-scheme: dark)');
  const root = document.documentElement;
  const icons = document.querySelectorAll('.app-icon');
  const big = document.getElementById('bigIcon');
  const meta = document.querySelectorAll('meta[name="theme-color"]');
  let current = 'sage';
  try { current = localStorage.getItem('bookery.palette') || 'sage'; } catch (e) {}
  if (!P[current]) current = 'sage';

  function apply(id, animate) {
    const pal = P[id], i = dark.matches ? 1 : 0;
    for (const k in pal) root.style.setProperty('--' + k, pal[k][i]);
    root.style.setProperty('--on-accent', dark.matches ? pal.paper[1] : pal.card[0]);
    meta.forEach((m, n) => m.setAttribute('content', pal.paper[n]));
    icons.forEach(img => img.src = 'icons/' + id + '.png');
    document.querySelectorAll('.swatch').forEach(b => b.setAttribute('aria-pressed', b.dataset.palette === id));
    if (animate && big) { big.classList.add('pop'); setTimeout(() => big.classList.remove('pop'), 180); }
  }
  apply(current, false);
  dark.addEventListener('change', () => apply(current, false));
  document.querySelectorAll('.swatch').forEach(b => b.addEventListener('click', () => {
    current = b.dataset.palette;
    try { localStorage.setItem('bookery.palette', current); } catch (e) {}
    apply(current, true);
  }));

  // Kopfzeile bekommt beim Scrollen eine Linie.
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Kommt man von außen mit #testen o. ä. herein, springt Safari ohne scroll-padding-top
  // und der Abschnitt rutscht unter die Kopfzeile. Nach dem Laden einmal genau hinscrollen,
  // außer man hat schon selbst gescrollt.
  const target = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target) {
    let moved = false;
    ['wheel', 'touchmove', 'keydown'].forEach(t => addEventListener(t, () => { moved = true; }, { once: true, passive: true }));
    const align = () => {
      if (moved) return;
      const pad = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
      scrollTo({ top: target.getBoundingClientRect().top + scrollY - pad, behavior: 'instant' });
    };
    requestAnimationFrame(align);
    addEventListener('load', () => requestAnimationFrame(align), { once: true });
  }

  // Einblenden beim Scrollen, das Regal füllt sich einmal.
  const show = el => el.classList.add(el.id === 'shelf' ? 'filled' : 'in');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
    }), { threshold: .15, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal, #shelf').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal, #shelf').forEach(show);
  }

  // Anmeldung zum Testen: Adresse an den Server, der sie an den Support mailt.
  // Klappt das nicht, öffnet sich eine vorbereitete Mail als Ausweg.
  const form = document.getElementById('signup');
  const input = document.getElementById('signup-email');
  const note = document.getElementById('signup-note');
  const noteText = note.innerHTML;
  const button = form.querySelector('button');
  const mailto = addr => 'mailto:info@bookery-app.de?subject=' + encodeURIComponent('Ich möchte bookery testen') +
    '&body=' + encodeURIComponent('Hallo,\n\nich würde bookery gerne testen. Bitte lade mich über TestFlight ein' + (addr ? ' (' + addr + ')' : '') + '.\n\nDanke!');
  const fail = html => { note.innerHTML = html; note.classList.add('error'); };
  document.querySelectorAll('[data-focus-signup]').forEach(a => a.addEventListener('click', () => setTimeout(() => input.focus({ preventScroll: true }), 500)));
  input.addEventListener('input', () => { input.removeAttribute('aria-invalid'); note.classList.remove('error'); note.innerHTML = noteText; });
  form.addEventListener('submit', async ev => {
    ev.preventDefault();
    const addr = input.value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(addr)) {
      input.setAttribute('aria-invalid', 'true'); input.focus();
      return fail('Das sieht noch nicht nach einer E-Mail-Adresse aus.');
    }
    button.disabled = true;
    button.querySelector('span').textContent = 'Wird gesendet …';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new URLSearchParams(new FormData(form)) });
      if (res.status === 429) throw new Error('limit');
      if (!res.ok) throw new Error('server');
      form.classList.add('sent');
      document.getElementById('signup-done').hidden = false;
      location.assign('testen/?danke');
    } catch (e) {
      fail(e.message === 'limit'
        ? 'Gerade kamen sehr viele Anfragen. Versuch es später noch einmal oder <a href="' + mailto(addr) + '">schreib mir direkt</a>.'
        : 'Das hat gerade nicht geklappt. <a href="' + mailto(addr) + '">Per E-Mail anfragen</a> – die Nachricht ist schon vorbereitet.');
    } finally {
      button.disabled = false;
      button.querySelector('span').textContent = 'Zur Beta anmelden';
    }
  });

  // Galerie: Pfeile blättern um ein Telefon.
  const gallery = document.getElementById('gallery');
  document.querySelectorAll('.gallery-nav button').forEach(b => b.addEventListener('click', () => {
    selbst();
    const step = gallery.querySelector('.shot').getBoundingClientRect().width + 28;
    gallery.scrollBy({ left: step * Number(b.dataset.dir), behavior: 'smooth' });
  }));

  // Beim Herunterscrollen wandert die Galerie von selbst ein Stück nach rechts --
  // so sieht man, dass es seitlich weitergeht. Fasst man sie selbst an, hört das auf.
  let wandert = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let jetzt = 0, gesetzt = 0, frame = 0;
  function selbst() {
    if (!wandert) return;
    wandert = false;
    cancelAnimationFrame(frame);
    gallery.classList.remove('wandert');
  }
  // Selbst angefasst heißt: seitlich bewegt (Wischen, Trackpad, Tasten) -- senkrechtes
  // Scrollen über der Galerie soll das Wandern nicht abschalten.
  gallery.addEventListener('scroll', () => { if (Math.abs(gallery.scrollLeft - gesetzt) > 3) selbst(); }, { passive: true });
  gallery.addEventListener('keydown', selbst);
  const ziel = () => {
    const r = gallery.getBoundingClientRect(), h = innerHeight;
    // 0, wenn die Galerie unten ins Bild kommt, 1, wenn sie oben fast hinaus ist.
    const t = Math.min(1, Math.max(0, (h - r.top) / (h + r.height * 0.5)));
    const step = gallery.querySelector('.shot').getBoundingClientRect().width + 28;
    return t * Math.min(step * 1.5, gallery.scrollWidth - gallery.clientWidth);
  };
  const schritt = () => {
    if (!wandert) return;
    const z = ziel();
    jetzt += (z - jetzt) * 0.12;
    if (Math.abs(z - jetzt) < 0.5) jetzt = z;
    gallery.scrollLeft = jetzt;
    gesetzt = gallery.scrollLeft;
    if (jetzt !== z) frame = requestAnimationFrame(schritt);
  };
  if (wandert) {
    gallery.classList.add('wandert');
    addEventListener('scroll', () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(schritt); }, { passive: true });
    schritt();
  }

  // Nach oben: runder Knopf unten rechts, erscheint nach knapp einer Bildschirmhöhe (wie auf dustingotte.de).
  {
    const toTop = document.createElement('button');
    toTop.type = 'button';
    toTop.className = 'to-top';
    toTop.setAttribute('aria-label', 'Nach oben');
    toTop.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    const ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
    toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: ruhig ? 'auto' : 'smooth' }));
    document.body.appendChild(toTop);
    const zeigen = () => toTop.classList.toggle('show', scrollY > innerHeight * 0.8);
    addEventListener('scroll', zeigen, { passive: true });
    zeigen();
  }
})();
