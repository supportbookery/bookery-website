// Rechtstexte: übernehmen die auf der Startseite gewählte Farbwelt, Kopfzeile und Inhaltsverzeichnis.
(() => {
  // Farbwelten wie in index.html (ThemePalette der App), jeweils [hell, dunkel].
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
  let current = 'sage';
  try { current = localStorage.getItem('bookery.palette') || 'sage'; } catch (e) {}
  if (!P[current]) current = 'sage';

  function apply() {
    const pal = P[current], i = dark.matches ? 1 : 0;
    for (const k in pal) root.style.setProperty('--' + k, pal[k][i]);
    root.style.setProperty('--on-accent', dark.matches ? pal.paper[1] : pal.card[0]);
    document.querySelectorAll('meta[name="theme-color"]').forEach((m, n) => m.setAttribute('content', pal.paper[n]));
    document.querySelectorAll('.app-icon').forEach(img => img.src = '/icons/' + current + '.png');
  }
  apply();
  dark.addEventListener('change', apply);

  // Kopfzeile bekommt beim Scrollen eine Linie.
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Inhaltsverzeichnis: markiert den Abschnitt, der gerade gelesen wird.
  const links = [...document.querySelectorAll('.toc a')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (sections.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-90px 0px -65% 0px' });
    sections.forEach(s => io.observe(s));
  }
  // Auf dem iPhone klappt das Verzeichnis nach dem Antippen wieder zu.
  document.querySelectorAll('.toc-mobile a').forEach(a => a.addEventListener('click', () => a.closest('details').open = false));

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
