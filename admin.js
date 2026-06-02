/* ============================================================
   ADMIN PANEL — Login + Full portfolio editor
   Reads/writes portfolio-data.json
   Credentials validated via SHA-256 hash (admin-config.js)
   ============================================================ */

/* ===========================
   SHA-256 helper (Web Crypto)
=========================== */
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256',
    new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

/* ===========================
   SESSION
=========================== */
const SESSION_KEY = 'rk_admin_session';

function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

function setSession() { sessionStorage.setItem(SESSION_KEY, '1'); }
function clearSession() { sessionStorage.removeItem(SESSION_KEY); }

/* ===========================
   BOOT
=========================== */
window.addEventListener('DOMContentLoaded', () => {
  if (isLoggedIn()) {
    showPanel();
  } else {
    showLogin();
  }
  bindLogin();
  bindLogout();
  bindPasswordToggle();
  bindTabs();
  bindSave();
});

/* ===========================
   LOGIN / LOGOUT
=========================== */
function showLogin() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('adminPanel').style.display = 'none';
}

function showPanel() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'grid';
  loadData().then(data => {
    window._portfolioData = data;
    renderTab('hero');
  });
}

function bindLogin() {
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;
    const errEl = document.getElementById('loginError');
    const btn = document.getElementById('loginBtn');

    btn.textContent = 'Signing in…';
    btn.disabled = true;

    const hash = await sha256(`${user}:${pass}`);
    if (hash === ADMIN_TOKEN_HASH) {
      setSession();
      showPanel();
    } else {
      errEl.textContent = 'Invalid username or password.';
      btn.textContent = 'Sign In';
      btn.disabled = false;
      document.getElementById('password').value = '';
    }
  });
}

function bindLogout() {
  document.getElementById('logoutBtn').addEventListener('click', () => {
    clearSession();
    showLogin();
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('loginError').textContent = '';
  });
}

function bindPasswordToggle() {
  const btn = document.getElementById('togglePw');
  const input = document.getElementById('password');
  btn.addEventListener('click', () => {
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.querySelector('.eye-show').style.display = isHidden ? 'none' : '';
    btn.querySelector('.eye-hide').style.display = isHidden ? '' : 'none';
  });
}

/* ===========================
   DATA LOAD/SAVE
=========================== */
async function loadData() {
  const res = await fetch('portfolio-data.json?v=' + Date.now());
  return res.json();
}

function bindSave() {
  document.getElementById('saveBtn').addEventListener('click', saveData);
}

async function saveData() {
  const btn = document.getElementById('saveBtn');
  const status = document.getElementById('saveStatus');
  btn.disabled = true;
  btn.textContent = 'Saving…';

  // Harvest current tab's form data into window._portfolioData
  harvestCurrentTab();

  try {
    const json = JSON.stringify(window._portfolioData, null, 2);

    // Try POST /save first (works when running via node server.js)
    let saved = false;
    try {
      const res = await fetch('/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: json
      });
      const result = await res.json();
      if (result.ok) {
        saved = true;
        status.textContent = '✓ Saved — portfolio updated';
        status.style.color = 'var(--green)';
      }
    } catch (_) {
      // server not running — fall back to download
    }

    if (!saved) {
      // Fallback: download the file for manual replacement
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'portfolio-data.json';
      a.click();
      URL.revokeObjectURL(url);
      status.textContent = '⬇ Downloaded — replace portfolio-data.json';
      status.style.color = '#f59e0b';
    }
  } catch (err) {
    status.textContent = '✗ Error: ' + err.message;
    status.style.color = 'var(--red)';
  }

  btn.disabled = false;
  btn.textContent = 'Save Changes';
  setTimeout(() => { status.textContent = ''; }, 6000);
}

/* ===========================
   TABS
=========================== */
let currentTab = 'hero';

function bindTabs() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      harvestCurrentTab();
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.dataset.tab;
      document.getElementById('topbarTitle').textContent =
        btn.textContent;
      renderTab(currentTab);
    });
  });
}

