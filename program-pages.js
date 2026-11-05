(() => {
  const header = document.querySelector('.fp-header');
  const nav = document.querySelector('#main-nav');
  if (!header) return;

  let lastY = window.scrollY;
  let pending = false;
  const updateHeader = () => {
    pending = false;
    const current = window.scrollY;
    const focusWithin = header.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
    if (current < 80 || nav?.classList.contains('open') || focusWithin) {
      header.classList.remove('is-scroll-hidden');
      lastY = current;
      return;
    }
    if (Math.abs(current - lastY) < 8) return;
    header.classList.toggle('is-scroll-hidden', current > lastY);
    lastY = current;
  };
  window.addEventListener('scroll', () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(updateHeader);
  }, { passive: true });
  header.addEventListener('focusin', () => header.classList.remove('is-scroll-hidden'));

  document.querySelectorAll('.fp-faq-item button').forEach((button, index) => {
    const answer = button.closest('.fp-faq-item')?.querySelector('.fp-faq-answer');
    const icon = button.querySelector('span');
    if (!answer) return;
    if (icon) {
      icon.className = 'fp-faq-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = '<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg>';
    }
    answer.id ||= `fp-faq-answer-${index + 1}`;
    button.setAttribute('aria-controls', answer.id);
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      answer.hidden = expanded;
    });
  });

  const includesTimeline = document.querySelector('.pregnancy-includes-timeline');
  const includesList = includesTimeline?.querySelector('.pregnancy-includes-list');
  const includesLine = includesTimeline?.querySelector('.pregnancy-includes-line-progress');
  if (includesList && includesLine) {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lineFrame = 0;
    const updateIncludesLine = () => {
      lineFrame = 0;
      const bounds = includesList.getBoundingClientRect();
      const trigger = window.innerHeight * 0.68;
      const progress = motionPreference.matches
        ? 1
        : Math.max(0, Math.min(1, (trigger - bounds.top) / bounds.height));
      includesLine.style.strokeDashoffset = String(1 - progress);
      const items = [...includesList.querySelectorAll(':scope > li')];
      let currentItemSet = false;
      items.forEach((item) => {
        const itemBounds = item.getBoundingClientRect();
        const itemProgress = (itemBounds.top - bounds.top + 12) / bounds.height;
        const itemOpacity = motionPreference.matches
          ? 1
          : Math.max(0, Math.min(1, (progress - itemProgress + 0.1) / 0.1));
        item.style.opacity = String(0.28 + itemOpacity * 0.72);
        const isReached = progress >= itemProgress;
        item.classList.toggle('is-reached', isReached);
        const isCurrent = !currentItemSet && !isReached;
        item.classList.toggle('is-current', isCurrent);
        if (isCurrent) currentItemSet = true;
      });
    };
    const scheduleIncludesLine = () => {
      if (lineFrame) return;
      lineFrame = requestAnimationFrame(updateIncludesLine);
    };
    window.addEventListener('scroll', scheduleIncludesLine, { passive: true });
    window.addEventListener('resize', scheduleIncludesLine);
    motionPreference.addEventListener('change', scheduleIncludesLine);
    updateIncludesLine();
  }

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const autoScrollCleanups = [];
  document.querySelectorAll('[data-track="good-news"]').forEach((track) => {
    const controls = track.parentElement.querySelector('.carousel-controls');
    if (!controls) return;

    const tools = document.createElement('div');
    tools.className = 'fp-auto-tools';
    controls.before(tools);
    const toggle = document.createElement('button');
    toggle.className = 'fp-auto-toggle';
    toggle.type = 'button';
    tools.append(toggle, controls);

    const originals = [...track.children];
    const state = { visible: false, paused: false, hovered: false, touching: false, resumeAt: 0, position: 0, previous: 0, frame: 0 };
    const updateToggle = () => {
      const paused = state.paused || motionPreference.matches;
      toggle.textContent = paused ? '▶' : 'Ⅱ';
      toggle.setAttribute('aria-label', paused ? 'Resume automatic scrolling' : 'Pause automatic scrolling');
      toggle.disabled = motionPreference.matches;
    };
    const configure = () => {
      track.querySelectorAll('[data-loop-copy]').forEach((card) => card.remove());
      if (motionPreference.matches) {
        delete track.dataset.autoScroll;
      } else {
        originals.forEach((card) => {
          const copy = card.cloneNode(true);
          copy.dataset.loopCopy = '';
          copy.setAttribute('aria-hidden', 'true');
          track.append(copy);
        });
        track.dataset.autoScroll = '';
      }
      track.scrollLeft = 0;
      state.position = 0;
      updateToggle();
    };

    configure();
    motionPreference.addEventListener('change', configure);
    toggle.addEventListener('click', () => {
      state.paused = !state.paused;
      updateToggle();
    });
    track.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse') state.hovered = true;
    });
    track.addEventListener('pointerleave', () => { state.hovered = false; });
    track.addEventListener('pointerdown', () => { state.touching = true; });
    const release = () => {
      state.touching = false;
      state.resumeAt = performance.now() + 1800;
    };
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    track.addEventListener('wheel', () => { state.resumeAt = performance.now() + 1800; }, { passive: true });
    controls.addEventListener('click', () => { state.resumeAt = performance.now() + 2500; });

    const observer = new IntersectionObserver(([entry]) => { state.visible = entry.isIntersecting; });
    observer.observe(track);
    const tick = (time) => {
      const delta = Math.min(time - (state.previous || time), 40);
      state.previous = time;
      const active = !motionPreference.matches && state.visible && !document.hidden &&
        !state.paused && !state.hovered && !state.touching &&
        time > state.resumeAt && !track.contains(document.activeElement);
      if (active) {
        const firstCopy = track.querySelector('[data-loop-copy]');
        const loopWidth = firstCopy ? firstCopy.offsetLeft - originals[0].offsetLeft : 0;
        state.position += delta * 0.028;
        if (loopWidth && state.position >= loopWidth) state.position -= loopWidth;
        track.scrollLeft = state.position;
      } else {
        state.position = track.scrollLeft;
      }
      state.frame = requestAnimationFrame(tick);
    };
    state.frame = requestAnimationFrame(tick);
    autoScrollCleanups.push(() => {
      cancelAnimationFrame(state.frame);
      observer.disconnect();
      motionPreference.removeEventListener('change', configure);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
    });
  });
  window.addEventListener('pagehide', () => autoScrollCleanups.forEach((cleanup) => cleanup()), { once: true });
})();
