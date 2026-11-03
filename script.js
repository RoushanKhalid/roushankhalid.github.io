/* ============================================================
   ROUSHAN KHALID — SYSTEM ARCHITECTURE SCRIPT & DYNAMICS
   ScrollSpy, Toast Notifications, Particle Canvas,
   Typewriter & Data Synchronization
   ============================================================ */

(function () {
  'use strict';

  /* ===========================
     TOAST NOTIFICATION SYSTEM
  =========================== */
  function showToast(message, iconHtml) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');

    const defaultIcon = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
    toast.innerHTML = `
      <span class="toast-icon">${iconHtml || defaultIcon}</span>
      <span class="toast-msg">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-out');
      toast.addEventListener('animationend', () => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      });
    }, 2600);
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
     TYPING EFFECT
  =========================== */
  const DEFAULT_TYPING_PHRASES = [
    'Applied AI & GenAI Systems',
    'Scalable Backend Architecture',
    'Autonomous Multi-Agent Workflows',
    'Cloud & Distributed Systems',
    'Commercial Product Strategy'
  ];

  let activePhrases = [...DEFAULT_TYPING_PHRASES];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingTimeout = null;
  let typingInitialized = false;

  function startTyping(customPhrases) {
    if (Array.isArray(customPhrases) && customPhrases.length > 0) {
      activePhrases = customPhrases;
    }

    const typedEl = document.getElementById('typedText');
    if (!typedEl || activePhrases.length === 0) return;

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      typedEl.textContent = activePhrases[0];
      return;
    }

    if (typingInitialized) return;
    typingInitialized = true;

    function typeTick() {
      const current = activePhrases[phraseIndex % activePhrases.length];
      if (isDeleting) {
        charIndex = Math.max(0, charIndex - 1);
        typedEl.textContent = current.substring(0, charIndex);
      } else {
        charIndex = Math.min(current.length, charIndex + 1);
        typedEl.textContent = current.substring(0, charIndex);
      }

      let speed = isDeleting ? 32 : 70;

      if (!isDeleting && charIndex === current.length) {
        speed = 2200;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % activePhrases.length;
        speed = 350;
      }

      typingTimeout = setTimeout(typeTick, speed);
    }

    typeTick();
  }

  /* ===========================
     NAVIGATION SCROLLSPY & SCROLL EFFECT
  =========================== */
  function initNavigation() {
    const nav = document.getElementById('nav');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const navToggle = document.getElementById('navToggle');
    const navLinksContainer = document.getElementById('navLinks');

    // Sticky nav state
    window.addEventListener('scroll', () => {
      if (nav) {
        nav.classList.toggle('scrolled', window.scrollY > 20);
      }
    }, { passive: true });

    // ScrollSpy
    function highlightNav() {
      const scrollY = window.pageYOffset;
      const navOffset = 140;

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

    // Mobile nav toggle
    if (navToggle && navLinksContainer) {
      navToggle.addEventListener('click', () => {
        const isOpen = navLinksContainer.classList.toggle('open');
        navToggle.classList.toggle('open', isOpen);
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      // Close on link click
      navLinksContainer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navLinksContainer.classList.remove('open');
          navToggle.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        });
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && navLinksContainer.classList.contains('open')) {
          navLinksContainer.classList.remove('open');
          navToggle.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      });

      // Close on Escape key
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
     SPECIALIZED SYSTEMS FILTER
  =========================== */
  function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const systemCards = document.querySelectorAll('.system-card[data-category]');

    if (!filterBtns.length || !systemCards.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const filterVal = btn.getAttribute('data-filter');

        systemCards.forEach(card => {
          const cardCat = card.getAttribute('data-category');
          if (filterVal === 'all' || cardCat === filterVal) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* ===========================
     COPY BUTTONS & ACTIONS
  =========================== */
  function initCopyButtons() {
    // Hero Email Copy
    const heroCopyBtn = document.getElementById('heroCopyEmailBtn');
    if (heroCopyBtn) {
      heroCopyBtn.addEventListener('click', () => {
        copyToClipboard('skroushankhalid.17@gmail.com', 'Email copied: skroushankhalid.17@gmail.com');
      });
    }

    // Generic Contact Copy Buttons
    const contactCopyBtns = document.querySelectorAll('.contact-copy-btn[data-copy]');
    contactCopyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const textToCopy = btn.getAttribute('data-copy');
        if (textToCopy) {
          copyToClipboard(textToCopy, `Copied: ${textToCopy}`);
        }
      });
    });

    // Research Citation Copy
    const copyCitationBtn = document.getElementById('copyCitationBtn');
    if (copyCitationBtn) {
      copyCitationBtn.addEventListener('click', () => {
        const citation = 'Khalid, S. R. (2025). An Interpretable ML Framework for Predicting Structural Heart Disease from ECG Using LLM-Powered Insights. SSRN Electronic Journal. Abstract ID: 5875405.';
        copyToClipboard(citation, 'Citation copied (APA format)');
      });
    }
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
     REFINED CONSTELLATION PARTICLES
  =========================== */
  function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas || typeof canvas.getContext !== 'function') return;

    const ctx = canvas.getContext('2d');
    const REDUCED_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (REDUCED_MOTION) return;

    let particles = [];
    let rafId = null;
    let heroVisible = true;
    const PARTICLE_COUNT = 36;

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    class Particle {
      constructor() { this.reset(); }
      reset() {
        const w = canvas.offsetWidth || window.innerWidth || 1;
        const h = canvas.offsetHeight || window.innerHeight || 1;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 1.2 + 0.4;
        this.speedX = (Math.random() - 0.5) * 0.22;
        this.speedY = (Math.random() - 0.5) * 0.22;
        this.opacity = Math.random() * 0.4 + 0.1;
      }
      update() {
        const w = canvas.offsetWidth || 1;
        const h = canvas.offsetHeight || 1;
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > w) this.speedX *= -1;
        if (this.y < 0 || this.y > h) this.speedY *= -1;
      }
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(29, 78, 216, ${this.opacity * 0.35})`;
        ctx.fill();
      }
    }

    function createParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
      }
    }

    function drawConnections() {
      if (!ctx) return;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(29, 78, 216, ${alpha * 0.18})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animateParticles() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      particles.forEach(p => { p.update(); p.draw(); });
      drawConnections();
      rafId = requestAnimationFrame(animateParticles);
    }

    function startAnimation() {
      if (rafId != null || !ctx || !canvas) return;
      rafId = requestAnimationFrame(animateParticles);
    }

    function stopAnimation() {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    resizeCanvas();
    createParticles();
    startAnimation();

    // IntersectionObserver to pause when hero is off-screen
    const heroEl = document.getElementById('hero');
    if (heroEl && 'IntersectionObserver' in window) {
      const heroObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          heroVisible = e.isIntersecting;
          if (heroVisible && !document.hidden) startAnimation();
          else stopAnimation();
        });
      }, { threshold: 0 });
      heroObs.observe(heroEl);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAnimation();
      else if (heroVisible) startAnimation();
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeCanvas();
        createParticles();
      }, 120);
    });
  }

  /* ===========================
     DATA SYNCHRONIZATION
  =========================== */
  async function loadPortfolioData() {
    try {
      const res = await fetch('portfolio-data.json?v=' + Date.now());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();

      if (!data) return;

      // Update Hero Philosophy & Ticker Phrases
      if (data.hero) {
        if (data.hero.name) {
          document.title = `${data.hero.name} — AI/ML & Product Engineer`;
        }
        const philEl = document.getElementById('heroPhilosophy');
        if (philEl && data.hero.philosophy) philEl.textContent = data.hero.philosophy;

        if (Array.isArray(data.hero.typingPhrases) && data.hero.typingPhrases.length > 0) {
          startTyping(data.hero.typingPhrases);
        }
      }

      // Update Contact Notes
      if (data.contact) {
        const footerNoteEl = document.getElementById('contactFooterNote');
        if (footerNoteEl && data.contact.footerNote) {
          footerNoteEl.textContent = data.contact.footerNote;
        }

        const footerCopyEl = document.getElementById('footerCopy');
        if (footerCopyEl && data.contact.footerCopy) {
          footerCopyEl.textContent = data.contact.footerCopy;
        }
      }
    } catch (err) {
      console.info('Static fallback in place:', err.message);
    }
  }

  /* ===========================
     BOOTSTRAP ON DOM READY
  =========================== */
  function init() {
    startTyping();
    initNavigation();
    initProjectFilters();
    initCopyButtons();
    initBackToTop();
    initParticles();
    loadPortfolioData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
