/* ============================================================
   ROUSHAN KHALID | SYSTEM ARCHITECTURE SCRIPT & DYNAMICS
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
    'Backend Systems Architecture',
    'Cloud Infrastructure & Resilience',
    'Applied AI Systems',
    'End-to-End Product Engineering'
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
     REFINED CONSTELLATION PARTICLES (With Cursor Reactivity)
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
    const PARTICLE_COUNT = 52;

    const mouse = { x: -9999, y: -9999, radius: 145 };
    const heroEl = document.getElementById('hero');
    if (heroEl) {
      heroEl.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        heroEl.style.setProperty('--mouse-x', `${mouse.x}px`);
        heroEl.style.setProperty('--mouse-y', `${mouse.y}px`);
      }, { passive: true });

      heroEl.addEventListener('mouseleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
      }, { passive: true });
    }

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
        const w = canvas.offsetWidth || window.innerWidth || 800;
        const h = canvas.offsetHeight || window.innerHeight || 600;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 1.8 + 1.2;
        this.speedX = (Math.random() - 0.5) * 0.55;
        this.speedY = (Math.random() - 0.5) * 0.55;
        this.opacity = Math.random() * 0.45 + 0.35;
        this.color = Math.random() > 0.35 ? '29, 78, 216' : (Math.random() > 0.5 ? '16, 185, 129' : '59, 130, 246');
      }
      update() {
        const w = canvas.offsetWidth || 1;
        const h = canvas.offsetHeight || 1;
        this.x += this.speedX;
        this.y += this.speedY;

        if (mouse.x > 0 && mouse.y > 0) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius && dist > 5) {
            const force = (1 - dist / mouse.radius) * 0.45;
            this.x += (dx / dist) * force;
            this.y += (dy / dist) * force;
          }
        }

        if (this.x < 0 || this.x > w) this.speedX *= -1;
        if (this.y < 0 || this.y > h) this.speedY *= -1;
      }
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
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
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.32;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(29, 78, 216, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
        if (mouse.x > 0 && mouse.y > 0) {
          const mdx = mouse.x - particles[i].x;
          const mdy = mouse.y - particles[i].y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mDist < 145) {
            const mAlpha = (1 - mDist / 145) * 0.45;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(29, 78, 216, ${mAlpha})`;
            ctx.lineWidth = 0.85;
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
          document.title = `${data.hero.name} | AI Engineer & Systems Builder`;
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
     SCROLL REVEAL MOTION (ALTERNATING LEFT & RIGHT)
  =========================== */
  function initScrollAnimations() {
    const REDUCED_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const revealSelectors = [
      '.exec-card',
      '.case-study',
      '.system-card',
      '.stack-card',
      '.arch-visualizer-wrap',
      '.timeline-item',
      '.distinction-row',
      '.research-card',
      '.stat-card',
      '.contact-card'
    ];

    const cards = document.querySelectorAll(revealSelectors.join(', '));

    if (REDUCED_MOTION) {
      cards.forEach(el => el.classList.add('is-revealed'));
      return;
    }

    let globalCounter = 0;

    cards.forEach((el) => {
      el.classList.add('reveal-card');

      if (el.classList.contains('timeline-item')) {
        const parent = el.parentElement;
        const siblings = parent ? Array.from(parent.querySelectorAll('.timeline-item')) : [];
        const idx = siblings.indexOf(el);
        if (idx % 2 === 0) {
          el.classList.add('reveal-left');
        } else {
          el.classList.add('reveal-right');
        }
      } else if (el.parentElement) {
        const siblings = Array.from(el.parentElement.children).filter(child => child.matches(revealSelectors.join(', ')));
        const idx = siblings.indexOf(el);
        if (idx >= 0) {
          el.style.setProperty('--stagger', Math.min(idx, 4));
          if (idx % 2 === 0) {
            el.classList.add('reveal-left');
          } else {
            el.classList.add('reveal-right');
          }
        } else {
          if (globalCounter % 2 === 0) {
            el.classList.add('reveal-left');
          } else {
            el.classList.add('reveal-right');
          }
          globalCounter++;
        }
      } else {
        if (globalCounter % 2 === 0) {
          el.classList.add('reveal-left');
        } else {
          el.classList.add('reveal-right');
        }
        globalCounter++;
      }
    });

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    cards.forEach(el => observer.observe(el));
  }

  /* ===========================
     SCROLL PROGRESS INDICATOR
  =========================== */
  function initScrollProgress() {
    const bar = document.getElementById('scrollProgressBar');
    if (!bar) return;

    function updateProgress() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
        bar.style.width = `${progress}%`;
      }
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* ===========================
     MAGNETIC BUTTON MICRO-INTERACTION
  =========================== */
  function initMagneticButtons() {
    const REDUCED_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (REDUCED_MOTION) return;

    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const magneticTargets = document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta-btn');
    magneticTargets.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const moveX = (x * 0.16).toFixed(2);
        const moveY = (y * 0.16).toFixed(2);
        btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ===========================
     CONTINUOUS AMBIENT PARALLAX (Jinni Labs Inspired)
  =========================== */
  function initAmbientParallax() {
    const REDUCED_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (REDUCED_MOTION) return;

    const s1 = document.getElementById('ambientShape1');
    const s2 = document.getElementById('ambientShape2');
    const s3 = document.getElementById('ambientShape3');
    const s4 = document.getElementById('ambientShape4');
    if (!s1 || !s2 || !s3 || !s4) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || window.pageYOffset;
          s1.style.marginTop = `${(scrollY * -0.05).toFixed(1)}px`;
          s2.style.marginTop = `${(scrollY * 0.04).toFixed(1)}px`;
          s3.style.marginTop = `${(scrollY * -0.04).toFixed(1)}px`;
          s4.style.marginTop = `${(scrollY * 0.03).toFixed(1)}px`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ===========================
     STACKED-CARD SCROLL MOTION (Jinni Labs Inspired)
  =========================== */
  function initStackedCards() {
    const REDUCED_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (REDUCED_MOTION) return;

    if (!window.matchMedia('(min-width: 769px)').matches) return;

    const stackContainer = document.getElementById('caseStudiesStack');
    if (!stackContainer) return;

    const cards = stackContainer.querySelectorAll('.case-study');
    if (cards.length < 2) return;

    let ticking = false;

    function updateStack() {
      const navOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 70;
      const stickyTop = navOffset + 24;

      for (let i = 0; i < cards.length - 1; i++) {
        const currentCard = cards[i];
        const nextCard = cards[i + 1];

        const nextRect = nextCard.getBoundingClientRect();
        const currentRect = currentCard.getBoundingClientRect();

        const distance = nextRect.top - stickyTop;
        const triggerDistance = currentRect.height;

        if (distance < triggerDistance && distance > 0) {
          const progress = 1 - (distance / triggerDistance);
          const scale = 1 - (progress * 0.05);
          const translateY = progress * -14;
          const brightness = 1 - (progress * 0.04);
          const opacity = 1 - (progress * 0.12);

          currentCard.style.transform = `scale(${scale.toFixed(3)}) translateY(${translateY.toFixed(1)}px)`;
          currentCard.style.filter = `brightness(${brightness.toFixed(3)})`;
          currentCard.style.opacity = `${opacity.toFixed(3)}`;
        } else if (distance <= 0) {
          currentCard.style.transform = 'scale(0.95) translateY(-14px)';
          currentCard.style.filter = 'brightness(0.96)';
          currentCard.style.opacity = '0.88';
        } else {
          currentCard.style.transform = '';
          currentCard.style.filter = '';
          currentCard.style.opacity = '';
        }
      }
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateStack();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    updateStack();
  }

  /* ===========================
     CARD 3D TILT & MOUSE-RESPONSIVE LIGHTING
  =========================== */
  function initCardTiltAndShine() {
    const REDUCED_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (REDUCED_MOTION) return;

    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const cards = document.querySelectorAll(
      '.stat-card, .case-study, .system-card, .stack-card, .research-card, .timeline-body, .hero-portrait-card, .contact-card'
    );

    cards.forEach(card => {
      if (!card.querySelector('.card-shine')) {
        const shine = document.createElement('div');
        shine.className = 'card-shine';
        shine.setAttribute('aria-hidden', 'true');
        card.appendChild(shine);
      }

      if (!card.querySelector('.card-spotlight-beam')) {
        const beam = document.createElement('div');
        beam.className = 'card-spotlight-beam';
        beam.setAttribute('aria-hidden', 'true');
        card.appendChild(beam);
      }

      if (!hasFinePointer) return;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--card-x', `${x}px`);
        card.style.setProperty('--card-y', `${y}px`);
        card.style.setProperty('--beam-x', `${x}px`);
        card.style.setProperty('--beam-y', `${y}px`);

        if (card.style.opacity && parseFloat(card.style.opacity) < 0.95) return;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotX = (((y - centerY) / centerY) * -3.2).toFixed(2);
        const rotY = (((x - centerX) / centerX) * 3.2).toFixed(2);

        card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        if (card.closest('.case-studies-stack') && card.style.filter) return;
        card.style.transform = '';
      });
    });
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
    initAmbientParallax();
    initScrollProgress();
    initMagneticButtons();
    initStackedCards();
    initCardTiltAndShine();
    initScrollAnimations();
    loadPortfolioData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
