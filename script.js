/**
 * SK. ROUSHAN KHALID — ARCHITECTURAL EDITORIAL PORTFOLIO
 * Application Scripts & Interactive Controls
 */

(function () {
  'use strict';

  /* ============================================================
     1. THEME ENGINE (EDITORIAL LIGHT & OBSIDIAN DARK)
     ============================================================ */
  function initTheme() {
    const toggleBtn = document.getElementById('themeToggleBtn');
    const labelText = document.getElementById('themeLabelText');
    const metaTheme = document.getElementById('metaThemeColor');

    function getPreferredTheme() {
      try {
        const saved = localStorage.getItem('roushan_theme_pref');
        if (saved === 'dark' || saved === 'light') return saved;
      } catch (e) {}
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }

    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      try {
        localStorage.setItem('roushan_theme_pref', theme);
      } catch (e) {}

      if (labelText) {
        labelText.textContent = theme === 'dark' ? 'Light' : 'Dark';
      }

      if (metaTheme) {
        metaTheme.setAttribute('content', theme === 'dark' ? '#0E0E10' : '#F9F8F5');
      }

      if (toggleBtn) {
        toggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
      }
    }

    const currentTheme = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
    applyTheme(currentTheme);

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const active = document.documentElement.getAttribute('data-theme') || 'light';
        const next = active === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    }

    // Listen for OS scheme adjustments if user hasn't explicitly set preference
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        try {
          if (!localStorage.getItem('roushan_theme_pref')) {
            applyTheme(e.matches ? 'dark' : 'light');
          }
        } catch (err) {}
      });
    }
  }

  /* ============================================================
     2. LIVE DHAKA [UTC+6] CLOCK
     ============================================================ */
  function initDhakaClock() {
    const clockEl = document.getElementById('dhakaClock');
    if (!clockEl) return;

    function update() {
      try {
        const now = new Date();
        const options = {
          timeZone: 'Asia/Dhaka',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        };
        const timeStr = new Intl.DateTimeFormat('en-GB', options).format(now);
        clockEl.textContent = `Dhaka ${timeStr} [UTC+6]`;
      } catch (e) {
        clockEl.textContent = 'Dhaka [UTC+6]';
      }
    }

    update();
    setInterval(update, 20000);
  }

  /* ============================================================
     3. READING PROGRESS & MASTHEAD SCROLL DYNAMICS
     ============================================================ */
  function initScrollDynamics() {
    const progressBar = document.getElementById('readingProgress');
    const masthead = document.getElementById('mastheadWrapper');

    let ticking = false;

    function onScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }

      if (masthead) {
        if (scrollTop > 24) {
          masthead.classList.add('scrolled');
        } else {
          masthead.classList.remove('scrolled');
        }
      }

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });

    onScroll();
  }

  /* ============================================================
     4. CHAPTER NAVIGATION & ACTIVE INTERSECTION OBSERVER
     ============================================================ */
  function initNavigation() {
    const menuToggle = document.getElementById('mobileNavToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = navMenu ? navMenu.querySelectorAll('.nav-item-link') : [];

    if (menuToggle && navMenu) {
      menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navMenu.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
          navMenu.classList.remove('open');
          menuToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Close mobile nav on link click
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (navMenu) navMenu.classList.remove('open');
        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Active Chapter Indicator via IntersectionObserver
    const sections = document.querySelectorAll('section[id]');
    if ('IntersectionObserver' in window && sections.length > 0) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });
      }, {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
      });

      sections.forEach((sec) => observer.observe(sec));
    }
  }

  /* ============================================================
     5. 1-CLICK CLIPBOARD EMAIL COPY & TOAST
     ============================================================ */
  function initEmailCopy() {
    const copyCard = document.getElementById('emailCopyCard');
    const copyBtn = document.getElementById('emailCopyBtn');
    const emailEl = document.getElementById('contactEmailAddress');
    const toast = document.getElementById('toastNotice');

    if (!copyCard && !copyBtn) return;

    let toastTimer = null;

    function showToast(message) {
      if (!toast) return;
      toast.textContent = message;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove('show');
      }, 2400);
    }

    function doCopy(e) {
      if (e) e.preventDefault();
      const email = emailEl ? emailEl.textContent.trim() : 'skroushankhalid.17@gmail.com';

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email)
          .then(() => showToast(`Copied ${email} to clipboard`))
          .catch(() => fallbackCopy(email));
      } else {
        fallbackCopy(email);
      }
    }

    function fallbackCopy(text) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showToast(`Copied ${text} to clipboard`);
      } catch (err) {
        showToast('Please copy: ' + text);
      }
      document.body.removeChild(ta);
    }

    if (copyCard) copyCard.addEventListener('click', doCopy);
    if (copyBtn) {
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        doCopy(e);
      });
    }

    // Keyboard accessibility for card
    if (copyCard) {
      copyCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          doCopy(e);
        }
      });
    }
  }

  /* ============================================================
     6. PORTFOLIO DATA INGESTION (DYNAMIC SYNC)
     ============================================================ */
  async function syncPortfolioData() {
    try {
      const response = await fetch('portfolio-data.json');
      if (!response.ok) return;
      const data = await response.json();

      // If custom contact email exists, keep in sync
      if (data.contact && data.contact.email) {
        const emailEl = document.getElementById('contactEmailAddress');
        if (emailEl) emailEl.textContent = data.contact.email;
      }
    } catch (err) {
      // Static pre-rendered HTML handles everything gracefully
    }
  }

  /* ============================================================
     7. INITIALIZATION BOOTSTRAP
     ============================================================ */
  function init() {
    initTheme();
    initDhakaClock();
    initScrollDynamics();
    initNavigation();
    initEmailCopy();
    syncPortfolioData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
