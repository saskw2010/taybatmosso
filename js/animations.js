/**
 * ==========================================================
 *  AnimationManager — Tayebat Clone
 *  Scroll-triggered reveal animations and animated counters
 *  using IntersectionObserver + requestAnimationFrame.
 * ==========================================================
 */

const AnimationManager = {
  /* ── Counter targets ───────────────────────────────── */
  STAT_TARGETS: {
    statAllowed:   89,
    statForbidden: 81,
    statTotal:     170,
  },

  FREQUENCY_TARGETS: {
    unlimited: 5,
    daily:     28,
    weekly:    32,
    sometimes: 24,
    never:     81,
  },

  /* ── Initialisation ────────────────────────────────── */
  init() {
    try {
      this.setupRevealObserver();
      this.setupCounterAnimation();
    } catch (err) {
      console.error('[AnimationManager] init failed:', err);
    }
  },

  /* ── Scroll Reveal ─────────────────────────────────── */

  /**
   * Observes every `.reveal` element and adds `.visible`
   * once it scrolls into view. Supports per-element
   * `data-delay` for staggered entrance animations.
   */
  setupRevealObserver() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: show everything immediately
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          const delay = parseInt(el.dataset.delay, 10) || 0;

          if (delay > 0) {
            el.style.transitionDelay = `${delay}ms`;
          }

          el.classList.add('visible');
          observer.unobserve(el); // animate only once
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px', // trigger slightly before fully in view
      }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  },

  /* ── Counter Animation ─────────────────────────────── */

  /**
   * Set up observers for the main stats bar and the
   * frequency mini-count badges. Each counter animates
   * only once when first scrolled into view.
   */
  setupCounterAnimation() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: set final values immediately
      this._setFinalValues();
      return;
    }

    const counterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const container = entry.target;
          this._animateCountersIn(container);
          obs.unobserve(container);
        });
      },
      { threshold: 0.2 }
    );

    // Main stats bar
    const statsBar = document.querySelector('.stats-bar, .stats-section, #statsBar');
    if (statsBar) counterObserver.observe(statsBar);

    // Frequency mini counts (may live in a different section)
    const freqSection = document.querySelector('.frequency-section, .frequency-guide, #frequencySection');
    if (freqSection && freqSection !== statsBar) {
      counterObserver.observe(freqSection);
    }

    // Also observe any standalone [data-counter-target] elements
    document.querySelectorAll('[data-counter-target]').forEach((el) => {
      counterObserver.observe(el);
    });
  },

  /**
   * Animate a single number element from 0 → target.
   *
   * @param {HTMLElement} element  — the DOM node whose textContent will update
   * @param {number}      target   — final integer value
   * @param {number}      duration — animation length in ms (default 2000)
   */
  animateCounter(element, target, duration = 2000) {
    if (!element || target === 0) {
      if (element) element.textContent = '0';
      return;
    }

    const start = performance.now();
    const easeOutQuad = (t) => t * (2 - t);

    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuad(progress);

      element.textContent = Math.round(easedProgress * target);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        // Guarantee final value is exact
        element.textContent = target;
      }
    };

    requestAnimationFrame(update);
  },

  /* ── Private helpers ───────────────────────────────── */

  /**
   * Find counter elements inside a container and kick off
   * their animations with a slight stagger.
   */
  _animateCountersIn(container) {
    const stagger = 150; // ms between each counter start
    let index = 0;

    // 1) Main stat counters by id
    Object.entries(this.STAT_TARGETS).forEach(([id, target]) => {
      const el = container.querySelector(`#${id}`) || document.getElementById(id);
      if (el) {
        setTimeout(() => this.animateCounter(el, target), index * stagger);
        index++;
      }
    });

    // 2) Frequency mini-counts by id
    Object.entries(this.FREQUENCY_TARGETS).forEach(([id, target]) => {
      const el = container.querySelector(`#${id}`) || document.getElementById(id);
      if (el) {
        setTimeout(() => this.animateCounter(el, target), index * stagger);
        index++;
      }
    });

    // 3) Generic [data-counter-target] elements (extensible)
    container.querySelectorAll('[data-counter-target]').forEach((el) => {
      const target = parseInt(el.dataset.counterTarget, 10);
      if (isNaN(target)) return;

      // Skip if already handled by id
      if (el.id && (this.STAT_TARGETS[el.id] != null || this.FREQUENCY_TARGETS[el.id] != null)) return;

      const duration = parseInt(el.dataset.counterDuration, 10) || 2000;
      setTimeout(() => this.animateCounter(el, target, duration), index * stagger);
      index++;
    });
  },

  /** Fallback: set all counters to their final values instantly. */
  _setFinalValues() {
    const setById = (map) => {
      Object.entries(map).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
      });
    };

    setById(this.STAT_TARGETS);
    setById(this.FREQUENCY_TARGETS);

    document.querySelectorAll('[data-counter-target]').forEach((el) => {
      el.textContent = el.dataset.counterTarget;
    });
  },
};
