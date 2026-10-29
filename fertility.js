const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');
menuToggle?.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  mainNav?.classList.toggle('open', !expanded);
});
mainNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));

const updateControls = (track) => {
  const name = track.dataset.track;
  const previous = document.querySelector(`[data-scroll="${name}"][data-direction="-1"]`);
  const next = document.querySelector(`[data-scroll="${name}"][data-direction="1"]`);
  if (!previous || !next) return;
  previous.disabled = track.scrollLeft <= 2;
  next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
};

document.querySelectorAll('[data-track]').forEach((track) => {
  track.tabIndex = 0;
  track.setAttribute('role', 'region');
  track.setAttribute('aria-label', `${track.dataset.track} carousel`);
  updateControls(track);
  track.addEventListener('scroll', () => updateControls(track), { passive: true });
  track.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const card = track.firstElementChild;
    const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    track.scrollBy({ left: ((card?.getBoundingClientRect().width || track.clientWidth * .8) + gap) * direction, behavior: 'smooth' });
  });

  let startX = 0;
  let startScroll = 0;
  let dragged = false;
  track.addEventListener('dragstart', (event) => event.preventDefault());
  track.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    if (event.target.closest('button,a,input,select,textarea')) return;
    startX = event.clientX;
    startScroll = track.scrollLeft;
    dragged = false;
    track.classList.add('is-dragging');
    track.setPointerCapture(event.pointerId);
  });
  track.addEventListener('pointermove', (event) => {
    if (!track.hasPointerCapture(event.pointerId)) return;
    const distance = event.clientX - startX;
    if (Math.abs(distance) > 4) { dragged = true; event.preventDefault(); }
    track.scrollLeft = startScroll - distance;
  });
  const finishDrag = (event) => {
    if (!track.hasPointerCapture(event.pointerId)) return;
    track.releasePointerCapture(event.pointerId);
    track.classList.remove('is-dragging');
  };
  track.addEventListener('pointerup', finishDrag);
  track.addEventListener('pointercancel', finishDrag);
  track.addEventListener('lostpointercapture', () => track.classList.remove('is-dragging'));
  track.addEventListener('click', (event) => {
    if (!dragged) return;
    event.preventDefault();
    event.stopPropagation();
    dragged = false;
  }, true);
});

document.querySelectorAll('[data-scroll]').forEach((button) => button.addEventListener('click', () => {
  const track = document.querySelector(`[data-track="${button.dataset.scroll}"]`);
  if (!track) return;
  const card = track.firstElementChild;
  const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
  const distance = (card?.getBoundingClientRect().width || track.clientWidth * .8) + gap;
  track.scrollBy({ left: distance * Number(button.dataset.direction), behavior: 'smooth' });
}));