function renderTab(tab) {
  const d = window._portfolioData;
  const el = document.getElementById('adminContent');
  switch (tab) {
    case 'hero':       el.innerHTML = renderHeroForm(d); break;
    case 'about':      el.innerHTML = renderAboutForm(d); break;
    case 'skills':     el.innerHTML = renderSkillsForm(d); break;
    case 'timeline':   el.innerHTML = renderTimelineForm(d); break;
    case 'contribute': el.innerHTML = renderContributeForm(d); break;
    case 'philosophy': el.innerHTML = renderPhilosophyForm(d); break;
    case 'contact':    el.innerHTML = renderContactForm(d); break;
  }
  bindTagInputs();
  bindAddRemove();
  bindRanges();
}

/* harvest reads DOM back into window._portfolioData */
function harvestCurrentTab() {
  if (!window._portfolioData) return;
  switch (currentTab) {
    case 'hero':       harvestHero(); break;
    case 'about':      harvestAbout(); break;
    case 'skills':     harvestSkills(); break;
    case 'timeline':   harvestTimeline(); break;
    case 'contribute': harvestContribute(); break;
    case 'philosophy': harvestPhilosophy(); break;
    case 'contact':    harvestContact(); break;
  }
}

/* ===========================
   HERO TAB
=========================== */
function renderHeroForm(d) {
  const h = d.hero;
  return `
  <div class="form-section">
    <div class="form-section-title">Hero Content</div>
    <div class="form-row">
      <div class="form-field">
        <label>Name</label>
        <input id="f_hero_name" value="${esc(h.name)}" />
      </div>
      <div class="form-field">
        <label>Badge text</label>
        <input id="f_hero_badge" value="${esc(h.badge)}" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Role prefix (static part)</label>
        <input id="f_hero_roleStatic" value="${esc(h.roleStatic)}" />
      </div>
      <div class="form-field">
        <label>Location</label>
        <input id="f_hero_location" value="${esc(h.location)}" />
      </div>
    </div>
    <div class="form-row full">
      <div class="form-field">
        <label>Philosophy quote (one line)</label>
        <input id="f_hero_philosophy" value="${esc(h.philosophy)}" />
      </div>
    </div>
    <div class="form-row full">
      <div class="form-field">
        <label>Typing phrases (press Enter or comma to add)</label>
        ${tagsInputHtml('f_hero_phrases', h.typingPhrases)}
      </div>
    </div>
  </div>`;
}

function harvestHero() {
  const d = window._portfolioData;
  d.hero.name = val('f_hero_name');
  d.hero.badge = val('f_hero_badge');
  d.hero.roleStatic = val('f_hero_roleStatic');
  d.hero.location = val('f_hero_location');
  d.hero.philosophy = val('f_hero_philosophy');
  d.hero.typingPhrases = getTags('f_hero_phrases');
}

/* ===========================
   ABOUT TAB
=========================== */
function renderAboutForm(d) {
  const a = d.about;
  return `
  <div class="form-section">
    <div class="form-section-title">Lead Paragraph</div>
    <div class="form-row full">
      <div class="form-field">
        <label>Lead (HTML allowed for &lt;strong&gt;)</label>
        <textarea id="f_about_lead" rows="3">${esc(a.lead)}</textarea>
      </div>
    </div>
  </div>
  <div class="form-section">
    <div class="form-section-title">Body Paragraphs</div>
    <div class="list-editor" id="about_paras">
      ${a.paragraphs.map((p,i) => listTextareaRow(p, i)).join('')}
    </div>
    <button class="btn-add" data-list="about_paras" data-type="textarea">+ Add paragraph</button>
  </div>
  <div class="form-section">
    <div class="form-section-title">Highlights (cards)</div>
    <div class="card-group" id="about_highlights">
      ${a.highlights.map((h,i) => `
        <div class="editor-card" data-idx="${i}">
          <div class="editor-card-header">
            <span class="editor-card-title">Highlight ${i+1}</span>
            <button class="btn-remove" data-remove="about_highlights" data-idx="${i}">×</button>
          </div>
          <div class="form-row">
            <div class="form-field"><label>Icon (emoji)</label>
              <input class="hl_icon" value="${esc(h.icon)}" /></div>
            <div class="form-field"><label>Title</label>
              <input class="hl_title" value="${esc(h.title)}" /></div>
          </div>
          <div class="form-row full">
            <div class="form-field"><label>Sub text</label>
              <input class="hl_sub" value="${esc(h.sub)}" /></div>
          </div>
        </div>`).join('')}
    </div>
    <button class="btn-add" data-list="about_highlights" data-type="highlight">+ Add highlight</button>
  </div>
  <div class="form-section">
    <div class="form-section-title">Currently Focused On</div>
    <div class="list-editor" id="about_focus">
      ${a.focusItems.map((f,i) => listInputRow(f, i)).join('')}
    </div>
    <button class="btn-add" data-list="about_focus" data-type="input">+ Add item</button>
  </div>
  <div class="form-section">
    <div class="form-section-title">Looking For</div>
    <div class="list-editor" id="about_looking">
      ${a.lookingFor.map((f,i) => listInputRow(f, i)).join('')}
    </div>
    <button class="btn-add" data-list="about_looking" data-type="input">+ Add item</button>
  </div>`;
}

