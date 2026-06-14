/* ============================================================
   PORTFOLIO — Dynamic content loader + interactions
   All content is driven by portfolio-data.json
   ============================================================ */

/* ===========================
   SKILL ICONS (SVG map)
=========================== */
const SKILL_ICONS = [
  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>`,
  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`
];

const CONTACT_ICONS = {
  email: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  linkedin: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
  github: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`
};

/* ===========================
   RENDER FUNCTIONS
=========================== */
function getTagClass(tag) {
  const aiTags = ['pytorch', 'tensorflow', 'scikit-learn', 'mlflow', 'langchain', 'langgraph', 'openai api', 'faiss', 'crewai', 'haystack', 'autogen', 'opencv', 'mediapipe', 'huggingface', 'roboflow', 'rag', 'ai practitioner', 'ai engineer', 'ai systems', 'applied ai'];
  const awsTags = ['aws', 'cloud', 'docker', 'kpcloud', 'postgresql', 'postgis', 'gis', 'mlops', 'deployment', 'serverless', 'fastapi', 'flask', 'ec2', 'lambda', 'ecs', 'fargate', 's3', 'rds', 'iam', 'server'];
  const t = tag.toLowerCase();
  if (aiTags.some(val => t.includes(val))) return 'tag-ai';
  if (awsTags.some(val => t.includes(val))) return 'tag-aws';
  return 'tag-default';
}

function renderHero(d) {
  const hero = d.hero;
  document.getElementById('heroBadge').textContent = hero.badge;
  document.getElementById('heroName').textContent = hero.name;
  document.getElementById('roleStatic').innerHTML = hero.roleStatic + ' ';
  document.getElementById('heroPhilosophy').textContent = hero.philosophy;
  const locEl = document.getElementById('heroLocation');
  locEl.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${hero.location}`;
  document.title = `${hero.name} — AI/ML Engineer`;
}

function renderAbout(d) {
  const a = d.about;
  document.getElementById('aboutLead').innerHTML = a.lead;

  const parasEl = document.getElementById('aboutParagraphs');
  parasEl.innerHTML = a.paragraphs.map(p => `<p>${p}</p>`).join('');

  const focusEl = document.getElementById('focusList');
  focusEl.innerHTML = a.focusItems.map(item => `
    <li><span class="list-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></span>${item}</li>`).join('');

  const lookEl = document.getElementById('lookingForList');
  lookEl.innerHTML = a.lookingFor.map(item => `
    <li><span class="list-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></span>${item}</li>`).join('');
}

function renderSkills(d) {
  const grid = document.getElementById('skillsGrid');
  grid.innerHTML = d.skills.map((s, i) => `
    <div class="skill-card">
      <div class="skill-icon">${SKILL_ICONS[i % SKILL_ICONS.length]}</div>
      <h3>${s.title}</h3>
      <p>${s.description}</p>
      <div class="skill-tags">${s.tags.map(t => `<span class="${getTagClass(t)}">${t}</span>`).join('')}</div>
    </div>`).join('');
}

function renderGrowth(d) {
  const tl = document.getElementById('timelineList');
  tl.innerHTML = d.timeline.map(item => `
    <div class="timeline-item ${item.active ? 'active' : ''}">
      <div class="timeline-marker"></div>
      <div class="timeline-content">
        <div class="timeline-date">${item.date}</div>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <div class="timeline-tags">${item.tags.map(t => `<span class="${getTagClass(t)}">${t}</span>`).join('')}</div>
      </div>
    </div>`).join('');

  const exploreEl = document.getElementById('exploreList');
  exploreEl.innerHTML = d.exploringBars.map(b => `
    <div class="explore-item">
      <div class="explore-bar">
        <span>${b.label}</span>
        <div class="bar-track"><div class="bar-fill" style="width: ${b.value}%"></div></div>
      </div>
    </div>`).join('');

  const recEl = document.getElementById('recognitionList');
  recEl.innerHTML = d.recognition.map(r => `
    <div class="recognition-item">
      <span class="rec-icon">${r.icon}</span>
      <div>
        <strong>${r.title}</strong>
        <span>${r.sub}</span>
      </div>
    </div>`).join('');
}

function renderApproach(d) {
  const grid = document.getElementById('approachGrid');
  if (!grid) return;
  grid.innerHTML = d.approach.map(a => `
    <div class="approach-card">
      <div class="approach-number">${a.number}</div>
      <h3>${a.title}</h3>
      <p>${a.description}</p>
    </div>`).join('');
}

function renderContact(d) {
  const c = d.contact;
  const layout = document.getElementById('contactLayout');
  layout.innerHTML = `
    <div class="contact-card">
      <a href="mailto:${c.email}" class="contact-link">
        <div class="contact-icon">${CONTACT_ICONS.email}</div>
        <div>
          <div class="contact-label">Email</div>
          <div class="contact-value">${c.email}</div>
        </div>
        <div class="contact-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></div>
      </a>
    </div>
    <div class="contact-card">
      <a href="https://linkedin.com/in/${c.linkedin}" target="_blank" rel="noopener noreferrer" class="contact-link">
        <div class="contact-icon">${CONTACT_ICONS.linkedin}</div>
        <div>
          <div class="contact-label">LinkedIn</div>
          <div class="contact-value">${c.linkedin}</div>
        </div>
        <div class="contact-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></div>
      </a>
    </div>
    <div class="contact-card">
      <a href="https://github.com/${c.github}" target="_blank" rel="noopener noreferrer" class="contact-link">
        <div class="contact-icon">${CONTACT_ICONS.github}</div>
        <div>
          <div class="contact-label">GitHub</div>
          <div class="contact-value">${c.github}</div>
        </div>
        <div class="contact-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></div>
      </a>
    </div>`;

  document.getElementById('contactFooterNote').textContent = c.footerNote;

  const footerCopyEl = document.getElementById('footerCopy');
  if (footerCopyEl && c.footerCopy) footerCopyEl.textContent = c.footerCopy;
}