const storyVideos = [...document.querySelectorAll('.fp-video-story')];
storyVideos.forEach((card) => {
  const video = card.querySelector('video');
  const button = card.querySelector('button');
  if (!video || !button) return;
  const name = card.dataset.storyLabel || 'patient testimonial';
  const syncStoryVideo = () => {
    const playing = !video.paused && !video.ended;
    card.classList.toggle('is-playing', playing);
    button.textContent = playing ? 'Ⅱ' : '▶';
    button.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${name}`);
  };
  button.addEventListener('click', () => {
    if (video.paused || video.ended) {
      storyVideos.forEach((otherCard) => {
        const otherVideo = otherCard.querySelector('video');
        if (otherVideo && otherVideo !== video) otherVideo.pause();
      });
      video.play().catch(() => {});
    } else video.pause();
  });
  video.addEventListener('play', syncStoryVideo);
  video.addEventListener('pause', syncStoryVideo);
  video.addEventListener('ended', syncStoryVideo);
});

document.querySelectorAll('.fp-faq-item button').forEach((button) => button.addEventListener('click', () => {
  const item = button.closest('.fp-faq-item');
  const answer = item.querySelector('.fp-faq-answer');
  const expanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!expanded));
  button.querySelector('span').textContent = expanded ? '⌄' : '⌃';
  if (answer.textContent.trim()) answer.hidden = expanded;
}));

// Continuous right-to-left movement; interaction and reduced motion take priority.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const autoRows = [];
document.querySelectorAll('[data-track="good-news"],[data-track="more-good-news"]').forEach((track) => {
  const controls = track.parentElement.querySelector('.carousel-controls');
  const tools = document.createElement('div');
  tools.className = 'fp-auto-tools';
  controls.before(tools);
  const toggle = document.createElement('button');
  toggle.className = 'fp-auto-toggle';
  toggle.type = 'button';
  tools.append(toggle, controls);
  const originals = [...track.children];
  const state = { track, originals, visible: false, paused: false, hovered: false, touching: false, until: 0, position: 0, frame: 0, previous: 0 };
  const label = () => {
    const paused = state.paused || motionPreference.matches;
    toggle.textContent = paused ? '▶' : 'Ⅱ';
    toggle.setAttribute('aria-label', paused ? 'Resume automatic scrolling' : 'Pause automatic scrolling');
    toggle.disabled = motionPreference.matches;
  };
  const configure = () => {
    track.querySelectorAll('[data-loop-copy]').forEach((card) => card.remove());
    if (!motionPreference.matches) {
      originals.forEach((card) => {
        const copy = card.cloneNode(true);
        copy.dataset.loopCopy = '';
        copy.setAttribute('aria-hidden', 'true');
        track.append(copy);
      });
      track.dataset.autoScroll = '';
    } else delete track.dataset.autoScroll;
    track.scrollLeft = 0;
    state.position = 0;
    label();
    updateControls(track);
  };
  configure();
  motionPreference.addEventListener('change', configure);
  toggle.addEventListener('click', () => { state.paused = !state.paused; label(); });
  track.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') state.hovered = true; });
  track.addEventListener('pointerleave', () => { state.hovered = false; });
  track.addEventListener('pointerdown', () => { state.touching = true; });
  const release = () => { state.touching = false; state.until = performance.now() + 1800; };
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  track.addEventListener('wheel', () => { state.until = performance.now() + 1800; }, { passive: true });
  controls.addEventListener('click', () => { state.until = performance.now() + 2500; });
  const observer = new IntersectionObserver(([entry]) => { state.visible = entry.isIntersecting; });
  observer.observe(track);
  const tick = (time) => {
    const delta = Math.min(time - (state.previous || time), 40);
    state.previous = time;
    const active = !motionPreference.matches && state.visible && !document.hidden && !state.paused && !state.hovered && !state.touching && time > state.until && !track.contains(document.activeElement);
    if (active) {
      const firstCopy = track.querySelector('[data-loop-copy]');
      const loopWidth = firstCopy ? firstCopy.offsetLeft - originals[0].offsetLeft : 0;
      state.position += delta * .028;
      if (loopWidth && state.position >= loopWidth) state.position -= loopWidth;
      track.scrollLeft = state.position;
    } else state.position = track.scrollLeft;
    state.frame = requestAnimationFrame(tick);
  };
  state.frame = requestAnimationFrame(tick);
  autoRows.push(() => {
    cancelAnimationFrame(state.frame);
    observer.disconnect();
    motionPreference.removeEventListener('change', configure);
    window.removeEventListener('pointerup', release);
    window.removeEventListener('pointercancel', release);
  });
});
window.addEventListener('pagehide', () => autoRows.forEach((cleanup) => cleanup()), { once: true });

const concernModal = document.querySelector('[data-concern-modal]');
const concernDialog = concernModal?.querySelector('.concern-dialog');
const concernPanels = [...document.querySelectorAll('[data-concern-panel]')];
let concernLastTrigger = null;
const closeConcernModal = () => {
  if (!concernModal || concernModal.hidden) return;
  concernModal.hidden = true;
  concernModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('call-modal-open');
  concernLastTrigger?.focus();
};
const openConcernModal = (trigger) => {
  if (!concernModal || !concernDialog) return;
  const panel = concernPanels.find((item) => item.dataset.concernPanel === trigger.dataset.concernOpen);
  if (!panel) return;
  concernPanels.forEach((item) => { item.hidden = item !== panel; });
  concernDialog.setAttribute('aria-label', panel.querySelector('h2')?.textContent || 'Fertility concern details');
  concernLastTrigger = trigger;
  concernModal.hidden = false;
  concernModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('call-modal-open');
  requestAnimationFrame(() => concernModal.querySelector('[data-close-concern]')?.focus());
};
document.querySelectorAll('[data-concern-open]').forEach((trigger) => trigger.addEventListener('click', () => openConcernModal(trigger)));
document.querySelectorAll('[data-close-concern]').forEach((button) => button.addEventListener('click', closeConcernModal));
concernModal?.addEventListener('click', (event) => { if (event.target === concernModal) closeConcernModal(); });

const modal = document.querySelector('[data-call-modal]');
const formDialog = document.querySelector('.call-form-dialog');
const successDialog = document.querySelector('.call-success-dialog');
const form = document.querySelector('[data-call-form]');
const successTitle = document.querySelector('#call-success-title');
let lastTrigger = null;
const closeModal = () => {
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('call-modal-open');
  lastTrigger?.focus();
};
const openModal = (trigger) => {
  if (!modal) return;
  lastTrigger = trigger;
  formDialog.hidden = false;
  successDialog.hidden = true;
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('call-modal-open');
  requestAnimationFrame(() => document.querySelector('#call-name')?.focus());
};
document.querySelectorAll('[data-open-call]').forEach((trigger) => trigger.addEventListener('click', (event) => {
  event.preventDefault();
  openModal(trigger);
}));
document.querySelectorAll('[data-close-call]').forEach((button) => button.addEventListener('click', closeModal));
modal?.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.checkValidity()) return form.reportValidity();
  const name = String(new FormData(form).get('name') || '').trim().split(/\s+/)[0];
  successTitle.textContent = name ? `Thank you, ${name}.` : 'Thank you.';
  formDialog.hidden = true;
  successDialog.hidden = false;
  successDialog.querySelector('[data-close-call]')?.focus();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeConcernModal();
    closeModal();
    mainNav?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }
});