function harvestAbout() {
  const d = window._portfolioData;
  d.about.lead = document.getElementById('f_about_lead').value;
  d.about.paragraphs = listValues('about_paras', 'textarea');
  d.about.focusItems = listValues('about_focus', 'input');
  d.about.lookingFor = listValues('about_looking', 'input');
  d.about.highlights = [...document.querySelectorAll('#about_highlights .editor-card')].map(card => ({
    icon: card.querySelector('.hl_icon').value,
    title: card.querySelector('.hl_title').value,
    sub: card.querySelector('.hl_sub').value
  }));
}

/* ===========================
   SKILLS TAB
=========================== */
function renderSkillsForm(d) {
  return `
  <div class="form-section">
    <div class="form-section-title">Skill Cards</div>
    <div class="card-group" id="skills_list">
      ${d.skills.map((s,i) => `
        <div class="editor-card" data-idx="${i}">
          <div class="editor-card-header">
            <span class="editor-card-title">Card ${i+1}</span>
            <button class="btn-remove" data-remove="skills_list" data-idx="${i}">×</button>
          </div>
          <div class="form-row full">
            <div class="form-field"><label>Title</label>
              <input class="sk_title" value="${esc(s.title)}" /></div>
          </div>
          <div class="form-row full">
            <div class="form-field"><label>Description</label>
              <textarea class="sk_desc" rows="2">${esc(s.description)}</textarea></div>
          </div>
          <div class="form-row full">
            <div class="form-field"><label>Tags (Enter/comma to add)</label>
              ${tagsInputHtml('sk_tags_'+i, s.tags)}</div>
          </div>
        </div>`).join('')}
    </div>
    <button class="btn-add" data-list="skills_list" data-type="skill">+ Add skill card</button>
  </div>`;
}

function harvestSkills() {
  window._portfolioData.skills = [...document.querySelectorAll('#skills_list .editor-card')].map((card, i) => ({
    title: card.querySelector('.sk_title').value,
    description: card.querySelector('.sk_desc').value,
    tags: getTags('sk_tags_' + i)
  }));
}

