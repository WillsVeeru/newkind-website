(() => {
  if (document.querySelector('.back-to-top')) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'back-to-top';
  button.hidden = true;
  button.setAttribute('aria-label', 'Back to top');
  button.title = 'Back to top';
  // Google Material Icons: arrow_upward (Apache-2.0).
  button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/></svg>';
  document.body.appendChild(button);

  let pending = false;
  const updateVisibility = () => {
    pending = false;
    button.hidden = window.scrollY <= 400;
  };
  window.addEventListener('scroll', () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(updateVisibility);
  }, { passive: true });
  window.addEventListener('pageshow', updateVisibility);
  button.addEventListener('click', () => {
    document.querySelector('.header-logo')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  updateVisibility();
})();
