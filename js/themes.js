/**
 * ==========================================================
 *  ThemeManager — Tayebat Clone
 *  Handles theme palette switching (3 themes) and
 *  dark / light mode toggling with localStorage persistence.
 * ==========================================================
 */

const ThemeManager = {
  /* ── Constants ─────────────────────────────────────── */
  THEMES: ['emerald-teal', 'ocean-emerald', 'royal-emerald'],
  MODES: ['light', 'dark'],
  STORAGE_THEME: 'tayebat-theme',
  STORAGE_MODE: 'tayebat-mode',
  TRANSITION_MS: 400, // duration of the transitioning class

  /* ── Initialisation ────────────────────────────────── */
  init() {
    try {
      const theme = this.getTheme();
      const mode = this.getMode();

      this.applyTheme(theme);
      this.applyMode(mode);

      this._bindThemeButtons();
      this._bindModeToggle();
      this._bindKeyboardShortcuts();
      this._watchSystemPreference();
    } catch (err) {
      console.error('[ThemeManager] init failed:', err);
    }
  },

  /* ── Public API ────────────────────────────────────── */

  /**
   * Set the colour-palette theme.
   * @param {string} themeName — one of THEMES[]
   */
  setTheme(themeName) {
    if (!this.THEMES.includes(themeName)) {
      console.warn(`[ThemeManager] Unknown theme "${themeName}"`);
      return;
    }

    const root = document.documentElement;

    // Brief transitioning class for smooth colour change
    root.classList.add('theme-transitioning');
    root.setAttribute('data-theme', themeName);

    try {
      localStorage.setItem(this.STORAGE_THEME, themeName);
    } catch { /* quota exceeded / private mode */ }

    this._updateThemeButtons(themeName);

    setTimeout(() => root.classList.remove('theme-transitioning'), this.TRANSITION_MS);
  },

  /**
   * Set display mode (light / dark).
   * @param {'light'|'dark'} mode
   */
  setMode(mode) {
    if (!this.MODES.includes(mode)) return;

    const root = document.documentElement;
    root.setAttribute('data-mode', mode);

    try {
      localStorage.setItem(this.STORAGE_MODE, mode);
    } catch { /* silent */ }

    this._updateModeToggle(mode);
  },

  /** Toggle between light ↔ dark. */
  toggleMode() {
    const next = this.getMode() === 'dark' ? 'light' : 'dark';
    this.setMode(next);
  },

  /** Cycle to the next theme in the list. */
  cycleTheme() {
    const current = this.getTheme();
    const idx = this.THEMES.indexOf(current);
    const next = this.THEMES[(idx + 1) % this.THEMES.length];
    this.setTheme(next);
  },

  /* ── Getters (with fallbacks) ──────────────────────── */
  getTheme() {
    try {
      return localStorage.getItem(this.STORAGE_THEME) || 'emerald-teal';
    } catch {
      return 'emerald-teal';
    }
  },

  getMode() {
    try {
      const saved = localStorage.getItem(this.STORAGE_MODE);
      if (saved) return saved;
    } catch { /* silent */ }

    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },

  /* ── Private helpers ───────────────────────────────── */

  /** Apply theme attribute without saving (used at boot). */
  applyTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    this._updateThemeButtons(themeName);
  },

  /** Apply mode attribute without saving (used at boot). */
  applyMode(mode) {
    document.documentElement.setAttribute('data-mode', mode);
    this._updateModeToggle(mode);
  },

  /** Bind click handlers on [data-theme-btn] buttons. */
  _bindThemeButtons() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-theme-btn]');
      if (!btn) return;
      const themeName = btn.getAttribute('data-theme-btn');
      this.setTheme(themeName);
    });
  },

  /** Bind click handler on #modeToggle / .mode-toggle button. */
  _bindModeToggle() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#modeToggle, .mode-toggle');
      if (!btn) return;
      this.toggleMode();
    });
  },

  /** Update .active class on theme selector buttons. */
  _updateThemeButtons(activeTheme) {
    const buttons = document.querySelectorAll('[data-theme-btn]');
    buttons.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-theme-btn') === activeTheme);
    });
  },

  /** Swap icon / aria-label on the mode toggle button. */
  _updateModeToggle(mode) {
    const btn = document.querySelector('#modeToggle, .mode-toggle');
    if (!btn) return;

    const icon = btn.querySelector('.mode-icon, .toggle-icon');
    if (icon) {
      icon.textContent = mode === 'dark' ? '☀️' : '🌙';
    }

    btn.setAttribute('aria-label', mode === 'dark' ? 'تبديل إلى الوضع الفاتح' : 'تبديل إلى الوضع الداكن');
  },

  /** Keyboard shortcuts: Alt+T = cycle theme, Alt+D = toggle mode. */
  _bindKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (!e.altKey) return;

      switch (e.key.toLowerCase()) {
        case 't':
          e.preventDefault();
          this.cycleTheme();
          break;
        case 'd':
          e.preventDefault();
          this.toggleMode();
          break;
      }
    });
  },

  /** React to OS-level colour-scheme changes (e.g. sunset auto-dark). */
  _watchSystemPreference() {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (e) => {
      // Only follow system if user hasn't explicitly saved a preference
      try {
        if (localStorage.getItem(this.STORAGE_MODE)) return;
      } catch { /* silent */ }

      this.setMode(e.matches ? 'dark' : 'light');
    };

    // Safari < 14 uses addListener; modern browsers use addEventListener
    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
    } else if (mql.addListener) {
      mql.addListener(handler);
    }
  },
};