/* ===========================
   TIMELINE TAB
=========================== */
function renderTimelineForm(d) {
  return `
  <div class="form-section">
    <div class="form-section-title">Timeline & Recognition</div>
    <div class="card-group" id="timeline_list">
      ${d.timeline.map((t,i) => `
        <div class="editor-card" data-idx="${i}">
          <div class="editor-card-header">
            <span class="editor-card-title">Entry ${i+1}</span>
            <button class="btn-remove" data-remove="timeline_list" data-idx="${i}">×</button>
          </div>
          <div class="form-row">
            <div class="form-field"><label>Date range</label>
              <input class="tl_date" value="${esc(t.date)}" /></div>
            <div class="form-field" style="flex:0 0 auto;justify-content:flex-end;">
              <label>Active (highlight)</label>
              <div class="toggle-row" style="margin-top:0.4rem">
                <input type="checkbox" class="toggle tl_active" ${t.active ? 'checked' : ''} />
                <label>Show as current</label>
              </div>
            </div>
          </div>
          <div class="form-row full">
            <div class="form-field"><label>Title</label>
              <input class="tl_title" value="${esc(t.title)}" /></div>
          </div>
          <div class="form-row full">
            <div class="form-field"><label>Description</label>
              <textarea class="tl_desc" rows="2">${esc(t.description)}</textarea></div>
          </div>
          <div class="form-row full">
            <div class="form-field"><label>Tags</label>
              ${tagsInputHtml('tl_tags_'+i, t.tags)}</div>
          </div>
        </div>`).join('')}
    </div>
    <button class="btn-add" data-list="timeline_list" data-type="timeline">+ Add entry</button>
  </div>
  <div class="form-section">
    <div class="form-section-title">Exploring — Progress Bars</div>
    <div class="card-group" id="bars_list">
      ${d.exploringBars.map((b,i) => `
        <div class="editor-card" data-idx="${i}">
          <div class="editor-card-header">
            <span class="editor-card-title">Bar ${i+1}</span>
            <button class="btn-remove" data-remove="bars_list" data-idx="${i}">×</button>
          </div>
          <div class="form-row">
            <div class="form-field"><label>Label</label>
              <input class="bar_label" value="${esc(b.label)}" /></div>
            <div class="form-field"><label>Value (${b.value}%)</label>
              <div class="range-row">
                <input type="range" class="bar_val" min="5" max="95" value="${b.value}" />
                <span class="range-value">${b.value}%</span>
              </div>
            </div>
          </div>
        </div>`).join('')}
    </div>
    <button class="btn-add" data-list="bars_list" data-type="bar">+ Add bar</button>
  </div>
  <div class="form-section">
    <div class="form-section-title">Recognition Items</div>
    <div class="card-group" id="rec_list">
      ${d.recognition.map((r,i) => `
        <div class="editor-card" data-idx="${i}">
          <div class="editor-card-header">
            <span class="editor-card-title">Item ${i+1}</span>
            <button class="btn-remove" data-remove="rec_list" data-idx="${i}">×</button>
          </div>
          <div class="form-row">
            <div class="form-field"><label>Icon (emoji)</label>
              <input class="rec_icon" value="${esc(r.icon)}" /></div>
            <div class="form-field"><label>Title</label>
              <input class="rec_title" value="${esc(r.title)}" /></div>
          </div>
          <div class="form-row full">
            <div class="form-field"><label>Sub text</label>
              <input class="rec_sub" value="${esc(r.sub)}" /></div>
          </div>
        </div>`).join('')}
    </div>
    <button class="btn-add" data-list="rec_list" data-type="recognition">+ Add recognition</button>
  </div>`;
}

function harvestTimeline() {
  const d = window._portfolioData;
  d.timeline = [...document.querySelectorAll('#timeline_list .editor-card')].map((card, i) => ({
    date: card.querySelector('.tl_date').value,
    title: card.querySelector('.tl_title').value,
    description: card.querySelector('.tl_desc').value,
    tags: getTags('tl_tags_' + i),
    active: card.querySelector('.tl_active').checked
  }));
  d.exploringBars = [...document.querySelectorAll('#bars_list .editor-card')].map(card => ({
    label: card.querySelector('.bar_label').value,
    value: parseInt(card.querySelector('.bar_val').value, 10)
  }));
  d.recognition = [...document.querySelectorAll('#rec_list .editor-card')].map(card => ({
    icon: card.querySelector('.rec_icon').value,
    title: card.querySelector('.rec_title').value,
    sub: card.querySelector('.rec_sub').value
  }));
}

/* ===========================
   CONTRIBUTE TAB
=========================== */
function renderContributeForm(d) {
  return `
  <div class="form-section">
    <div class="form-section-title">Contribution Cards</div>
    <div class="card-group" id="contrib_list">
      ${d.contributions.map((c,i) => `
        <div class="editor-card" data-idx="${i}">
          <div class="editor-card-header">
            <span class="editor-card-title">Card ${i+1}</span>
            <button class="btn-remove" data-remove="contrib_list" data-idx="${i}">×</button>
          </div>
          <div class="form-row">
            <div class="form-field"><label>Number label</label>
              <input class="ct_num" value="${esc(c.number)}" /></div>
            <div class="form-field"><label>Title</label>
              <input class="ct_title" value="${esc(c.title)}" /></div>
          </div>
          <div class="form-row full">
            <div class="form-field"><label>Description</label>
              <textarea class="ct_desc" rows="2">${esc(c.description)}</textarea></div>
          </div>
        </div>`).join('')}
    </div>
    <button class="btn-add" data-list="contrib_list" data-type="contribution">+ Add card</button>
  </div>`;
}