/* ===========================
   INIT — load data & render
=========================== */
async function loadPortfolio() {
  try {
    const res = await fetch('portfolio-data.json?v=' + Date.now());
    const data = await res.json();

    renderHero(data);
    renderAbout(data);
    renderSkills(data);
    renderGrowth(data);
    renderApproach(data);
    renderContact(data);

    // Start typing after data loaded
    startTyping(data.hero.typingPhrases);

    // Attach scroll reveals after render
    attachReveal();
    attachBarObserver();

  } catch (err) {
    console.error('Failed to load portfolio data:', err);
  }
}

/* ===========================
   NAVIGATION — scroll effect
=========================== */
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

/* ===========================
   MOBILE NAV TOGGLE
=========================== */
const navToggle = document.getElementById('navToggle');
const navLinksEl = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  navLinksEl.classList.toggle('open');
});

navLinksEl.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinksEl.classList.remove('open'));
});

/* ===========================
   TYPING EFFECT
=========================== */
const typedEl = document.getElementById('typedText');
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function startTyping(phrases) {
  if (!typedEl || !Array.isArray(phrases) || phrases.length === 0) return;

  // Honor reduced-motion users: show the first phrase statically.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    typedEl.textContent = phrases[0];
    return;
  }

  function type() {
    const current = phrases[phraseIndex];
    if (isDeleting) {
      typedEl.textContent = current.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typedEl.textContent = current.substring(0, charIndex + 1);
      charIndex++;
    }
    let speed = isDeleting ? 60 : 100;
    if (!isDeleting && charIndex === current.length) {
      speed = 1800;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      speed = 400;
    }
    setTimeout(type, speed);
  }
  type();
}

/* ===========================
   PARTICLE CANVAS
   - Pauses when the hero scrolls offscreen
   - Skips entirely if the user prefers reduced motion
=========================== */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const REDUCED_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let particles = [];
let rafId = null;
let heroVisible = true;
const PARTICLE_COUNT = 60;

function resizeCanvas() {
  if (!canvas) return;
  // Use devicePixelRatio so the canvas stays crisp on hi-DPI displays
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;
  canvas.width = Math.max(1, Math.floor(w * dpr));
  canvas.height = Math.max(1, Math.floor(h * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

class Particle {
  constructor() { this.reset(); }
  reset() {
    const w = canvas.offsetWidth || 1;
    const h = canvas.offsetHeight || 1;
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.size = Math.random() * 1.5 + 0.4;
    this.speedX = (Math.random() - 0.5) * 0.35;
    this.speedY = (Math.random() - 0.5) * 0.35;
    this.opacity = Math.random() * 0.4 + 0.05;
  }
  update() {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > w) this.speedX *= -1;
    if (this.y < 0 || this.y > h) this.speedY *= -1;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 0, 0, ${this.opacity * 0.25})`;
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const alpha = (1 - dist / 120) * 0.12;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.25})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  rafId = requestAnimationFrame(animateParticles);
}

function startParticles() {
  if (rafId != null) return;
  rafId = requestAnimationFrame(animateParticles);
}

function stopParticles() {
  if (rafId != null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

if (canvas && ctx && !REDUCED_MOTION) {
  resizeCanvas();
  initParticles();
  startParticles();

  // Pause while the hero is offscreen so we don't waste CPU/battery
  const heroEl = document.getElementById('hero');
  if (heroEl && 'IntersectionObserver' in window) {
    const heroObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        heroVisible = e.isIntersecting;
        if (heroVisible && !document.hidden) startParticles();
        else stopParticles();
      });
    }, { threshold: 0 });
    heroObs.observe(heroEl);
  }

  // Also stop when the tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopParticles();
    else if (heroVisible) startParticles();
  });

  // Debounced resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resizeCanvas(); initParticles(); }, 120);
  });
}

/* ===========================
   SCROLL REVEAL
=========================== */
function attachReveal() {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll(
    '.skill-card, .approach-card, .timeline-item, .growth-card, .contact-card'
  ).forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 4) * 0.07}s`;
    revealObserver.observe(el);
  });
}

/* ===========================
   PROGRESS BAR ANIMATION
=========================== */
function attachBarObserver() {
  const barObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.bar-fill').forEach(fill => {
            const target = fill.style.width;
            fill.style.width = '0%';
            requestAnimationFrame(() => requestAnimationFrame(() => {
              fill.style.width = target;
            }));
          });
          barObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  document.querySelectorAll('.growth-card').forEach(c => barObserver.observe(c));
}

/* ===========================
   ACTIVE NAV LINK ON SCROLL
=========================== */
const activeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
        const a = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  },
  { threshold: 0.4 }
);

document.querySelectorAll('section[id]').forEach(s => activeObserver.observe(s));

/* ===========================
   BOOT
=========================== */
loadPortfolio();
