// Kommt man frisch von der Anmeldung, steht oben eine Bestätigung.
if (location.search.indexOf('danke') > -1) document.getElementById('danke').classList.add('show');

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