function harvestContribute() {
  window._portfolioData.contributions = [...document.querySelectorAll('#contrib_list .editor-card')].map(card => ({
    number: card.querySelector('.ct_num').value,
    title: card.querySelector('.ct_title').value,
    description: card.querySelector('.ct_desc').value
  }));
}

/* ===========================
   PHILOSOPHY TAB
=========================== */
function renderPhilosophyForm(d) {
  return `
  <div class="form-section">
    <div class="form-section-title">Philosophy Cards</div>
    <div class="card-group" id="phil_list">
      ${d.philosophy.map((p,i) => `
        <div class="editor-card" data-idx="${i}">
          <div class="editor-card-header">
            <span class="editor-card-title">Card ${i+1}</span>
            <button class="btn-remove" data-remove="phil_list" data-idx="${i}">×</button>
          </div>
          <div class="form-row">
            <div class="form-field"><label>Number glyph</label>
              <input class="ph_num" value="${esc(p.number)}" /></div>
            <div class="form-field"><label>Title</label>
              <input class="ph_title" value="${esc(p.title)}" /></div>
          </div>
          <div class="form-row full">
            <div class="form-field"><label>Description</label>
              <textarea class="ph_desc" rows="2">${esc(p.description)}</textarea></div>
          </div>
        </div>`).join('')}
    </div>
    <button class="btn-add" data-list="phil_list" data-type="philosophy">+ Add card</button>
  </div>`;
}

function harvestPhilosophy() {
  window._portfolioData.philosophy = [...document.querySelectorAll('#phil_list .editor-card')].map(card => ({
    number: card.querySelector('.ph_num').value,
    title: card.querySelector('.ph_title').value,
    description: card.querySelector('.ph_desc').value
  }));
}

/* ===========================
   CONTACT TAB
=========================== */
function renderContactForm(d) {
  const c = d.contact;
  return `
  <div class="form-section">
    <div class="form-section-title">Contact Details</div>
    <div class="form-row">
      <div class="form-field"><label>Email</label>
        <input id="f_email" value="${esc(c.email)}" /></div>
      <div class="form-field"><label>LinkedIn username</label>
        <input id="f_linkedin" value="${esc(c.linkedin)}" /></div>
    </div>
    <div class="form-row">
      <div class="form-field"><label>GitHub username</label>
        <input id="f_github" value="${esc(c.github)}" /></div>
      <div class="form-field"><label>Footer note</label>
        <input id="f_footernote" value="${esc(c.footerNote)}" /></div>
    </div>
    <div class="form-row full">
      <div class="form-field"><label>Footer copyright text</label>
        <input id="f_footercopy" value="${esc(c.footerCopy || '')}" /></div>
    </div>
  </div>`;
}

function harvestContact() {
  const d = window._portfolioData;
  d.contact.email = val('f_email');
  d.contact.linkedin = val('f_linkedin');
  d.contact.github = val('f_github');
  d.contact.footerNote = val('f_footernote');
  d.contact.footerCopy = val('f_footercopy');
}

/* ===========================
   TAGS INPUT COMPONENT
=========================== */
function tagsInputHtml(id, tags) {
  const chips = (tags || []).map(t =>
    `<span class="tag-chip" data-tag="${esc(t)}">${esc(t)}<button type="button" aria-label="Remove">×</button></span>`
  ).join('');
  return `<div class="tags-input-wrap" id="${id}_wrap" data-id="${id}">
    ${chips}
    <input type="text" id="${id}_input" placeholder="Type & press Enter" autocomplete="off" />
  </div>
  <input type="hidden" id="${id}_hidden" value="${esc(JSON.stringify(tags || []))}" />`;
}

