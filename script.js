const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');

menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  mainNav.classList.toggle('open', !expanded);
});

document.querySelectorAll('.submenu-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.parentElement;
    const expanded = button.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.has-menu').forEach((other) => {
      if (other !== item) {
        other.classList.remove('open');
        other.querySelector('.submenu-toggle').setAttribute('aria-expanded', 'false');
      }
    });
    item.classList.toggle('open', !expanded);
    button.setAttribute('aria-expanded', String(!expanded));
  });

  button.parentElement.addEventListener('pointerleave', (event) => {
    if (event.pointerType !== 'mouse') return;
    button.parentElement.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
    button.blur();
  });
});

document.querySelectorAll('[data-scroll]').forEach((button) => {
  button.addEventListener('click', () => {
    const track = document.querySelector(`[data-track="${button.dataset.scroll}"]`);
    const direction = Number(button.dataset.direction);
    const card = track.firstElementChild;
    const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
    const distance = card ? card.getBoundingClientRect().width + gap : track.clientWidth * .75;
    track.scrollBy({ left: distance * direction, behavior: 'smooth' });
  });
});

const updateCarouselControls = (track) => {
  const name = track.dataset.track;
  const previous = document.querySelector(`[data-scroll="${name}"][data-direction="-1"]`);
  const next = document.querySelector(`[data-scroll="${name}"][data-direction="1"]`);
  if (!previous || !next) return;
  previous.disabled = track.scrollLeft <= 2;
  next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
};

document.querySelectorAll('[data-track]').forEach((track) => {
  track.tabIndex = 0;
  if (!track.hasAttribute('role')) track.setAttribute('role', 'region');
  track.setAttribute('aria-label', `${track.dataset.track} carousel`);
  updateCarouselControls(track);
  track.addEventListener('scroll', () => updateCarouselControls(track), { passive: true });
  track.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const card = track.firstElementChild;
    const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
    track.scrollBy({ left: ((card?.getBoundingClientRect().width || track.clientWidth * .75) + gap) * direction, behavior: 'smooth' });
  });
});

const enableDragScroll = (track) => {
  let dragStartX = 0;
  let dragStartScroll = 0;
  let dragged = false;

  track.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    dragStartX = event.clientX;
    dragStartScroll = track.scrollLeft;
    dragged = false;
    track.classList.add('is-dragging');
    track.setPointerCapture(event.pointerId);
  });

  track.addEventListener('pointermove', (event) => {
    if (!track.hasPointerCapture(event.pointerId)) return;
    const distance = event.clientX - dragStartX;
    if (Math.abs(distance) > 4) dragged = true;
    track.scrollLeft = dragStartScroll - distance;
  });

  const finishDrag = (event) => {
    if (!track.hasPointerCapture(event.pointerId)) return;
    track.releasePointerCapture(event.pointerId);
    track.classList.remove('is-dragging');
  };

  track.addEventListener('pointerup', finishDrag);
  track.addEventListener('pointercancel', finishDrag);
  track.addEventListener('click', (event) => {
    if (!dragged) return;
    event.preventDefault();
    event.stopPropagation();
    dragged = false;
  }, true);
};

document.querySelectorAll('[data-track="stories"], [data-track="care"], [data-track="news"]')
  .forEach(enableDragScroll);

const storyTrack = document.querySelector('[data-track="stories"]');
const storyTabs = [...document.querySelectorAll('.story-tabs [role="tab"]')];
const storyTemplates = storyTrack ? {
  doctor: storyTrack.innerHTML,
  couple: `
    <article class="story-intro couple-intro"><p>COUPLE TESTIMONIALS</p><h3>Real Stories, Shared<br>Journeys</h3><p>Every journey is different. What makes the difference is having the right support along the way.</p></article>
    <article class="story-copy-card"><img class="story-avatar" src="assets/journal-fertility.jpg" alt="Priya and Arjun"><span class="quote-mark" aria-hidden="true">“</span><blockquote>We came to NewKind feeling overwhelmed and unsure where to begin. Having a team that understood both of us made the journey feel much more manageable.</blockquote><div class="story-card-footer"><h3>Priya &amp; Arjun</h3><p>Fertility Program</p></div></article>
    <article class="story-image-card image-anime image-anime-gradient"><img src="assets/journal-fertility.jpg" alt="Sneha and Rahul together"><img class="story-avatar" src="assets/journal-fertility.jpg" alt=""><blockquote>What we loved most was that the care felt personal. We weren’t given a generic plan—we were guided based on our health, lifestyle, and goals.</blockquote><div class="story-card-footer"><h3>Sneha &amp; Rahul</h3><p>Fertility Program</p></div></article>`,
  google: `
    <article class="story-intro google-intro"><div><p>GOOGLE REVIEW</p><span class="review-score"><b aria-hidden="true">★</b> 4.9/5</span></div><h3>Loved by Our<br>Community</h3><p>Real experiences from people who chose NewKind to be part of their health journey.</p><a href="#stories">Read all reviews on Google <span class="material-arrow" aria-hidden="true"><svg class="material-symbol-arrow-right-alt" viewBox="0 0 24 24" focusable="false"><path d="m14 7-1.41 1.41L15.17 11H4v2h11.17l-2.58 2.59L14 17l5-5Z"/></svg></span></a></article>
    <article class="review-card"><img class="story-avatar" src="assets/journal-fertility.jpg" alt=""><span class="quote-mark" aria-hidden="true">“</span><blockquote>The entire experience felt thoughtful and personal. I finally felt heard and understood.</blockquote><div class="story-card-footer"><div class="review-stars" aria-label="5 out of 5 stars">★★★★★</div><h3>Meera S.</h3><p>1 week ago</p></div></article>
    <article class="review-card"><img class="story-avatar" src="assets/journal-fertility.jpg" alt=""><span class="quote-mark" aria-hidden="true">“</span><blockquote>The entire experience felt thoughtful and personal. I finally felt heard and understood.</blockquote><div class="story-card-footer"><div class="review-stars" aria-label="5 out of 5 stars">★★★★★</div><h3>Priya P.</h3><p>1 week ago</p></div></article>`,
} : null;

