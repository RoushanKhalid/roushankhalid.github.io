/* ============================================================
   ROUSHAN KHALID — SYSTEM ARCHITECTURE SCRIPT & MOTION DYNAMICS
   Interactive Experience, Ambient Lighting, Constellation Canvas,
   Stacked-Card Scrolling, 3D Card Tilt, Scroll Progress & Data Sync
   ============================================================ */

(function () {
  'use strict';

  const REDUCED_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HAS_FINE_POINTER = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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
     TYPEWRITER TICKER
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

    if (REDUCED_MOTION) {
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

      let speed = isDeleting ? 32 : 68;

      if (!isDeleting && charIndex === current.length) {
        speed = 2300;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % activePhrases.length;
        speed = 360;
      }

      typingTimeout = setTimeout(typeTick, speed);
    }

    typeTick();
  }

  /* ===========================
     NAVIGATION SCROLLSPY & MOBILE MENU
  =========================== */
  function initNavigation() {
    const nav = document.getElementById('nav');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const navToggle = document.getElementById('navToggle');
    const navLinksContainer = document.getElementById('navLinks');

    // Sticky nav backdrop blur state
    window.addEventListener('scroll', () => {
      if (nav) {
        nav.classList.toggle('scrolled', window.scrollY > 20);
      }
    }, { passive: true });

    // ScrollSpy
    function highlightNav() {
      const scrollY = window.pageYOffset;
      const navOffset = 150;

      sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - navOffset;
        const sectionId = current.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
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
     GLOBAL CURSOR AMBIENT SPOTLIGHT (Lerped Damping)
  =========================== */
  function initGlobalCursorGlow() {
    if (REDUCED_MOTION || !HAS_FINE_POINTER) return;

    const glowEl = document.getElementById('globalCursorGlow');
    if (!glowEl) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let isMoving = false;
    let rafId = null;

    document.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isMoving) {
        glowEl.classList.add('is-active');
        isMoving = true;
        if (!rafId) rafId = requestAnimationFrame(renderGlow);
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      glowEl.classList.remove('is-active');
      isMoving = false;
    }, { passive: true });

    function renderGlow() {
      // Linear interpolation (lerp) for silky smooth inertia
      currentX += (targetX - currentX) * 0.085;
      currentY += (targetY - currentY) * 0.085;

      document.documentElement.style.setProperty('--cursor-x', `${currentX.toFixed(1)}px`);
      document.documentElement.style.setProperty('--cursor-y', `${currentY.toFixed(1)}px`);

      if (isMoving || Math.abs(targetX - currentX) > 0.5 || Math.abs(targetY - currentY) > 0.5) {
        rafId = requestAnimationFrame(renderGlow);
      } else {
        rafId = null;
      }
    }
  }

  /* ===========================
     HERO SCROLL INDICATOR CONTROLLER
  =========================== */
  function initHeroScrollIndicator() {
    const indicator = document.getElementById('heroScrollIndicator');
    if (!indicator) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 45) {
        indicator.classList.add('is-hidden');
      } else {
        indicator.classList.remove('is-hidden');
      }
    }, { passive: true });
  }

  /* ===========================
     DOMAIN MASTERY BARS & ROLLING COUNTERS
  =========================== */
  function initExploreBars() {
    const container = document.getElementById('exploreBarsContainer');
    if (!container) return;

    const items = container.querySelectorAll('.explore-bar-item');
    if (!items.length) return;

    if (REDUCED_MOTION) {
      items.forEach(item => {
        const bar = item.querySelector('.bar-fill');
        if (bar) bar.style.width = `${bar.getAttribute('data-width') || 80}%`;
      });
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          items.forEach((item, idx) => {
            const bar = item.querySelector('.bar-fill');
            const valEl = item.querySelector('.bar-val');
            if (!bar) return;
            const targetW = parseInt(bar.getAttribute('data-width') || '80', 10);

            setTimeout(() => {
              bar.style.width = `${targetW}%`;
              // Numeric rolling count up
              if (valEl) {
                const duration = 1200;
                const startTime = performance.now();
                function updateCount(now) {
                  const elapsed = now - startTime;
                  const progress = Math.min(elapsed / duration, 1);
                  const easeProgress = 1 - Math.pow(1 - progress, 2);
                  const currentVal = Math.floor(easeProgress * targetW);
                  valEl.textContent = `${currentVal}%`;
                  if (progress < 1) {
                    requestAnimationFrame(updateCount);
                  } else {
                    valEl.textContent = `${targetW}%`;
                  }
                }
                requestAnimationFrame(updateCount);
              }
            }, idx * 140);
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    observer.observe(container);
  }

  /* ===========================
     BENCHMARK NUMERIC ROLLING COUNTERS
  =========================== */
  function initBenchmarkCounters() {
    if (REDUCED_MOTION) return;

    const statsGrid = document.querySelector('.stats-grid');
    if (!statsGrid) return;

    const statCards = statsGrid.querySelectorAll('.stat-card');

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          statCards.forEach((card, idx) => {
            const valEl = card.querySelector('.stat-value');
            if (!valEl) return;
            const text = valEl.textContent.trim();

            if (text === '0.987') {
              valEl.textContent = '0.000';
              setTimeout(() => {
                const duration = 1400;
                const startTime = performance.now();
                function updateDecimal(now) {
                  const elapsed = now - startTime;
                  const p = Math.min(elapsed / duration, 1);
                  const ep = 1 - Math.pow(1 - p, 3);
                  const current = (ep * 0.987).toFixed(3);
                  valEl.textContent = current;
                  if (p < 1) requestAnimationFrame(updateDecimal);
                  else valEl.textContent = '0.987';
                }
                requestAnimationFrame(updateDecimal);
              }, idx * 100);
            } else if (text === '350+') {
              valEl.textContent = '0+';
              setTimeout(() => {
                const duration = 1300;
                const startTime = performance.now();
                function updatePlus(now) {
                  const elapsed = now - startTime;
                  const p = Math.min(elapsed / duration, 1);
                  const ep = 1 - Math.pow(1 - p, 3);
                  const current = Math.floor(ep * 350);
                  valEl.textContent = `${current}+`;
                  if (p < 1) requestAnimationFrame(updatePlus);
                  else valEl.textContent = '350+';
                }
                requestAnimationFrame(updatePlus);
              }, idx * 100);
            }
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(statsGrid);
  }

  /* ===========================
     TIMELINE VERTICAL TRACK PROGRESS
  =========================== */
  function initTimelineTrack() {
    const timeline = document.getElementById('timelineList');
    const glow = document.getElementById('timelineTrackGlow');
    if (!timeline || !glow || REDUCED_MOTION) return;

    let ticking = false;

    function updateTrack() {
      const rect = timeline.getBoundingClientRect();
      const windowH = window.innerHeight;

      // Check how far into the timeline user has scrolled
      const start = windowH * 0.75;
      const progress = (start - rect.top) / rect.height;
      const clamped = Math.min(100, Math.max(0, progress * 100));

      glow.style.height = `${clamped.toFixed(1)}%`;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateTrack();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    updateTrack();
  }

  /* ===========================
     GLOBAL CURSOR AMBIENT SPOTLIGHT (Lerped Damping)
  =========================== */
  function initGlobalCursorGlow() {
    if (REDUCED_MOTION || !HAS_FINE_POINTER) return;

    const glowEl = document.getElementById('globalCursorGlow');
    if (!glowEl) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let isMoving = false;
    let rafId = null;

    document.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isMoving) {
        glowEl.classList.add('is-active');
        isMoving = true;
        if (!rafId) rafId = requestAnimationFrame(renderGlow);
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      glowEl.classList.remove('is-active');
      isMoving = false;
    }, { passive: true });

    function renderGlow() {
      // Linear interpolation (lerp) for silky smooth inertia
      currentX += (targetX - currentX) * 0.085;
      currentY += (targetY - currentY) * 0.085;

      document.documentElement.style.setProperty('--cursor-x', `${currentX.toFixed(1)}px`);
      document.documentElement.style.setProperty('--cursor-y', `${currentY.toFixed(1)}px`);

      if (isMoving || Math.abs(targetX - currentX) > 0.5 || Math.abs(targetY - currentY) > 0.5) {
        rafId = requestAnimationFrame(renderGlow);
      } else {
        rafId = null;
      }
    }
  }

  /* ===========================
     HERO SCROLL INDICATOR CONTROLLER
  =========================== */
  function initHeroScrollIndicator() {
    const indicator = document.getElementById('heroScrollIndicator');
    if (!indicator) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 45) {
        indicator.classList.add('is-hidden');
      } else {
        indicator.classList.remove('is-hidden');
      }
    }, { passive: true });
  }

  /* ===========================
     DOMAIN MASTERY BARS & ROLLING COUNTERS
  =========================== */
  function initExploreBars() {
    const container = document.getElementById('exploreBarsContainer');
    if (!container) return;

    const items = container.querySelectorAll('.explore-bar-item');
    if (!items.length) return;

    if (REDUCED_MOTION) {
      items.forEach(item => {
        const bar = item.querySelector('.bar-fill');
        if (bar) bar.style.width = `${bar.getAttribute('data-width') || 80}%`;
      });
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          items.forEach((item, idx) => {
            const bar = item.querySelector('.bar-fill');
            const valEl = item.querySelector('.bar-val');
            if (!bar) return;
            const targetW = parseInt(bar.getAttribute('data-width') || '80', 10);

            setTimeout(() => {
              bar.style.width = `${targetW}%`;
              // Numeric rolling count up
              if (valEl) {
                const duration = 1200;
                const startTime = performance.now();
                function updateCount(now) {
                  const elapsed = now - startTime;
                  const progress = Math.min(elapsed / duration, 1);
                  const easeProgress = 1 - Math.pow(1 - progress, 2);
                  const currentVal = Math.floor(easeProgress * targetW);
                  valEl.textContent = `${currentVal}%`;
                  if (progress < 1) {
                    requestAnimationFrame(updateCount);
                  } else {
                    valEl.textContent = `${targetW}%`;
                  }
                }
                requestAnimationFrame(updateCount);
              }
            }, idx * 140);
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    observer.observe(container);
  }

  /* ===========================
     BENCHMARK NUMERIC ROLLING COUNTERS
  =========================== */
  function initBenchmarkCounters() {
    if (REDUCED_MOTION) return;

    const statsGrid = document.querySelector('.stats-grid');
    if (!statsGrid) return;

    const statCards = statsGrid.querySelectorAll('.stat-card');

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          statCards.forEach((card, idx) => {
            const valEl = card.querySelector('.stat-value');
            if (!valEl) return;
            const text = valEl.textContent.trim();

            if (text === '0.987') {
              valEl.textContent = '0.000';
              setTimeout(() => {
                const duration = 1400;
                const startTime = performance.now();
                function updateDecimal(now) {
                  const elapsed = now - startTime;
                  const p = Math.min(elapsed / duration, 1);
                  const ep = 1 - Math.pow(1 - p, 3);
                  const current = (ep * 0.987).toFixed(3);
                  valEl.textContent = current;
                  if (p < 1) requestAnimationFrame(updateDecimal);
                  else valEl.textContent = '0.987';
                }
                requestAnimationFrame(updateDecimal);
              }, idx * 100);
            } else if (text === '350+') {
              valEl.textContent = '0+';
              setTimeout(() => {
                const duration = 1300;
                const startTime = performance.now();
                function updatePlus(now) {
                  const elapsed = now - startTime;
                  const p = Math.min(elapsed / duration, 1);
                  const ep = 1 - Math.pow(1 - p, 3);
                  const current = Math.floor(ep * 350);
                  valEl.textContent = `${current}+`;
                  if (p < 1) requestAnimationFrame(updatePlus);
                  else valEl.textContent = '350+';
                }
                requestAnimationFrame(updatePlus);
              }, idx * 100);
            }
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(statsGrid);
  }

  /* ===========================
     TIMELINE VERTICAL TRACK PROGRESS
  =========================== */
  function initTimelineTrack() {
    const timeline = document.getElementById('timelineList');
    const glow = document.getElementById('timelineTrackGlow');
    if (!timeline || !glow || REDUCED_MOTION) return;

    let ticking = false;

    function updateTrack() {
      const rect = timeline.getBoundingClientRect();
      const windowH = window.innerHeight;

      // Check how far into the timeline user has scrolled
      const start = windowH * 0.75;
      const progress = (start - rect.top) / rect.height;
      const clamped = Math.min(100, Math.max(0, progress * 100));

      glow.style.height = `${clamped.toFixed(1)}%`;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateTrack();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    updateTrack();
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
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
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
     REFINED CONSTELLATION PARTICLES (Depth & Velocity Damping)
  =========================== */
  function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas || typeof canvas.getContext !== 'function') return;

    const ctx = canvas.getContext('2d');
    if (REDUCED_MOTION) return;

    let particles = [];
    let rafId = null;
    let heroVisible = true;
    const isMobile = window.innerWidth <= 768;
    const PARTICLE_COUNT = isMobile ? 26 : 56;

    const mouse = { x: -9999, y: -9999, radius: 155 };
    const heroEl = document.getElementById('hero');

    if (heroEl && HAS_FINE_POINTER) {
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
        this.depth = Math.random(); // 0 (far) to 1 (near)
        this.size = this.depth * 1.8 + 1.0;
        this.speedX = (Math.random() - 0.5) * (0.35 + this.depth * 0.3);
        this.speedY = (Math.random() - 0.5) * (0.35 + this.depth * 0.3);
        this.opacity = this.depth * 0.45 + 0.25;
        this.color = Math.random() > 0.4 ? '29, 78, 216' : (Math.random() > 0.5 ? '16, 185, 129' : '96, 165, 250');
      }
      update() {
        const w = canvas.offsetWidth || 1;
        const h = canvas.offsetHeight || 1;
        this.x += this.speedX;
        this.y += this.speedY;

        // Subtle elastic mouse repulsion
        if (mouse.x > 0 && mouse.y > 0) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius && dist > 5) {
            const force = (1 - dist / mouse.radius) * 0.45;
            this.x += (dx / dist) * force * (1 + this.depth);
            this.y += (dy / dist) * force * (1 + this.depth);
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
      const connectionDist = isMobile ? 100 : 135;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.28 * Math.min(particles[i].opacity, particles[j].opacity);
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
            const mAlpha = (1 - mDist / 145) * 0.40;
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
     SCROLL PROGRESS BAR
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
     MAGNETIC BUTTONS (Spring Physics)
  =========================== */
  function initMagneticButtons() {
    if (REDUCED_MOTION || !HAS_FINE_POINTER) return;

    const magneticTargets = document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta-btn');
    magneticTargets.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const moveX = (x * 0.18).toFixed(2);
        const moveY = (y * 0.18).toFixed(2);
        btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ===========================
     CONTINUOUS AMBIENT PARALLAX
  =========================== */
  function initCardTiltAndShine() {
    if (REDUCED_MOTION) return;

    const cards = document.querySelectorAll(
      '.stat-card, .case-study, .system-card, .stack-card, .research-card, .timeline-body, .hero-portrait-card, .contact-card, .matrix-card, .about-lead-card'
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

      if (!HAS_FINE_POINTER) return;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--card-x', `${x}px`);
        card.style.setProperty('--card-y', `${y}px`);
        card.style.setProperty('--beam-x', `${x}px`);
        card.style.setProperty('--beam-y', `${y}px`);

        // If card is scaled down in stack, prevent extreme tilt
        if (card.style.opacity && parseFloat(card.style.opacity) < 0.95) return;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotX = (((y - centerY) / centerY) * -3.4).toFixed(2);
        const rotY = (((x - centerX) / centerX) * 3.4).toFixed(2);

        card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-5px)`;
      });

      card.addEventListener('mouseleave', () => {
        if (card.closest('.case-studies-stack') && card.style.filter) return;
        card.style.transform = '';
      });
    });
  }

  /* ===========================
     SCROLL REVEAL MOTION
  =========================== */
  function initScrollAnimations() {
    const cards = document.querySelectorAll(
      '.stat-card, .case-study, .system-card, .stack-card, .research-card, .timeline-body, .distinction-row, .contact-card, .about-lead-card, .matrix-card'
    );

    if (REDUCED_MOTION) {
      cards.forEach(el => el.classList.add('is-revealed'));
      return;
    }

    cards.forEach(el => {
      el.classList.add('reveal-card');
      if (el.parentElement) {
        const siblings = Array.from(el.parentElement.children);
        const index = siblings.indexOf(el);
        if (index >= 0) {
          el.style.setProperty('--stagger', Math.min(index, 6));
        }
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
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    cards.forEach(el => observer.observe(el));
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

      // Update About Section Data
      if (data.about) {
        const leadEl = document.getElementById('aboutLead');
        if (leadEl && data.about.lead) leadEl.innerHTML = data.about.lead;

        const parasEl = document.getElementById('aboutParagraphs');
        if (parasEl && Array.isArray(data.about.paragraphs) && data.about.paragraphs.length > 0) {
          parasEl.innerHTML = data.about.paragraphs.map(p => `<p>${p}</p>`).join('');
        }

        const focusEl = document.getElementById('focusList');
        if (focusEl && Array.isArray(data.about.focusItems)) {
          focusEl.innerHTML = data.about.focusItems.map(f => `<li><span class="matrix-dot"></span><span>${f}</span></li>`).join('');
        }

        const lookingEl = document.getElementById('lookingForList');
        if (lookingEl && Array.isArray(data.about.lookingFor)) {
          lookingEl.innerHTML = data.about.lookingFor.map(item => `<span>${item}</span>`).join('');
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
    initGlobalCursorGlow();
    initHeroScrollIndicator();
    initProjectFilters();
    initCopyButtons();
    initBackToTop();
    initParticles();
    initScrollProgress();
    initMagneticButtons();
    initCardTiltAndShine();
    initExploreBars();
    initBenchmarkCounters();
    initTimelineTrack();
    initExploreBars();
    initTimelineTrack();
    initScrollAnimations();
    loadPortfolioData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