function getTags(id) {
  try {
    const hidden = document.getElementById(id + '_hidden');
    if (!hidden) return [];
    // Re-read from live chips in case they changed
    const wrap = document.getElementById(id + '_wrap');
    if (!wrap) return JSON.parse(hidden.value);
    return [...wrap.querySelectorAll('.tag-chip')].map(c => c.dataset.tag);
  } catch { return []; }
}

function bindTagInputs() {
  document.querySelectorAll('.tags-input-wrap').forEach(wrap => {
    const input = wrap.querySelector('input[type="text"]');
    if (!input) return;

    function addTag(val) {
      const v = val.trim();
      if (!v) return;
      const chip = document.createElement('span');
      chip.className = 'tag-chip';
      chip.dataset.tag = v;
      chip.innerHTML = `${esc(v)}<button type="button" aria-label="Remove">×</button>`;
      chip.querySelector('button').addEventListener('click', () => chip.remove());
      wrap.insertBefore(chip, input);
      input.value = '';
    }

    // bind existing remove buttons
    wrap.querySelectorAll('.tag-chip button').forEach(btn => {
      btn.addEventListener('click', () => btn.closest('.tag-chip').remove());
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addTag(input.value.replace(/,$/, ''));
      } else if (e.key === 'Backspace' && !input.value) {
        const chips = wrap.querySelectorAll('.tag-chip');
        if (chips.length) chips[chips.length - 1].remove();
      }
    });

    wrap.addEventListener('click', () => input.focus());
  });
}

