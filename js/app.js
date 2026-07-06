/**
 * ==========================================================
 *  App — Tayebat Clone (main entry point)
 *  Orchestrates all modules: themes, animations, mobile menu,
 *  dropdowns, testimonial cards and dynamic footer.
 *  No external dependencies — pure vanilla ES6+.
 * ==========================================================
 */

const App = {
  /* ── Initialisation ────────────────────────────────── */
  init() {
    try {
      ThemeManager.init();
      AnimationManager.init();
      this.setupMobileMenu();
      this.setupDropdowns();
      this.renderTestimonials();
      this.renderFooter();
      this.setupSmoothScroll();
    } catch (err) {
      console.error('[App] init failed:', err);
    }
  },

  /* ══════════════════════════════════════════════════════
   *  Mobile Menu
   * ══════════════════════════════════════════════════════ */
  setupMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.getElementById('mainNav');
    if (!menuBtn || !nav) return;

    // Create overlay element for behind-menu backdrop
    let overlay = document.querySelector('.menu-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'menu-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      nav.parentNode.insertBefore(overlay, nav);
    }

    /** Open / close toggle */
    const toggleMenu = (forceClose = false) => {
      const isOpen = nav.classList.contains('open');
      const shouldClose = forceClose === true || isOpen;

      nav.classList.toggle('open', !shouldClose);
      menuBtn.classList.toggle('active', !shouldClose);
      overlay.classList.toggle('active', !shouldClose);
      menuBtn.setAttribute('aria-expanded', String(!shouldClose));

      // Prevent body scroll when menu is open
      document.body.style.overflow = shouldClose ? '' : 'hidden';
    };

    // Toggle on hamburger click
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // Close when clicking the overlay
    overlay.addEventListener('click', () => toggleMenu(true));

    // Close when clicking a nav link (not a dropdown parent)
    nav.addEventListener('click', (e) => {
      const link = e.target.closest('a:not(.dropdown-toggle)');
      if (link) toggleMenu(true);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        toggleMenu(true);
      }
    });

    // Close when resizing past mobile breakpoint
    const mql = window.matchMedia('(min-width: 1024px)');
    const onResize = (e) => { if (e.matches) toggleMenu(true); };
    if (mql.addEventListener) mql.addEventListener('change', onResize);
    else if (mql.addListener) mql.addListener(onResize);
  },

  /* ══════════════════════════════════════════════════════
   *  Dropdown Menus (mobile click / desktop hover via CSS)
   * ══════════════════════════════════════════════════════ */
  setupDropdowns() {
    const dropdowns = document.querySelectorAll('.nav-dropdown, .has-dropdown');
    if (!dropdowns.length) return;

    dropdowns.forEach((dropdown) => {
      const toggle = dropdown.querySelector('.dropdown-toggle');
      if (!toggle) return;

      toggle.addEventListener('click', (e) => {
        // Only handle on mobile / touch devices
        if (window.innerWidth >= 1024) return;

        e.preventDefault();
        e.stopPropagation();

        // Close sibling dropdowns first
        dropdowns.forEach((other) => {
          if (other !== dropdown) other.classList.remove('open');
        });

        dropdown.classList.toggle('open');
      });
    });

    // Close all dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-dropdown, .has-dropdown')) {
        dropdowns.forEach((d) => d.classList.remove('open'));
      }
    });
  },

  /* ══════════════════════════════════════════════════════
   *  Testimonials
   * ══════════════════════════════════════════════════════ */
  renderTestimonials() {
    const grid = document.getElementById('testimonialsGrid');
    if (!grid) return;

    const testimonials = [
      {
        name: 'أحمد محمد',
        title: 'تحسن ملحوظ في الهضم',
        content:
          'بعد شهرين من اتباع نظام الطيبات، لاحظت تحسناً كبيراً في عملية الهضم وانتهت مشاكل القولون العصبي التي عانيت منها لسنوات. الحمد لله على هذا النظام الرائع.',
        rating: 5,
        duration: 'شهرين',
        date: '2026-05-15',
      },
      {
        name: 'فاطمة علي',
        title: 'خسرت 12 كيلو بدون حرمان',
        content:
          'ما صدقت إن ممكن أنحف وأنا آكل أرز وسكر! نظام الطيبات غيّر حياتي تماماً. الحين وزني مستقر وطاقتي عالية والحمد لله.',
        rating: 5,
        duration: '4 أشهر',
        date: '2026-04-20',
      },
      {
        name: 'خالد العتيبي',
        title: 'انتهت مشاكل الضغط',
        content:
          'كنت آخذ حبوب ضغط يومياً. بعد 3 أشهر على نظام الطيبات وبإشراف الطبيب، قدرت أوقف الحبوب. الضغط صار طبيعي والحمد لله رب العالمين.',
        rating: 5,
        duration: '3 أشهر',
        date: '2026-03-10',
      },
      {
        name: 'نورة السالم',
        title: 'طاقة جديدة ونوم أفضل',
        content:
          'كنت أحس بتعب دائم وأرق. من أول أسبوعين على النظام بدأت ألاحظ فرق. النوم تحسن والطاقة رجعت. شكراً للدكتور ضياء رحمه الله.',
        rating: 5,
        duration: 'شهر',
        date: '2026-06-01',
      },
      {
        name: 'محمد الحربي',
        title: 'جرثومة المعدة اختفت',
        content:
          'بعد ما جربت كل الأدوية بدون فائدة، اتبعت نصائح الدكتور ضياء في علاج الجرثومة طبيعياً. زبدة جوز الهند والمستكة غيروا كل شيء!',
        rating: 5,
        duration: '3 أشهر',
        date: '2026-02-28',
      },
      {
        name: 'سارة يوسف',
        title: 'بشرتي تغيرت تماماً',
        content:
          'كنت أعاني من حب الشباب المزمن. بعد ما تركت المصنّع واتبعت النظام، بشرتي صارت صافية. الأكل الطبيعي فعلاً هو الدواء.',
        rating: 5,
        duration: 'شهرين',
        date: '2026-01-15',
      },
    ];

    const MAX_CARDS = 6;
    const CONTENT_LIMIT = 120; // characters before truncation

    const cardsHTML = testimonials.slice(0, MAX_CARDS).map((t, i) => {
      const stars = '⭐'.repeat(Math.min(t.rating, 5));
      const truncated =
        t.content.length > CONTENT_LIMIT
          ? t.content.slice(0, CONTENT_LIMIT) + '…'
          : t.content;

      // Format date to Arabic-friendly string
      const dateStr = this._formatArabicDate(t.date);

      return `
        <div class="testimonial-card reveal" data-delay="${i * 100}">
          <div class="testimonial-rating">${stars}</div>
          <h3 class="testimonial-title">${this._escapeHTML(t.title)}</h3>
          <p class="testimonial-content">${this._escapeHTML(truncated)}</p>
          <div class="testimonial-meta">
            <span class="testimonial-name">${this._escapeHTML(t.name)}</span>
            <span class="testimonial-duration">${this._escapeHTML(t.duration)}</span>
          </div>
          <time class="testimonial-date" datetime="${t.date}">${dateStr}</time>
        </div>`;
    }).join('');

    grid.innerHTML = cardsHTML;

    // Re-observe newly added .reveal elements
    if (typeof AnimationManager !== 'undefined') {
      AnimationManager.setupRevealObserver();
    }
  },

  /* ══════════════════════════════════════════════════════
   *  Footer
   * ══════════════════════════════════════════════════════ */
  renderFooter() {
    const footer = document.querySelector('.site-footer');
    if (!footer) return;

    footer.innerHTML = `
      <div class="footer-content">
        <!-- Logo & tagline -->
        <div class="footer-logo">
          <div class="footer-logo-title">نظام الطيبات</div>
          <p>غذاؤك دواؤك ... ودواؤك في غذائك</p>
        </div>

        <!-- Link columns -->
        <div class="footer-links">
          <div class="footer-col">
            <div class="footer-col-title">النظام</div>
            <a href="/allowed" class="footer-link">✅ المسموحات</a>
            <a href="/forbidden" class="footer-link">❌ الممنوعات</a>
            <a href="/frequency-guide" class="footer-link">📊 مؤشر التكرار</a>
            <a href="/weekly-plan" class="footer-link">📅 الخطة الأسبوعية</a>
          </div>
          <div class="footer-col">
            <div class="footer-col-title">المعرفة</div>
            <a href="/about" class="footer-link">👤 الدكتور ضياء</a>
            <a href="/theories" class="footer-link">🔬 النظريات</a>
            <a href="/articles" class="footer-link">📝 المقالات</a>
            <a href="/diseases" class="footer-link">🏥 الأمراض</a>
          </div>
          <div class="footer-col">
            <div class="footer-col-title">الأدوات</div>
            <a href="/chat" class="footer-link">🤖 المساعد الذكي</a>
            <a href="/recipes" class="footer-link">🍽️ طبق الطيبات</a>
            <a href="/check-meal" class="footer-link">🔍 افحص وجبتك</a>
            <a href="/game" class="footer-link">🎮 لعبة الطيبات</a>
          </div>
        </div>

        <!-- Bottom bar -->
        <div class="footer-bottom">
          <p>© ${new Date().getFullYear()} نظام الطيبات — تخليداً لإرث الدكتور ضياء العوضي رحمه الله</p>
        </div>
      </div>
    `;
  },

  /* ══════════════════════════════════════════════════════
   *  Smooth Scroll for anchor links
   * ══════════════════════════════════════════════════════ */
  setupSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const targetId = link.getAttribute('href').slice(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Update URL hash without jumping
      history.replaceState(null, '', `#${targetId}`);
    });
  },

  /* ══════════════════════════════════════════════════════
   *  Utility helpers
   * ══════════════════════════════════════════════════════ */

  /**
   * Basic HTML escaping to prevent XSS in dynamic content.
   * @param {string} str
   * @returns {string}
   */
  _escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Format ISO date string into Arabic-style locale date.
   * @param {string} isoDate — e.g. '2026-05-15'
   * @returns {string}
   */
  _formatArabicDate(isoDate) {
    try {
      const d = new Date(isoDate);
      return d.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return isoDate;
    }
  },
};

/* ── Bootstrap ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => App.init());
