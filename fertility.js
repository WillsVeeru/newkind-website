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

document.querySelectorAll('[data-open-call]').forEach((cta) => {
  const labelNode = [...cta.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
  if (labelNode) labelNode.textContent = 'Book discover a call ';
});

const fertilityProgramCards = [
  {
    id: 'natural-fertility',
    title: 'Natural Fertility',
    description: 'A holistic approach to improving your chances of conceiving naturally by focusing on egg and sperm health, hormonal balance, cycle regulation, nutrition, weight management and lifestyle changes. Identify and address underlying fertility challenges to help prepare your body for a healthy pregnancy.'
  },
  {
    id: 'iui-ivf',
    title: 'IUI/IVF Preparation',
    description: 'Prepare your body before undergoing fertility treatments like IUI or IVF. Focus on improving egg and sperm quality, hormonal balance, metabolic health and overall reproductive wellness. Address underlying factors that may affect treatment outcomes and support your body through the fertility journey.'
  },
  {
    id: 'egg-freezing',
    title: 'Egg Freezing Preparation',
    description: 'Prepare your reproductive health before undergoing egg freezing. Focus on nutrition, lifestyle, hormonal health and overall wellness to support egg health and optimise your body’s readiness for the egg retrieval process. Make informed choices about preserving your fertility and future family planning.'
  },
  {
    id: 'pmos-balance',
    title: 'PCOS Balance',
    description: 'Address the underlying hormonal and metabolic challenges associated with PCOS. Focus on cycle regulation, insulin sensitivity, weight management, nutrition, physical activity and stress management. Support healthier ovulation, improve reproductive wellness and work towards better hormonal balance and natural conception.'
  }
];

fertilityProgramCards.forEach(({ id, title, description }) => {
  const card = document.getElementById(id);
  if (!card) return;
  card.querySelector('h3').textContent = title;
  card.querySelector(':scope > p').textContent = description;
});
document.querySelectorAll('a[href="#egg-freezing"]').forEach((link) => { link.textContent = 'Egg Freezing Preparation'; });
document.querySelectorAll('a[href="#pmos-balance"]').forEach((link) => { link.textContent = 'PCOS Balance'; });

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

const programJourney = document.querySelector('[data-program-journey]');
if (programJourney) {
  const programContent = [
    null,
    {
      eyebrow: 'IUI/IVF PREPARATION',
      heading: 'Feel more prepared for your next fertility step.',
      paragraphs: [
        'Preparing for IUI or IVF involves more than the treatment procedure itself. Nutritional health, hormonal balance, egg and sperm health, and emotional wellbeing all deserve attention.',
        'NewKind takes a personalized approach to understanding your health and identifying lifestyle factors that may benefit from additional support before treatment.',
        'With customized nutrition, guided movement, and stress management, we help both partners feel more informed and supported while working alongside their fertility specialist.'
      ]
    },
    {
      eyebrow: 'EGG FREEZING PREPARATION',
      heading: 'Make informed choices about your fertility future.',
      paragraphs: [
        'Egg freezing offers women an opportunity to preserve eggs for potential future use. Understanding your ovarian reserve, hormonal health, and reproductive wellbeing can help you make informed decisions.',
        'At NewKind, we focus on preparing you through personalized nutrition, lifestyle guidance, and fertility-focused wellbeing support.',
        'Our approach helps you build healthier routines, address nutritional and lifestyle factors, and feel more confident as you prepare for the egg-freezing process.'
      ]
    },
    {
      eyebrow: 'PCOS/PCOD BALANCE',
      heading: 'Support your hormones. Find your balance.',
      paragraphs: [
        'PCOS/PCOD can affect menstrual cycles, ovulation, metabolism, weight, and reproductive health. Understanding how these factors are connected is an important step towards managing symptoms.',
        'NewKind takes a whole-person approach to hormonal and metabolic health, looking at nutrition, movement, stress, and everyday lifestyle habits.',
        'Through personalized nutrition, guided movement, fertility-focused yoga, and stress management, we help you build sustainable habits that support your overall wellbeing and fertility goals.'
      ]
    }
  ];

  const programTabs = [...programJourney.querySelectorAll('[data-program-tab]')];
  programTabs[3].textContent = 'PCOS/PCOD BALANCE';

  programContent.forEach((content, index) => {
    if (!content) return;
    const panel = programJourney.querySelector(`[data-program-copy="${index}"]`);
    const eyebrow = panel.querySelector('.fp-program-eyebrow');
    const heading = panel.querySelector('h3');
    const cta = panel.querySelector('.btn');
    eyebrow.textContent = content.eyebrow;
    heading.textContent = content.heading;
    panel.querySelectorAll(':scope > p:not(.fp-program-eyebrow)').forEach((paragraph) => paragraph.remove());
    content.paragraphs.forEach((text) => {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      panel.insertBefore(paragraph, cta);
    });
  });
}

if (programJourney && window.gsap && window.ScrollTrigger) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const pin = programJourney.querySelector('[data-program-pin]');
  const tabs = [...programJourney.querySelectorAll('[data-program-tab]')];
  const images = [...programJourney.querySelectorAll('[data-program-image]')];
  const copies = [...programJourney.querySelectorAll('[data-program-copy]')];
  let activeIndex = 0;
  let programScrollTrigger = null;

  gsap.registerPlugin(ScrollTrigger);

  const syncProgramState = (index) => {
    activeIndex = Math.max(0, Math.min(tabs.length - 1, index));
    tabs.forEach((tab, tabIndex) => {
      const active = tabIndex === activeIndex;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    images.forEach((image, imageIndex) => image.classList.toggle('is-active', imageIndex === activeIndex));
    copies.forEach((copy, copyIndex) => {
      const active = copyIndex === activeIndex;
      copy.classList.toggle('is-active', active);
      copy.setAttribute('aria-hidden', String(!active));
    });
  };

  const showMobileProgram = (index) => {
    if (index === activeIndex) return;
    const previousImage = images[activeIndex];
    const previousCopy = copies[activeIndex];
    const nextImage = images[index];
    const nextCopy = copies[index];
    const direction = index > activeIndex ? 1 : -1;
    gsap.killTweensOf([previousImage, previousCopy, nextImage, nextCopy]);
    const mobileTimeline = gsap.timeline();
    mobileTimeline
      .to(previousImage, { autoAlpha: 0, duration: .24, ease: 'power2.out' }, 0)
      .fromTo(nextImage, { autoAlpha: 1, yPercent: 100 * direction }, { autoAlpha: 1, yPercent: 0, duration: .62, ease: 'power3.out' }, 0)
      .to(previousCopy, { autoAlpha: 0, y: -18 * direction, duration: .2, ease: 'power2.out' }, .62)
      .call(() => syncProgramState(index), null, .82)
      .fromTo(nextCopy, { autoAlpha: 0, y: 26 * direction }, { autoAlpha: 1, y: 0, duration: .42, ease: 'power3.out' }, .82);
  };

  const media = gsap.matchMedia();
  media.add('(min-width: 761px)', () => {
    gsap.set(images, { yPercent: 105, autoAlpha: 1 });
    gsap.set(images[0], { yPercent: 0 });
    gsap.set(copies, { autoAlpha: 0, y: 30 });
    gsap.set(copies[0], { autoAlpha: 1, y: 0 });
    syncProgramState(0);

    const timeline = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    const switchTimes = [0];
    let cursor = .35;
    for (let index = 1; index < tabs.length; index += 1) {
      const imageStart = cursor;
      const imageEnd = imageStart + .78;
      const copyStart = imageEnd + .24;
      switchTimes[index] = copyStart;
      timeline
        .to(images[index], { yPercent: 0, duration: .78 }, imageStart)
        .to(copies[index - 1], { autoAlpha: 0, y: -22, duration: .24 }, imageEnd)
        .to(copies[index], { autoAlpha: 1, y: 0, duration: .42, ease: 'power3.out' }, copyStart);
      cursor = copyStart + .55;
    }
    timeline.to(pin, { x: 0, duration: .45 }, cursor);

    programScrollTrigger = ScrollTrigger.create({
      trigger: programJourney.querySelector('.fp-program-tabs'),
      start: 'top top',
      end: () => `+=${Math.max(window.innerHeight * 3.6, 2400)}`,
      pin,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: .75,
      animation: timeline,
      invalidateOnRefresh: true,
      onUpdate: () => {
        const currentTime = timeline.time();
        let currentIndex = 0;
        switchTimes.forEach((switchTime, index) => {
          if (currentTime >= switchTime) currentIndex = index;
        });
        syncProgramState(currentIndex);
      }
    });

    return () => {
      programScrollTrigger = null;
      timeline.kill();
      gsap.set([...images, ...copies, ...images.map((image) => image.querySelector('img'))], { clearProps: 'all' });
    };
  });

  media.add('(max-width: 760px)', () => {
    gsap.set(images, { autoAlpha: 0, yPercent: 0 });
    gsap.set(images[0], { autoAlpha: 1 });
    gsap.set(copies, { autoAlpha: 0, y: 0 });
    gsap.set(copies[0], { autoAlpha: 1 });
    syncProgramState(0);
    return () => gsap.set([...images, ...copies, ...images.map((image) => image.querySelector('img'))], { clearProps: 'all' });
  });

  const goToProgram = (index) => {
    if (programScrollTrigger) {
      const progress = index === 0 ? 0 : (index / tabs.length) + .012;
      const top = programScrollTrigger.start + ((programScrollTrigger.end - programScrollTrigger.start) * progress);
      window.scrollTo({ top, behavior: 'smooth' });
    } else showMobileProgram(index);
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => goToProgram(index));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;
      tabs[nextIndex].focus();
      goToProgram(nextIndex);
    });
  });

  document.querySelectorAll('.fp-header a[href^="#"]').forEach((link) => {
    const index = tabs.findIndex((tab) => `#${tab.id}` === link.getAttribute('href'));
    if (index < 0) return;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      goToProgram(index);
    });
  });

  requestAnimationFrame(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

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

const howProgramDefinitions = [
  {
    key: 'doctor-consultation',
    title: 'Doctor consultation',
    lead: '<strong>our journey begins with a 1-on-1 consultation with a fertility-focused OBGYN/ Andrologist who understands and supports natural conception.</strong>',
    points: [
      'We inform your assigned doctor of your entire medical history, lifestyle, cycle patterns, and existing reports to identify the root causes affecting your fertility.',
      'Based on this, the doctor will create a personalised medication &amp; supplements plan for you and your partner both. These medications are designed to support your body’s natural ability to conceive.',
      'The best doctor will be assigned to you based on your case history. If you have a specific doctor you would like to work with, you can inform us.'
    ],
    note: '<strong><em>Note: If you need help with acquiring these medications, even outside of India, we provide support with this. Everything is at cost, with no additional service fee.</em></strong>'
  },
  {
    key: 'nutrition',
    title: 'Nutrition',
    lead: 'You and your partner will receive <strong>personalised meal plans</strong> at the start of each month (for 3 months), designed by a senior nutritionist.',
    points: [
      'We begin with a <strong><em>1-on-1 consultation</em></strong> to understand your food preferences, lifestyle, medical history, and <strong><em>weight goals.</em></strong>',
      'Your BMI, calorie needs, and macros (protein, fats, carbs) are calculated for each of you.',
      'You’ll receive <strong><em>Month 1 Meal Plans</em></strong>—similar meals with adjusted portions and slight variations—so you <strong><em>don’t have to cook separately</em></strong>.',
      'All meals <strong><em>come with recipes</em></strong> and are optimised for fertility to improve egg and sperm quality.',
      'Monthly 1-on-1 follow-up consultations ensure your plan is refined and adjusted based on progress. New meals, new recipes for <strong><em>Month 2 and Month 3</em></strong>.'
    ],
    note: '<strong><em>Note: This is a structured, personalised approach—not a generic diet—designed for real results.</em></strong>'
  },
  {
    key: 'fertility-yoga',
    title: 'Fertility yoga',
    lead: 'You get access to daily live yoga sessions (Monday to Friday) with a FERTILITY YOGA Specialist with over 20+ years of experience.',
    points: [
      'Join everyday LIVE Fertility Yoga class (<strong><em>recordings are shared</em></strong> in case you miss a session or that timing doesn’t work for your schedule).',
      'Designed to <strong><em>improve blood circulation and oxygen flow</em></strong> to reproductive organs.',
      'It is couple yoga but especially beneficial for women—helps with <strong><em>PCOD</em></strong>, regularising periods, and hormonal balance.',
      'Also supports overall reproductive health, improving egg and sperm quality. Especially for <strong><em>low sperm parameters or low AMH</em></strong>.'
    ],
    note: 'Simple, consistent but <strong><em>effective movement</em></strong> that supports better conception outcomes.'
  },
  {
    key: 'stress-regulation',
    title: 'Stress regulation',
    lead: 'You get access to <strong>weekend stress regulation sessions</strong> <strong>with psychologists</strong> focused on regulating your nervous system for better fertility outcomes.',
    points: [
      'Includes guided meditation, breath-work (like box breathing), and counselling techniques.',
      '<strong><em>Recordings are shared</em></strong> in case you miss a session.',
      'Helps <strong><em>reduce stress and cortisol levels</em></strong> even if you are under stress - as that can significantly impact hormones and conception rates.',
      'High cortisol &amp; stress can also impact egg and sperm quality and chances of fertilisation as <strong><em>your body will prevent pregnancies</em></strong>.'
    ],
    note: 'Because a regulated nervous system plays a key role in improving fertility outcomes.'
  },
  {
    key: 'sex-intimacy',
    title: 'Sex and intimacy',
    lead: 'You get access to <strong>weekend workshops</strong> <strong>with experts</strong> designed to improve connection, increase desire, and support natural conception.',
    points: [
      'Covers <strong><em>low libido, vaginal dryness</em></strong>, performance stress, and ovulation timing—common but often unaddressed issues.',
      'Helps improve sexual comfort, desire, and frequency—<strong><em>key factors for better conception chances.</em></strong>',
      'Focuses on communication and reducing pressure to create a more relaxed, natural experience.',
      '<strong><em>Recordings are shared</em></strong> in case you miss a session.'
    ],
    note: '<em>Because better intimacy, comfort, and consistency can significantly improve your chances of conception.</em>'
  },
  {
    key: 'tracking-support',
    title: 'Tracking accountability and support',
    lead: 'You get access to a private WhatsApp group with our team throughout the 3 months for continuous tracking, guidance, and support throughout your journey.',
    points: [
      'Track your daily meals, yoga attendance, exercise, progress, and key milestones with expert oversight.',
      'Ask questions anytime and get quick guidance from our team of nutritionists, experts and founders.',
      'Stay accountable and consistent with regular check-ins and support.'
    ],
    note: 'Because consistent tracking and timely guidance lead to better results.'
  }
];

const howCards = [...document.querySelectorAll('.fp-how-card')];
howProgramDefinitions.forEach((definition, index) => {
  const card = howCards[index];
  if (!card) return;
  card.dataset.howCard = definition.key;
  card.querySelector('h3').textContent = definition.title;
  const button = document.createElement('button');
  button.className = 'fp-how-more';
  button.type = 'button';
  button.dataset.howOpen = definition.key;
  button.setAttribute('aria-haspopup', 'dialog');
  button.innerHTML = 'Know more <svg class="material-symbol-arrow-right-alt" viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="m14 7-1.41 1.41L15.17 11H4v2h11.17l-2.58 2.59L14 17l5-5Z"/></svg>';
  card.appendChild(button);
});

const howModal = document.createElement('div');
howModal.className = 'how-modal';
howModal.dataset.howModal = '';
howModal.hidden = true;
howModal.setAttribute('aria-hidden', 'true');
howModal.innerHTML = '<section class="how-dialog" role="dialog" aria-modal="true" aria-labelledby="how-dialog-title"><button class="call-dialog-close" type="button" data-close-how aria-label="Close program details"></button><figure class="how-dialog-media"><img alt=""></figure><article class="how-dialog-content"><h2 id="how-dialog-title"></h2><div data-how-content></div></article></section>';
document.body.appendChild(howModal);

const howDialog = howModal.querySelector('.how-dialog');
const howDialogImage = howModal.querySelector('.how-dialog-media img');
const howDialogTitle = howModal.querySelector('#how-dialog-title');
const howDialogContent = howModal.querySelector('[data-how-content]');
let howLastTrigger = null;
const closeHowModal = () => {
  if (howModal.hidden) return;
  howModal.hidden = true;
  howModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('call-modal-open');
  howLastTrigger?.focus();
};
const openHowModal = (trigger) => {
  const definition = howProgramDefinitions.find((item) => item.key === trigger.dataset.howOpen);
  const card = trigger.closest('.fp-how-card');
  if (!definition || !card) return;
  const sourceImage = card.querySelector('.fp-how-media img');
  howDialogImage.src = sourceImage?.currentSrc || sourceImage?.src || '';
  howDialogImage.alt = sourceImage?.alt ? `${sourceImage.alt} details` : '';
  howDialogTitle.textContent = definition.title;
  howDialogContent.innerHTML = `<p class="how-dialog-lead">${definition.lead}</p><ol>${definition.points.map((point) => `<li>${point}</li>`).join('')}</ol>${definition.note ? `<p class="how-dialog-note">${definition.note}</p>` : ''}`;
  howLastTrigger = trigger;
  howModal.hidden = false;
  howModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('call-modal-open');
  requestAnimationFrame(() => howModal.querySelector('[data-close-how]')?.focus());
};
document.querySelectorAll('[data-how-open]').forEach((trigger) => trigger.addEventListener('click', () => openHowModal(trigger)));
howModal.querySelectorAll('[data-close-how]').forEach((button) => button.addEventListener('click', closeHowModal));
howModal.addEventListener('click', (event) => { if (event.target === howModal) closeHowModal(); });

const concernModal = document.querySelector('[data-concern-modal]');
const concernDialog = concernModal?.querySelector('.concern-dialog');
const concernDefinitions = [
  {
    key: 'low-amh',
    title: 'Low AMH',
    image: 'assets/fertility/concern-low-amh.jpg',
    summary: 'AMH reflects egg quantity, not quality and many women with low AMH can still conceive naturally with the right changes.',
    copy: [
      'Being told you have low AMH can feel overwhelming. But AMH reflects egg quantity, not quality and many women with low AMH can still conceive naturally with the right changes in egg health, cycle regulation, weight management and nutrition.'
    ]
  },
  {
    key: 'pcod',
    title: 'PCOD/PMOS',
    image: 'assets/fertility/concern-pcod.jpg',
    summary: 'Irregular cycles and delayed ovulation can make pregnancy unpredictable, but addressing underlying hormonal imbalances can help regulate cycles and support conception.',
    copy: [
      'PCOD/PMOS doesn’t have to be a barrier to conception. Irregular cycles and delayed ovulation can make pregnancy unpredictable, but addressing underlying hormonal imbalances can help regulate cycles and support conception. We’ve helped hundreds of women with PMOS conceive without fertility treatments.'
    ]
  },
  {
    key: 'miscarriages',
    title: 'Miscarriage',
    image: 'assets/fertility/concern-miscarriage.jpg',
    summary: 'Other factors like hormone balance, egg and sperm quality, thyroid function and inflammation can also play a role.',
    copy: [
      'Experiencing a miscarriage can feel confusing and overwhelming. While 50% may be due to random genetic errors, other factors like hormone balance, egg and sperm quality, thyroid function and inflammation can also play a role. Identifying and addressing these factors can improve the chances of a healthy pregnancy. Many women with previous miscarriages have gone on to conceive and carry successfully with the right approach.'
    ]
  },
  {
    key: 'sperm-metrics',
    title: 'Poor sperm metrics/Male factor',
    image: 'assets/fertility/concern-sperm.jpg',
    summary: 'Sperm count, motility or morphology issues can make fertilisation more difficult, but they can be improved.',
    copy: [
      'Sperm count, motility or morphology issues can make fertilisation more difficult, but they can be improved. Nutrition, oxidative stress, lifestyle and overall health play a key role. Identifying underlying conditions like infections or varicocele is equally important. Many couples with these challenges have gone on to conceive naturally in our program.'
    ]
  },
  {
    key: 'failed-iui-ivf',
    title: 'Failed IUI/IVF',
    image: 'assets/fertility/program-doctor.jpg',
    summary: 'Before your next treatment, take a pause to identify root causes, improve your body’s health and reassess key metrics.',
    copy: [
      'A failed IUI or IVF cycle can feel exhausting, but it doesn’t mean the next one won’t work. It may indicate underlying factors that need attention. Before your next treatment, take a pause to identify root causes, improve your body’s health and reassess key metrics. Many couples who joined our program to prepare for their next IUI/IVF ended up conceiving naturally!'
    ]
  },
  {
    key: 'weight-concerns',
    title: 'Weight concerns',
    image: 'assets/fertility/concern-thyroid.jpg',
    summary: 'Being underweight or overweight can disrupt hormonal balance and ovulation.',
    copy: [
      'Weight can affect fertility, but it’s not just about the number on the scale. Being underweight or overweight can disrupt hormonal balance and ovulation. The right nutrition, movement, training and sustainable lifestyle changes can support conception. Our couples have lost up to 12 kg in 3 months and experienced spontaneous pregnancies.'
    ]
  },
  {
    key: 'unexplained-infertility',
    title: 'Unexplained infertility',
    image: 'assets/fertility/concern-unexplained.jpg',
    summary: 'Often, subtle factors like egg and sperm quality, timing, hormone balance or the uterine environment may still play a role.',
    copy: [
      'Unexplained infertility can feel helpless, especially when everything looks normal. Often, subtle factors like egg and sperm quality, timing, hormone balance or the uterine environment may still play a role. Identifying and addressing these factors can help many couples conceive naturally. We’ve seen some of the quickest pregnancies among couples with unexplained infertility in our program.'
    ]
  }
];

const concernGrid = document.querySelector('.fp-concern-grid');
const concernSectionTitle = document.querySelector('.fp-concerns .fp-centered-head h2');
if (concernSectionTitle) concernSectionTitle.textContent = 'Concerns the program supports';
const existingConcernTrigger = concernGrid?.querySelector('[data-concern-open]');
const existingConcernPanel = concernDialog?.querySelector('[data-concern-panel]');
concernDefinitions.forEach((definition) => {
  let trigger = document.querySelector(`[data-concern-open="${definition.key}"]`);
  if (!trigger && concernGrid && existingConcernTrigger) {
    trigger = existingConcernTrigger.cloneNode(true);
    trigger.dataset.concernOpen = definition.key;
    concernGrid.appendChild(trigger);
  }
  if (trigger) {
    const image = trigger.querySelector('img');
    const label = trigger.querySelector('span');
    if (image) {
      image.src = definition.image;
      image.alt = definition.title;
    }
    if (label) {
      const title = document.createElement('strong');
      const number = document.createElement('small');
      const summary = document.createElement('span');
      title.className = 'fp-concern-title';
      number.className = 'fp-concern-number';
      summary.className = 'fp-concern-summary';
      title.textContent = definition.title;
      number.textContent = String(concernDefinitions.indexOf(definition) + 1).padStart(2, '0');
      summary.textContent = definition.copy.join(' ');
      label.replaceChildren(title, number, summary);
    }
    concernGrid?.appendChild(trigger);
  }

  let panel = concernDialog?.querySelector(`[data-concern-panel="${definition.key}"]`);
  if (!panel && concernDialog && existingConcernPanel) {
    panel = existingConcernPanel.cloneNode(false);
    panel.dataset.concernPanel = definition.key;
    panel.hidden = true;
    concernDialog.appendChild(panel);
  }
  if (panel) {
    const heading = document.createElement('h2');
    heading.textContent = definition.title;
    const paragraphs = definition.copy.map((text) => {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      return paragraph;
    });
    panel.replaceChildren(heading, ...paragraphs);
    concernDialog?.appendChild(panel);
  }
});
if (concernGrid) {
  const center = document.createElement('div');
  center.className = 'fp-concern-center';
  center.innerHTML = '<img src="assets/fertility/concerns-body.png" alt="Illustration representing female reproductive wellness">';
  const leftColumn = document.createElement('div');
  const centerColumn = document.createElement('div');
  const rightColumn = document.createElement('div');
  leftColumn.className = 'fp-concern-column fp-concern-column-left';
  centerColumn.className = 'fp-concern-column fp-concern-column-center';
  rightColumn.className = 'fp-concern-column fp-concern-column-right';
  ['low-amh', 'miscarriages', 'failed-iui-ivf'].forEach((key) => leftColumn.appendChild(concernGrid.querySelector(`[data-concern-open="${key}"]`)));
  centerColumn.append(center, concernGrid.querySelector('[data-concern-open="weight-concerns"]'));
  ['pcod', 'unexplained-infertility', 'sperm-metrics'].forEach((key) => rightColumn.appendChild(concernGrid.querySelector(`[data-concern-open="${key}"]`)));
  concernGrid.replaceChildren(leftColumn, centerColumn, rightColumn);
}
const concernPanels = [...document.querySelectorAll('[data-concern-panel]')];
const concernMedia = document.createElement('figure');
const concernImage = document.createElement('img');
concernMedia.className = 'concern-dialog-media';
concernImage.alt = '';
concernMedia.appendChild(concernImage);
if (concernDialog && concernPanels[0]) concernDialog.insertBefore(concernMedia, concernPanels[0]);
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
  const triggerImage = trigger.querySelector('img');
  concernImage.src = triggerImage?.currentSrc || triggerImage?.src || '';
  concernImage.alt = triggerImage?.alt ? `${triggerImage.alt} details` : '';
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
    closeHowModal();
    closeConcernModal();
    closeModal();
    mainNav?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }
});