const selectStoryTab = (button) => {
  if (!storyTrack || !storyTemplates) return;
  storyTabs.forEach((tab) => {
    const selected = tab === button;
    tab.classList.toggle('active', selected);
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  storyTrack.innerHTML = storyTemplates[button.dataset.storyKind];
  storyTrack.setAttribute('aria-labelledby', button.id);
  storyTrack.scrollLeft = 0;
  requestAnimationFrame(() => {
    updateCarouselControls(storyTrack);
    window.ScrollTrigger?.refresh();
  });
};

storyTabs.forEach((button, index) => {
  button.addEventListener('click', () => selectStoryTab(button));
  button.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextTab = storyTabs[(index + direction + storyTabs.length) % storyTabs.length];
    nextTab.focus();
    selectStoryTab(nextTab);
  });
});

document.querySelectorAll('.accordion button').forEach((button) => {
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
  });
});

const callModal = document.querySelector('[data-call-modal]');
const callFormDialog = document.querySelector('.call-form-dialog');
const callSuccessDialog = document.querySelector('.call-success-dialog');
const callForm = document.querySelector('[data-call-form]');
const callSuccessTitle = document.querySelector('#call-success-title');
let lastCallTrigger = null;

const closeCallModal = () => {
  if (!callModal || callModal.hidden) return;
  callModal.hidden = true;
  callModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('call-modal-open');
  if (lastCallTrigger?.offsetParent !== null) lastCallTrigger.focus();
  else menuToggle?.focus();
};

const openCallModal = (trigger) => {
  if (!callModal || !callFormDialog || !callSuccessDialog) return;
  lastCallTrigger = trigger;
  callFormDialog.hidden = false;
  callSuccessDialog.hidden = true;
  callModal.hidden = false;
  callModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('call-modal-open');
  requestAnimationFrame(() => document.querySelector('#call-name')?.focus());
};

document.querySelectorAll('[data-open-call]').forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    openCallModal(trigger);
  });
});

document.querySelectorAll('[data-close-call]').forEach((button) => {
  button.addEventListener('click', closeCallModal);
});

callModal?.addEventListener('click', (event) => {
  if (event.target === callModal) closeCallModal();
});

callForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!callForm.checkValidity()) {
    callForm.reportValidity();
    return;
  }
  const formData = new FormData(callForm);
  const firstName = String(formData.get('name') || '').trim().split(/\s+/)[0];
  callSuccessTitle.textContent = firstName ? `Thank you, ${firstName}.` : 'Thank you.';
  callFormDialog.hidden = true;
  callSuccessDialog.hidden = false;
  callSuccessDialog.querySelector('[data-close-call]')?.focus();
});

callModal?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeCallModal();
    return;
  }
  if (event.key !== 'Tab') return;
  const dialog = callFormDialog.hidden ? callSuccessDialog : callFormDialog;
  const focusable = [...dialog.querySelectorAll('button,input,select,textarea,a[href]')]
    .filter((element) => !element.disabled && !element.hidden);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.querySelectorAll('.has-menu.open').forEach((item) => {
      item.classList.remove('open');
      item.querySelector('.submenu-toggle').setAttribute('aria-expanded', 'false');
    });
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  document.querySelectorAll('.has-menu.open').forEach((item) => {
    item.classList.remove('open');
    item.querySelector('.submenu-toggle').setAttribute('aria-expanded', 'false');
  });
});