/* ===========================
   ADD / REMOVE ITEMS
=========================== */
function bindAddRemove() {
  // Remove buttons
  document.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.editor-card, .list-item-row').remove();
    });
  });

  // Add buttons
  document.querySelectorAll('.btn-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const listId = btn.dataset.list;
      const type = btn.dataset.type;
      const container = document.getElementById(listId);
      const idx = container.children.length;

      let html = '';
      switch (type) {
        case 'textarea': html = listTextareaRow('', idx); break;
        case 'input':    html = listInputRow('', idx); break;
        case 'highlight':
          html = `<div class="editor-card" data-idx="${idx}">
            <div class="editor-card-header">
              <span class="editor-card-title">Highlight ${idx+1}</span>
              <button class="btn-remove" data-remove="${listId}" data-idx="${idx}">×</button>
            </div>
            <div class="form-row">
              <div class="form-field"><label>Icon</label><input class="hl_icon" value="📌" /></div>
              <div class="form-field"><label>Title</label><input class="hl_title" value="" /></div>
            </div>
            <div class="form-row full">
              <div class="form-field"><label>Sub text</label><input class="hl_sub" value="" /></div>
            </div>
          </div>`; break;
        case 'skill':
          html = `<div class="editor-card" data-idx="${idx}">
            <div class="editor-card-header">
              <span class="editor-card-title">Card ${idx+1}</span>
              <button class="btn-remove" data-remove="${listId}" data-idx="${idx}">×</button>
            </div>
            <div class="form-row full"><div class="form-field"><label>Title</label><input class="sk_title" value="" /></div></div>
            <div class="form-row full"><div class="form-field"><label>Description</label><textarea class="sk_desc" rows="2"></textarea></div></div>
            <div class="form-row full"><div class="form-field"><label>Tags</label>${tagsInputHtml('sk_tags_'+idx,[])}</div></div>
          </div>`; break;
        case 'timeline':
          html = `<div class="editor-card" data-idx="${idx}">
            <div class="editor-card-header">
              <span class="editor-card-title">Entry ${idx+1}</span>
              <button class="btn-remove" data-remove="${listId}" data-idx="${idx}">×</button>
            </div>
            <div class="form-row">
              <div class="form-field"><label>Date</label><input class="tl_date" value="" /></div>
              <div class="form-field"><label>Active</label><div class="toggle-row" style="margin-top:0.4rem"><input type="checkbox" class="toggle tl_active" /><label>Current</label></div></div>
            </div>
            <div class="form-row full"><div class="form-field"><label>Title</label><input class="tl_title" value="" /></div></div>
            <div class="form-row full"><div class="form-field"><label>Description</label><textarea class="tl_desc" rows="2"></textarea></div></div>
            <div class="form-row full"><div class="form-field"><label>Tags</label>${tagsInputHtml('tl_tags_'+idx,[])}</div></div>
          </div>`; break;
        case 'bar':
          html = `<div class="editor-card" data-idx="${idx}">
            <div class="editor-card-header">
              <span class="editor-card-title">Bar ${idx+1}</span>
              <button class="btn-remove" data-remove="${listId}" data-idx="${idx}">×</button>
            </div>
            <div class="form-row">
              <div class="form-field"><label>Label</label><input class="bar_label" value="" /></div>
              <div class="form-field"><label>Value</label><div class="range-row"><input type="range" class="bar_val" min="5" max="95" value="50" /><span class="range-value">50%</span></div></div>
            </div>
          </div>`; break;
        case 'recognition':
          html = `<div class="editor-card" data-idx="${idx}">
            <div class="editor-card-header">
              <span class="editor-card-title">Item ${idx+1}</span>
              <button class="btn-remove" data-remove="${listId}" data-idx="${idx}">×</button>
            </div>
            <div class="form-row">
              <div class="form-field"><label>Icon</label><input class="rec_icon" value="🏆" /></div>
              <div class="form-field"><label>Title</label><input class="rec_title" value="" /></div>
            </div>
            <div class="form-row full"><div class="form-field"><label>Sub text</label><input class="rec_sub" value="" /></div></div>
          </div>`; break;
        case 'contribution':
          html = `<div class="editor-card" data-idx="${idx}">
            <div class="editor-card-header">
              <span class="editor-card-title">Card ${idx+1}</span>
              <button class="btn-remove" data-remove="${listId}" data-idx="${idx}">×</button>
            </div>
            <div class="form-row">
              <div class="form-field"><label>Number</label><input class="ct_num" value="0${idx+1}" /></div>
              <div class="form-field"><label>Title</label><input class="ct_title" value="" /></div>
            </div>
            <div class="form-row full"><div class="form-field"><label>Description</label><textarea class="ct_desc" rows="2"></textarea></div></div>
          </div>`; break;
        case 'philosophy':
          html = `<div class="editor-card" data-idx="${idx}">
            <div class="editor-card-header">
              <span class="editor-card-title">Card ${idx+1}</span>
              <button class="btn-remove" data-remove="${listId}" data-idx="${idx}">×</button>
            </div>
            <div class="form-row">
              <div class="form-field"><label>Number</label><input class="ph_num" value="0${idx+1}" /></div>
              <div class="form-field"><label>Title</label><input class="ph_title" value="" /></div>
            </div>
            <div class="form-row full"><div class="form-field"><label>Description</label><textarea class="ph_desc" rows="2"></textarea></div></div>
          </div>`; break;
      }

      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const node = tmp.firstElementChild;
      container.appendChild(node);
      // bind new remove buttons and tag inputs
      node.querySelectorAll('[data-remove]').forEach(b => {
        b.addEventListener('click', () => b.closest('.editor-card,.list-item-row').remove());
      });
      bindTagInputs();
      bindRanges();
    });
  });
}

/* ===========================
   RANGE INPUTS
=========================== */
function bindRanges() {
  document.querySelectorAll('input[type="range"]').forEach(r => {
    const display = r.closest('.range-row')?.querySelector('.range-value');
    if (display) {
      r.addEventListener('input', () => { display.textContent = r.value + '%'; });
    }
  });
}

/* ===========================
   UTILITIES
=========================== */
function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function listValues(containerId, tag) {
  return [...document.querySelectorAll(`#${containerId} ${tag}`)].map(el => el.value).filter(Boolean);
}

function listTextareaRow(value, idx) {
  return `<div class="list-item-row">
    <textarea rows="2">${esc(value)}</textarea>
    <button type="button" class="btn-remove">×</button>
  </div>`;
}

function listInputRow(value, idx) {
  return `<div class="list-item-row">
    <input type="text" value="${esc(value)}" />
    <button type="button" class="btn-remove">×</button>
  </div>`;
}
