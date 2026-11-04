/* ============================================================
   SK. ROUSHAN KHALID : EDITORIAL INTERACTION ENGINE
   Modern Editorial × Swiss Minimalism
   Navigation, Dhaka Live Time, Toast System, Clipboard Utility,
   and Restrained Scroll Progress
   ============================================================ */

(function () {
  'use strict';

  /* ===========================
     TOAST NOTIFICATION UTILITY
  =========================== */
  function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');

    const defaultIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
    toast.innerHTML = `
      <span style="display:flex;align-items:center;">${defaultIcon}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-out');
      toast.addEventListener('animationend', () => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      });
    }, 2800);
  }

  /* ===========================
     CLIPBOARD COPY UTILITY
  =========================== */
  async function copyToClipboard(text, successMessage) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        textarea.style.top = '-999999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showToast(successMessage || 'Copied to clipboard');
    } catch (err) {
      console.warn('Copy failed:', err);
      showToast('Could not copy to clipboard');
    }
  }

  /* ===========================
     LIVE DHAKA CLOCK (UTC+6)
  =========================== */
  function initDhakaClock() {
    const el = document.getElementById('dhakaTime');
    if (!el) return;

    function updateTime() {
      try {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Dhaka',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        el.textContent = `Dhaka, BD • ${timeStr}`;
      } catch (err) {
        el.textContent = 'Dhaka, BD (UTC+6)';
      }
    }

    updateTime();
    setInterval(updateTime, 1000);
  }

  /* ===========================
     NAVIGATION SCROLLSPY & MOBILE MENU
  =========================== */
  function initNavigation() {
    const nav = document.getElementById('nav');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    const navToggle = document.getElementById('navToggle');
    const navLinksContainer = document.getElementById('navLinks');

    // Sticky nav border state
    window.addEventListener('scroll', () => {
      if (nav) {
        nav.classList.toggle('scrolled', window.scrollY > 20);
      }
    }, { passive: true });

    // ScrollSpy
    function highlightNav() {
      const scrollY = window.pageYOffset;
      const navOffset = 180;

      sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - navOffset;
        const sectionId = current.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }

    window.addEventListener('scroll', highlightNav, { passive: true });
    highlightNav();

    // Mobile Menu
    if (navToggle && navLinksContainer) {
      navToggle.addEventListener('click', () => {
        const isOpen = navLinksContainer.classList.toggle('open');
        navToggle.classList.toggle('open', isOpen);
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      navLinksContainer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navLinksContainer.classList.remove('open');
          navToggle.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        });
      });

      document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && navLinksContainer.classList.contains('open')) {
          navLinksContainer.classList.remove('open');
          navToggle.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinksContainer.classList.contains('open')) {
          navLinksContainer.classList.remove('open');
          navToggle.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
          navToggle.focus();
        }
      });
    }
  }

  /* ===========================
     COPY BUTTONS & ACTIONS
  =========================== */
  function initCopyButtons() {
    document.querySelectorAll('.contact-copy-btn[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-copy');
        if (text) copyToClipboard(text, `Copied: ${text}`);
      });
    });
  }

  /* ===========================
     SCROLL PROGRESS INDICATOR
  =========================== */
  function initScrollProgress() {
    const bar = document.getElementById('scrollProgressBar');
    if (!bar) return;

    function update() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
        bar.style.width = `${progress}%`;
      }
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ===========================
     BACK TO TOP BUTTON
  =========================== */
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ===========================
     RESTRAINED SCROLL REVEALS
  =========================== */
  function initScrollAnimations() {
    const REDUCED_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const cards = document.querySelectorAll(
      '.expertise-card, .impact-card-block, .journey-item, .milestone-box, .about-narrative-card, .about-pillars-card'
    );

    if (REDUCED_MOTION) {
      cards.forEach(el => el.classList.add('is-revealed'));
      return;
    }

    cards.forEach(el => el.classList.add('reveal-init'));

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -30px 0px'
    });

    cards.forEach(el => observer.observe(el));
  }

  /* ===========================
     INITIALIZE ON DOM READY
  =========================== */
  function init() {
    initDhakaClock();
    initNavigation();
    initCopyButtons();
    initScrollProgress();
    initBackToTop();
    initScrollAnimations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
