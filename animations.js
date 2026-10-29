(() => {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!gsap || !ScrollTrigger || reduceMotion) {
    document.documentElement.classList.add('motion-safe-fallback');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });
  document.documentElement.classList.add('gsap-active');

  const originalText = new Map();
  const animations = [];

  const splitIntoVisualLines = (element) => {
    if (!element || element.dataset.linesSplit === 'true') return;

    const originalHTML = element.innerHTML;
    const accessibleText = element.innerText.trim();
    originalText.set(element, originalHTML);

    const source = document.createElement('div');
    source.innerHTML = originalHTML.replace(/<br\s*\/?\s*>/gi, ' __NEWKIND_LINE_BREAK__ ');
    const tokens = source.textContent.trim().split(/\s+/).filter(Boolean);

    element.textContent = '';
    tokens.forEach((token) => {
      if (token === '__NEWKIND_LINE_BREAK__') {
        element.append(document.createElement('br'));
        return;
      }
      const word = document.createElement('span');
      word.className = 'line-measure-word';
      word.textContent = `${token} `;
      element.append(word);
    });

    const groups = [];
    element.querySelectorAll('.line-measure-word').forEach((word) => {
      const top = Math.round(word.getBoundingClientRect().top);
      const current = groups.at(-1);
      if (!current || Math.abs(current.top - top) > 2) groups.push({ top, words: [word.textContent.trim()] });
      else current.words.push(word.textContent.trim());
    });

    if (!groups.length) {
      element.innerHTML = originalHTML;
      return;
    }

    element.textContent = '';
    element.classList.add('anim-lines');
    element.setAttribute('aria-label', accessibleText);
    groups.forEach((group) => {
      const clip = document.createElement('span');
      const line = document.createElement('span');
      clip.className = 'anim-line';
      line.className = 'anim-line-inner';
      clip.setAttribute('aria-hidden', 'true');
      line.textContent = group.words.join(' ');
      clip.append(line);
      element.append(clip);
    });
    element.dataset.linesSplit = 'true';
  };

  const lineTargets = [
    '.hero h1', '.hero-copy',
    '.program-card h2', '.program-card p',
    '.about-copy h2', '.about-copy > p:not(.eyebrow)',
    '.how-heading h2', '.how-heading > p:last-child',
    '.step h3', '.step p',
    '.section-heading h2', '.section-heading > p:last-child',
    '.why-column h3', '.why-column p',
    '.journal-heading h2', '.journal-card h3', '.journal-card p',
    '.faq-grid h2', '.faq-grid > div:first-child > p:last-child',
    '.final-content h2', '.final-content > p:not(.eyebrow)',
    '.footer-brand p',
    '.fp-hero h1', '.fp-hero-content > p',
    '.fp-stats-grid p',
    '.fp-audience h2', '.fp-audience p', '.fp-trust li',
    '.fp-section-head h2', '.fp-section-head p',
    '.fp-centered-head h2', '.fp-centered-head p',
    '.fp-program-intro h2', '.fp-program-intro p',
    '.fp-program-card h3', '.fp-program-card > p',
    '.fp-how-card h3', '.fp-how-card p',
    '.fp-questions-cta h2', '.fp-questions-cta p',
    '.fp-closing h2', '.fp-closing-copy p'
  ];

  const selectWithin = (root, selector) => [...root.querySelectorAll(selector)];

  const addSectionTimeline = (selector, options = {}) => {
    const section = document.querySelector(selector);
    if (!section) return;

    const timeline = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: {
        trigger: section,
        start: options.start || 'top 78%',
        once: true,
        invalidateOnRefresh: true,
        onLeave: (self) => self.animation.progress(1)
      }
    });

    const eyebrow = selectWithin(section, '.eyebrow');
    const lines = selectWithin(section, '.anim-line-inner');
    const media = options.media ? selectWithin(section, options.media) : [];
    const cards = options.cards ? selectWithin(section, options.cards) : [];
    const controls = options.controls ? selectWithin(section, options.controls) : [];
    const animatedElements = [...new Set([section, ...eyebrow, ...lines, ...media, ...cards, ...controls])];

    gsap.set(animatedElements, { transition: 'none' });

    timeline.from(section, { opacity: .94, duration: .45 });
    if (eyebrow.length) timeline.from(eyebrow, { autoAlpha: 0, y: 14, duration: .45 }, 0);
    if (media.length) {
      timeline.from(media, {
        autoAlpha: 0,
        clipPath: 'inset(0 0 12% 0 round 30px)',
        scale: 1.035,
        duration: .9,
        stagger: .12,
        clearProps: 'clipPath'
      }, .08);
    }
    if (cards.length) {
      timeline.from(cards, {
        autoAlpha: 0,
        y: 42,
        scale: .985,
        duration: .78,
        stagger: { each: .1, from: 'start' }
      }, media.length ? .22 : .12);
    }
    if (lines.length) {
      timeline.from(lines, {
        autoAlpha: 0,
        yPercent: 108,
        duration: .68,
        stagger: { each: .055, from: 'start' }
      }, cards.length ? .27 : .12);
    }
    if (controls.length) {
      timeline.from(controls, { autoAlpha: 0, y: 14, duration: .5, stagger: .07 }, '-=.34');
    }

    timeline.eventCallback('onComplete', () => gsap.set(animatedElements, { clearProps: 'transition' }));

    animations.push(timeline);
  };

  const initializeAnimations = () => {
    document.querySelectorAll(lineTargets.join(',')).forEach(splitIntoVisualLines);

    const landingHero = document.querySelector('.hero');
    const fertilityHero = document.querySelector('.fp-hero');
    const heroRoot = landingHero || fertilityHero;
    if (heroRoot) {
      const heroElements = [
        ...document.querySelectorAll('.site-header, .site-header nav > *, .header-cta, .hero-shade, .hero .eyebrow, .hero .anim-line-inner, .hero-actions > *, .fp-hero .anim-line-inner, .fp-hero-actions > *, .fp-watch')
      ];
      gsap.set(heroElements, { transition: 'none' });
      const heroTimeline = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => gsap.set(heroElements, { clearProps: 'transition' })
      });
      heroTimeline
        .fromTo('.site-header', { autoAlpha: 0, xPercent: -50, y: -22 }, { autoAlpha: 1, xPercent: -50, y: 0, duration: .75 })
        .from('.site-header nav > *, .header-cta', { autoAlpha: 0, y: -8, duration: .45, stagger: .045 }, '-=.42');
      if (landingHero) {
        heroTimeline
          .from('.hero-shade', { opacity: 0, duration: 1.15 }, 0)
          .from('.hero .eyebrow', { autoAlpha: 0, y: 16, duration: .5 }, .2)
          .from('.hero .anim-line-inner', { autoAlpha: 0, yPercent: 112, duration: .82, stagger: .085 }, .28)
          .from('.hero-actions > *', { autoAlpha: 0, y: 18, scale: .98, duration: .58, stagger: .1 }, '-=.38');
      } else {
        heroTimeline
          .from('.fp-hero', { opacity: .82, duration: 1.05 }, 0)
          .from('.fp-hero .anim-line-inner', { autoAlpha: 0, yPercent: 112, duration: .78, stagger: .075 }, .22)
          .from('.fp-hero-actions > *', { autoAlpha: 0, y: 18, scale: .98, duration: .56, stagger: .1 }, '-=.34');
      }
      animations.push(heroTimeline);
    }

    addSectionTimeline('.programs', { cards: '.program-card', controls: '.program-card a' });
    addSectionTimeline('.about', { media: '.about-main, .about-inset', controls: '.btn' });
    addSectionTimeline('.how', { media: '.how-background', cards: '.step' });
    addSectionTimeline('.why', { media: '.why-media', cards: '.why-column article' });
    addSectionTimeline('.stories', { controls: '.story-tabs, .carousel-controls' });
    addSectionTimeline('.care', { controls: '.care-controls' });
    addSectionTimeline('.news', { controls: '.carousel-controls' });
    addSectionTimeline('.journal', { cards: '.journal-card', controls: '.journal-heading > a' });
    addSectionTimeline('.faqs', { cards: '.accordion button' });
    addSectionTimeline('.final-cta', { media: '.final-cta > img', controls: '.btn' });
    addSectionTimeline('footer', { cards: '.footer-top > *, .footer-programs > *', controls: '.copyright' });

    addSectionTimeline('.fp-stats', { cards: '.fp-stats-grid > div' });
    addSectionTimeline('.fp-audience', { cards: '.fp-audience-grid > div, .fp-trust li' });
    addSectionTimeline('.fp-good-news', { controls: '.fp-auto-tools' });
    addSectionTimeline('.fp-programs', { cards: '.fp-program-card', media: '.fp-program-media' });
    addSectionTimeline('.fp-testimonials', { controls: '.carousel-controls' });
    addSectionTimeline('.fp-concerns', { cards: '.fp-concern' });
    addSectionTimeline('.fp-stories', { controls: '.carousel-controls' });
    addSectionTimeline('.fp-how', { cards: '.fp-how-card', media: '.fp-how-media', controls: '.fp-section-cta' });
    addSectionTimeline('.fp-more-news', { controls: '.fp-auto-tools' });
    addSectionTimeline('.fp-care', { controls: '.carousel-controls' });
    addSectionTimeline('.fp-faq', { cards: '.fp-faq-item' });
    addSectionTimeline('.fp-closing', { start: 'top 82%' });

    const media = gsap.matchMedia();
    media.add('(min-width: 761px)', () => {
      const parallaxAnimations = landingHero ? [
        gsap.to('.hero', {
          backgroundPosition: '50% 58%',
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .8 }
        }),
        gsap.to('.about-main', {
          yPercent: -4,
          ease: 'none',
          scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: 1 }
        }),
        gsap.to('.about-inset', {
          yPercent: 7,
          ease: 'none',
          scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: 1 }
        }),
        gsap.to('.how-background', {
          backgroundPosition: '50% 58%',
          ease: 'none',
          scrollTrigger: { trigger: '.how', start: 'top bottom', end: 'bottom top', scrub: 1 }
        }),
        gsap.fromTo('.why-media', { yPercent: -3 }, {
          yPercent: 3,
          ease: 'none',
          scrollTrigger: { trigger: '.why', start: 'top bottom', end: 'bottom top', scrub: 1 }
        }),
        gsap.fromTo('.final-cta > img', { scale: 1.055, yPercent: -2 }, {
          scale: 1,
          yPercent: 2,
          ease: 'none',
          scrollTrigger: { trigger: '.final-cta', start: 'top bottom', end: 'bottom top', scrub: 1 }
        })
      ] : [];

      if (fertilityHero) {
        const fertilityParallax = [
          gsap.to('.fp-hero', {
            backgroundPosition: '54% 58%',
            ease: 'none',
            scrollTrigger: { trigger: '.fp-hero', start: 'top top', end: 'bottom top', scrub: .8 }
          }),
          gsap.to('.fp-closing', {
            backgroundPosition: '50% 55%',
            ease: 'none',
            scrollTrigger: { trigger: '.fp-closing', start: 'top bottom', end: 'bottom top', scrub: 1 }
          })
        ];
        parallaxAnimations.push(...fertilityParallax);
      }
      return undefined;
    });
    animations.push(media);

    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  const ready = document.fonts?.ready || Promise.resolve();
  ready.then(initializeAnimations);

  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  window.addEventListener('pagehide', () => {
    animations.forEach((animation) => animation.revert?.() || animation.kill?.());
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    originalText.forEach((html, element) => {
      element.innerHTML = html;
      element.removeAttribute('aria-label');
      delete element.dataset.linesSplit;
    });
  }, { once: true });
})();
