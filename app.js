const state = {
  user: null,
  role: 'employee',
  analysisResult: null,
  completedModules: new Set(['m1', 'm2']),
  notifications: [
    'New org alert: Q2 simulation starts Monday',
    'Module update: Identifying spoofed domains'
  ]
};

const data = {
  modules: [
    { id: 'm1', title: 'Phishing Basics', level: 'Beginner', duration: '15 min', category: 'Email Safety', progress: 100, quiz: { q: 'Which sign is suspicious?', a: ['Urgent payment request', 'Company newsletter', 'Known sender'], correct: 0 }, content: 'Learn core phishing traits, from sender spoofing to urgency cues.' },
    { id: 'm2', title: 'Link Inspection Deep Dive', level: 'Intermediate', duration: '20 min', category: 'Links', progress: 100, quiz: { q: 'Best first step before clicking?', a: ['Hover to inspect URL', 'Forward email', 'Ignore sender'], correct: 0 }, content: 'Practice checking destination URLs and spotting lookalike domains.' },
    { id: 'm3', title: 'Spoofed Domains', level: 'Intermediate', duration: '18 min', category: 'Domain Security', progress: 72, quiz: { q: 'finance-arnazon.com is likely?', a: ['Legit', 'Typosquatting'], correct: 1 }, content: 'Detect typosquatting and brand impersonation tactics.' },
    { id: 'm4', title: 'Urgent Language and Pressure', level: 'Beginner', duration: '12 min', category: 'Social Engineering', progress: 41, quiz: { q: '“Act in 10 minutes” often indicates?', a: ['Routine task', 'Manipulation'], correct: 1 }, content: 'Recognize emotional triggers and urgency manipulation.' },
    { id: 'm5', title: 'Attachment Risk Signals', level: 'Intermediate', duration: '16 min', category: 'Attachments', progress: 33, quiz: { q: 'Most risky attachment type?', a: ['Unexpected .zip/.exe', 'Calendar invite'], correct: 0 }, content: 'Spot malware delivery via archives, macros, and disguised files.' },
    { id: 'm6', title: 'Vishing and Smishing', level: 'Beginner', duration: '14 min', category: 'Multi-channel', progress: 20, quiz: { q: 'SMS requesting MFA code is?', a: ['Normal', 'Likely smishing'], correct: 1 }, content: 'Extend phishing awareness to voice and SMS channels.' },
    { id: 'm7', title: 'Executive Impersonation', level: 'Advanced', duration: '22 min', category: 'BEC', progress: 0, quiz: { q: 'CEO gift-card request at 7 PM?', a: ['Verify out-of-band', 'Purchase immediately'], correct: 0 }, content: 'Prevent business email compromise via process checks.' }
  ],
  employees: Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    name: ['Ava Chen','Noah Patel','Mia Johnson','Liam Ortiz','Ethan Kim','Sophia Reed','Lucas Nguyen','Emma Carter','James Diaz','Olivia Walker','Henry Lee','Chloe Martin'][i],
    team: ['Finance','HR','Sales','IT'][i % 4],
    completion: 28 + (i * 6) % 71,
    status: i % 3 === 0 ? 'At Risk' : i % 2 ? 'On Track' : 'Complete'
  })),
  groups: ['Finance Team', 'Leadership', 'New Hires', 'Customer Success'],
  simulations: [
    { name: 'Invoice Fraud Drill', targeted: 74, reported: 41, clickRate: '12%' },
    { name: 'Credential Reset Campaign', targeted: 120, reported: 89, clickRate: '8%' },
    { name: 'Gift Card Scam Scenario', targeted: 45, reported: 15, clickRate: '19%' }
  ],
  alerts: [
    { title: 'New spoofed payroll domain detected', severity: 'high' },
    { title: 'Q2 mandatory module deadline: May 10', severity: 'medium' },
    { title: 'Manager office hours this Friday', severity: 'low' }
  ],
  sampleEmails: [
    { type: 'Suspicious', subject: 'Urgent: Wire transfer needed', body: 'Please wire $48,200 today. Keep confidential. Use the attached payment form.' },
    { type: 'Suspicious', subject: 'Password Expiring in 10 Minutes', body: 'Verify your account at company-security-check.com/login immediately.' },
    { type: 'Suspicious', subject: 'Shared Tax Document', body: 'Open the attached ZIP and run the viewer to decrypt records.' },
    { type: 'Legitimate', subject: 'Quarterly Benefits Reminder', body: 'Open HR portal from your bookmarked link to complete enrollment.' },
    { type: 'Legitimate', subject: 'Team Lunch Poll', body: 'Vote in the internal Teams poll by Friday.' }
  ]
};

const routes = {
  '/': renderHome,
  '/login': renderLogin,
  '/register': renderRegister,
  '/forgot-password': renderForgot,
  '/2fa': render2FA,
  '/app/dashboard': () => renderShell('employee', renderEmployeeDashboard),
  '/app/analyze': () => renderShell('employee', renderAnalyze),
  '/app/modules': () => renderShell('employee', renderModules),
  '/app/progress': () => renderShell('employee', renderProgress),
  '/app/alerts': () => renderShell('employee', renderAlerts),
  '/app/settings': () => renderShell('employee', renderSettings),
  '/org/dashboard': () => renderShell('manager', renderOrgDashboard),
  '/org/employees': () => renderShell('manager', renderEmployees),
  '/org/groups': () => renderShell('manager', renderGroups),
  '/org/assignments': () => renderShell('manager', renderAssignments),
  '/org/simulations': () => renderShell('manager', renderSimulations),
  '/org/alerts': () => renderShell('manager', renderOrgAlerts),
  '/admin/dashboard': () => renderShell('admin', renderAdminDashboard),
  '/admin/modules': () => renderShell('admin', renderAdminModules),
  '/admin/modules/new': () => renderShell('admin', renderModuleNew),
  '/admin/support': () => renderShell('admin', renderAdminSupport)
};

function navigate(path) { history.pushState({}, '', path); render(); }
function toast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.style.display = 'block'; setTimeout(() => t.style.display = 'none', 2200); }
function riskBadge(score) { if (score >= 75) return ['High', 'high']; if (score >= 45) return ['Medium', 'medium']; return ['Low', 'low']; }

function analyzeEmail(text = '') {
  const lower = text.toLowerCase();
  const flags = {
    sender: /external|unknown|security-check|arnazon|verify/.test(lower),
    links: /http|www\.|\.com\//.test(lower),
    attachment: /attach|zip|exe|macro|viewer/.test(lower),
    urgent: /urgent|immediately|asap|10 minutes|confidential|wire/.test(lower)
  };
  const score = (flags.sender ? 25 : 0) + (flags.links ? 20 : 0) + (flags.attachment ? 30 : 0) + (flags.urgent ? 25 : 0);
  return {
    score,
    flags,
    explanation: score > 60
      ? 'Multiple phishing indicators were detected, including pressure language and risky payload cues.'
      : 'Some suspicious characteristics are present. Verify sender authenticity and link destinations before action.',
    actions: [
      'Do not click links or open attachments until verified.',
      'Report this message to security via the in-product alert action.',
      'Complete related learning modules for this threat pattern.'
    ],
    related: ['m2', 'm4', 'm5']
  };
}

function link(path, label, activePath) {
  return `<a href="${path}" data-link class="nav-link ${activePath === path ? 'active' : ''}">${label}</a>`;
}

function renderShell(role, contentRenderer) {
  const roleMap = {
    employee: {
      name: 'Employee',
      links: [['/app/dashboard','Dashboard'],['/app/analyze','Analyze Email'],['/app/modules','Module Library'],['/app/progress','Progress'],['/app/alerts','Alerts'],['/app/settings','Settings']]
    },
    manager: {
      name: 'Organization Manager',
      links: [['/org/dashboard','Org Dashboard'],['/org/employees','Employees'],['/org/groups','Groups'],['/org/assignments','Assignments'],['/org/simulations','Simulations'],['/org/alerts','Org Alerts']]
    },
    admin: {
      name: 'Site Administrator',
      links: [['/admin/dashboard','Admin Dashboard'],['/admin/modules','Module Management'],['/admin/modules/new','Publish Module'],['/admin/support','Support Inbox']]
    }
  };
  const cfg = roleMap[role];
  state.role = role;
  app.innerHTML = `
    <div class="layout">
      <aside class="sidebar">
        <div class="brand">🛡️ PhishGuard</div>
        <p class="muted">${cfg.name}</p>
        <nav aria-label="Sidebar navigation">${cfg.links.map(([p,l]) => link(p, l, location.pathname)).join('')}</nav>
      </aside>
      <main class="main" id="main-content">
        <div class="topbar">
          <input aria-label="Search" class="search" placeholder="Search modules, alerts, employees..." />
          <div>
            <select id="role-switch" aria-label="Role switcher">
              <option value="employee" ${role === 'employee' ? 'selected':''}>Employee</option>
              <option value="manager" ${role === 'manager' ? 'selected':''}>Organization Manager</option>
              <option value="admin" ${role === 'admin' ? 'selected':''}>Site Administrator</option>
            </select>
            <button class="btn ghost" id="logout">Logout</button>
          </div>
        </div>
        ${contentRenderer()}
      </main>
    </div>`;

  document.getElementById('role-switch').onchange = (e) => {
    const p = e.target.value === 'employee' ? '/app/dashboard' : e.target.value === 'manager' ? '/org/dashboard' : '/admin/dashboard';
    navigate(p);
  };
  document.getElementById('logout').onclick = () => { state.user = null; navigate('/login'); };
}

function renderHome() {
  app.innerHTML = `<main class="hero" id="main-content">
      <h1>PhishGuard</h1>
      <p>A modern phishing-awareness and email-analysis platform prototype for employees, managers, and admins.</p>
      <div style="display:flex; gap:10px; justify-content:center; flex-wrap: wrap;">
        <a href="/login" data-link><button class="btn primary">Try Demo Login</button></a>
        <a href="/register" data-link><button class="btn">Create Account</button></a>
      </div>
    </main>`;
}
function authLayout(title, subtitle, body) {
  app.innerHTML = `<div class="auth-wrap"><main class="auth-card" id="main-content"><h1>${title}</h1><p class="muted">${subtitle}</p>${body}</main></div>`;
}
function renderLogin() {
  authLayout('Sign in', 'Use demo credentials and choose a role after sign-in.', `
    <form id="login-form">
      <label for="email">Work email</label><input id="email" type="email" required value="employee@phishguard.demo"/>
      <label for="password">Password</label><input id="password" type="password" required value="password123"/>
      <label><input type="checkbox" id="needs2fa"/> Use mock two-step verification</label>
      <button class="btn primary" type="submit">Continue</button>
      <a href="/forgot-password" data-link>Forgot password?</a>
      <a href="/register" data-link>Create account</a>
    </form>`);
  document.getElementById('login-form').onsubmit = (e) => {
    e.preventDefault();
    state.user = { name: 'Demo User' };
    navigate(document.getElementById('needs2fa').checked ? '/2fa' : '/app/dashboard');
  };
}
function renderRegister() {
  authLayout('Create account', 'Prototype onboarding form.', `
  <form id="register-form">
    <label>Full name<input required /></label>
    <label>Work email<input required type="email"/></label>
    <label>Organization<input required /></label>
    <label>Password<input required type="password"/></label>
    <button class="btn primary" type="submit">Create account (Mock)</button>
    <a href="/login" data-link>Back to sign in</a>
  </form>`);
  document.getElementById('register-form').onsubmit = (e) => { e.preventDefault(); toast('Account created. Please sign in.'); navigate('/login'); };
}
function renderForgot() {
  authLayout('Forgot password', 'We will send a reset link (mock only).', `
    <form id="forgot-form">
      <label for="f-email">Work email</label><input id="f-email" type="email" required />
      <button class="btn primary" type="submit">Send reset link</button>
      <a href="/login" data-link>Back to sign in</a>
    </form>`);
  document.getElementById('forgot-form').onsubmit = (e) => { e.preventDefault(); toast('Reset link sent (mock).'); };
}
function render2FA() {
  authLayout('Two-step verification', 'Enter a one-time code from your authenticator app (mock).', `
  <form id="fa-form">
    <label for="otp">6-digit code</label><input id="otp" inputmode="numeric" pattern="[0-9]{6}" placeholder="123456" required/>
    <button class="btn primary" type="submit">Verify</button>
  </form>`);
  document.getElementById('fa-form').onsubmit = (e) => { e.preventDefault(); navigate('/app/dashboard'); };
}

function renderEmployeeDashboard() {
  const avg = Math.round(data.modules.reduce((s,m) => s+m.progress,0)/data.modules.length);
  return `<section class="grid cols-3">
    <article class="card"><h3>Training Completion</h3><div class="metric">${avg}%</div><div class="progress"><span style="width:${avg}%"></span></div></article>
    <article class="card"><h3>Open Alerts</h3><div class="metric">${data.alerts.length}</div><p class="muted">1 requires immediate action.</p></article>
    <article class="card"><h3>Certificate Status</h3><div class="metric">${avg >= 80 ? 'Eligible' : 'In Progress'}</div><p class="muted">Complete all core modules.</p></article>
  </section>
  <section class="grid cols-2" style="margin-top:16px;">
    <article class="card"><h3>Recent Alerts</h3>${data.alerts.map(a => `<div class="kv"><span>${a.title}</span><span class="badge ${a.severity}">${a.severity}</span></div>`).join('')}</article>
    <article class="card"><h3>Recommended Modules</h3>${data.modules.slice(2,5).map(m => `<div class="kv"><span>${m.title}</span><a data-link href="/app/modules/${m.id}">Open</a></div>`).join('')}</article>
  </section>`;
}

function renderAnalyze() {
  const samples = data.sampleEmails.map((e, i) => `<option value="${i}">${e.type}: ${e.subject}</option>`).join('');
  return `<section class="grid cols-2">
    <article class="card">
      <h2>Analyze Email</h2>
      <p class="muted">Paste content or upload a sample .eml/.txt file. Uploaded content is ephemeral demo data.</p>
      <label for="sample-select">Load sample email</label>
      <select id="sample-select"><option value="">Select sample…</option>${samples}</select>
      <label for="email-text">Email content</label>
      <textarea id="email-text" rows="10" placeholder="Paste suspicious email text..."></textarea>
      <div class="upload-zone" role="region" aria-label="Upload zone">
        <label for="file-input">Drop file here or choose file</label>
        <input id="file-input" type="file" accept=".txt,.eml" />
      </div>
      <div style="margin-top:10px;"><button id="analyze-btn" class="btn primary">Analyze Message</button></div>
    </article>
    <article class="card">
      <h3>Phishing Examples</h3>
      ${data.sampleEmails.map(e => `<div class="kv"><span>${e.subject}</span><span class="badge ${e.type === 'Suspicious' ? 'high':'low'}">${e.type}</span></div>`).join('')}
    </article>
  </section>
  <section class="card" style="margin-top:16px;" id="analysis-result">
    ${renderAnalysisResult()}
  </section>`;
}

function renderAnalysisResult() {
  if (!state.analysisResult) return `<div class="empty">Run analysis to view risk score, flagged indicators, explanation, and recommended actions.</div>`;
  const r = state.analysisResult; const [label, cls] = riskBadge(r.score);
  return `<h2>Analysis Results</h2>
  <div class="grid cols-3">
    <div class="card"><h4>Risk Score</h4><div class="metric">${r.score}/100</div><span class="badge ${cls}">${label} Severity</span></div>
    <div class="card"><h4>Suspicious Sender</h4><div>${r.flags.sender ? '⚠️ Detected' : '✅ Not detected'}</div></div>
    <div class="card"><h4>Suspicious Links</h4><div>${r.flags.links ? '⚠️ Detected' : '✅ Not detected'}</div></div>
    <div class="card"><h4>Attachment Warning</h4><div>${r.flags.attachment ? '⚠️ Risky attachment cues' : '✅ No direct cue'}</div></div>
    <div class="card"><h4>Urgent Language</h4><div>${r.flags.urgent ? '⚠️ Pressure language found' : '✅ Neutral tone'}</div></div>
    <div class="card"><h4>Submit to research DB</h4><label><input id="db-toggle" type="checkbox"/> Include anonymized finding (mock)</label></div>
  </div>
  <article class="card" style="margin-top:12px;"><h3>Why this was flagged</h3><p>${r.explanation}</p></article>
  <article class="card" style="margin-top:12px;"><h3>Recommended next actions</h3><ul>${r.actions.map(a=>`<li>${a}</li>`).join('')}</ul></article>
  <article class="card" style="margin-top:12px;"><h3>Related Learning Modules</h3>${r.related.map(id => {
    const m = data.modules.find(x => x.id === id); return `<div class="kv"><span>${m.title}</span><a href="/app/modules/${id}" data-link>Open module</a></div>`;
  }).join('')}</article>`;
}

function renderModules() {
  return `<section class="card"><h2>Module Library</h2><p class="muted">Searchable awareness modules.</p><input id="module-search" placeholder="Search module by title/category"/></section>
  <section class="grid cols-3" id="module-grid" style="margin-top:12px;">${moduleCards(data.modules)}</section>`;
}
function moduleCards(list) {
  if (!list.length) return '<div class="empty">No modules found.</div>';
  return list.map(m => `<article class="card"><h3>${m.title}</h3><p class="muted">${m.category} · ${m.level} · ${m.duration}</p><div class="progress"><span style="width:${m.progress}%"></span></div><p>${m.progress}% complete</p><a href="/app/modules/${m.id}" data-link><button class="btn">Open module</button></a></article>`).join('');
}

function renderModuleDetail(id) {
  const m = data.modules.find(x => x.id === id);
  if (!m) return renderShell('employee', () => `<div class="card">Module not found.</div>`);
  return renderShell('employee', () => `<article class="card"><h2>${m.title}</h2><p class="muted">${m.category} · ${m.level}</p><p>${m.content}</p></article>
  <article class="card" style="margin-top:12px;"><h3>Knowledge Check</h3><p>${m.quiz.q}</p>${m.quiz.a.map((a, i) => `<label style="display:block; margin:8px 0;"><input type="radio" name="q" value="${i}"/> ${a}</label>`).join('')}<button id="submit-quiz" class="btn primary">Submit Answer</button><div id="quiz-feedback" style="margin-top:10px;"></div></article>`);
}

function renderProgress() {
  const done = data.modules.filter(m => state.completedModules.has(m.id)).length;
  const pct = Math.round(done / data.modules.length * 100);
  return `<section class="grid cols-2">
    <article class="card"><h2>Progress Tracking</h2><div class="metric">${pct}%</div><div class="progress"><span style="width:${pct}%"></span></div><p>${done}/${data.modules.length} modules complete</p></article>
    <article class="card"><h2>Certificate</h2><p>${pct >= 80 ? '🎉 Certificate Ready' : 'Complete 80% to unlock certificate preview.'}</p><div class="empty">Certificate Preview (Mock)</div></article>
  </section>`;
}
function renderAlerts() { return `<section class="card"><h2>Alert Center</h2>${data.alerts.map(a => `<div class="kv"><span>${a.title}</span><span class="badge ${a.severity}">${a.severity}</span></div>`).join('')}</section>`; }
function renderSettings() { return `<section class="card"><h2>Settings</h2><p class="muted">Notification preferences and account controls (mock).</p><label><input type="checkbox" checked/> Email alerts</label><br/><label><input type="checkbox" checked/> Weekly digest</label></section>`; }

function renderOrgDashboard() {
  return `<section class="grid cols-3">
    <article class="card"><h3>Employees</h3><div class="metric">${data.employees.length}</div></article>
    <article class="card"><h3>Avg Completion</h3><div class="metric">${Math.round(data.employees.reduce((s,e)=>s+e.completion,0)/data.employees.length)}%</div></article>
    <article class="card"><h3>Active Simulations</h3><div class="metric">${data.simulations.length}</div></article>
  </section>`;
}
function renderEmployees() {
  return `<section class="card"><h2>Employee List</h2><table class="table"><thead><tr><th>Name</th><th>Team</th><th>Completion</th><th>Status</th></tr></thead><tbody>${data.employees.map(e => `<tr><td>${e.name}</td><td>${e.team}</td><td>${e.completion}%</td><td>${e.status}</td></tr>`).join('')}</tbody></table></section>`;
}
function renderGroups() { return `<section class="card"><h2>Group Management</h2>${data.groups.map(g => `<div class="kv"><span>${g}</span><button class="btn">Edit</button></div>`).join('')}<button id="new-group" class="btn primary" style="margin-top:10px;">Create Group (Modal Mock)</button></section>`; }
function renderAssignments() { return `<section class="card"><h2>Assignment Builder</h2><label>Choose group<select>${data.groups.map(g=>`<option>${g}</option>`).join('')}</select></label><label>Assign module<select>${data.modules.map(m=>`<option>${m.title}</option>`).join('')}</select></label><button class="btn primary">Assign (Mock)</button></section>`; }
function renderSimulations() { return `<section class="card"><h2>Phishing Simulation Overview</h2><table class="table"><thead><tr><th>Name</th><th>Targeted</th><th>Reported</th><th>Click Rate</th></tr></thead><tbody>${data.simulations.map(s => `<tr><td>${s.name}</td><td>${s.targeted}</td><td>${s.reported}</td><td>${s.clickRate}</td></tr>`).join('')}</tbody></table></section>`; }
function renderOrgAlerts() { return `<section class="card"><h2>Org-wide Alert Composer</h2><label>Title<input placeholder="Security notice"/></label><label>Message<textarea rows="4" placeholder="Enter alert details..."></textarea></label><button class="btn primary">Send Alert (Mock)</button></section>`; }

function renderAdminDashboard() {
  return `<section class="grid cols-3">
    <article class="card"><h3>Total Modules</h3><div class="metric">${data.modules.length}</div></article>
    <article class="card"><h3>Pending Reviews</h3><div class="metric">3</div></article>
    <article class="card"><h3>Support Tickets</h3><div class="metric">9</div></article>
  </section>`;
}
function renderAdminModules() { return `<section class="card"><h2>Module Management</h2>${data.modules.map(m => `<div class="kv"><span>${m.title}</span><span><button class="btn">Edit</button> <button class="btn">Archive</button></span></div>`).join('')}</section>`; }
function renderModuleNew() { return `<section class="card"><h2>Publish New Module</h2><label>Module title<input/></label><label>Category<input/></label><label>Lesson content<textarea rows="6"></textarea></label><label>Quiz question<input/></label><button class="btn primary">Publish (Mock)</button></section>`; }
function renderAdminSupport() { return `<section class="card"><h2>Support Inbox</h2><div class="kv"><span>Cannot access module quiz</span><span class="badge medium">Open</span></div><div class="kv"><span>Question about simulation report</span><span class="badge low">New</span></div></section>`; }

function render() {
  const path = location.pathname;
  if (path.startsWith('/app/modules/')) return renderModuleDetail(path.split('/').pop());
  (routes[path] || renderHome)();

  document.querySelectorAll('[data-link]').forEach(a => {
    a.addEventListener('click', (e) => { e.preventDefault(); navigate(a.getAttribute('href')); });
  });

  const s = document.getElementById('sample-select');
  if (s) s.onchange = () => {
    if (s.value !== '') document.getElementById('email-text').value = `${data.sampleEmails[s.value].subject}\n\n${data.sampleEmails[s.value].body}`;
  };
  const fi = document.getElementById('file-input');
  if (fi) fi.onchange = async () => {
    const f = fi.files?.[0]; if (!f) return;
    const text = await f.text();
    document.getElementById('email-text').value = text.slice(0, 8000);
    toast(`Loaded ${f.name} (ephemeral)`);
  };
  const ab = document.getElementById('analyze-btn');
  if (ab) ab.onclick = () => {
    state.analysisResult = analyzeEmail(document.getElementById('email-text').value);
    document.getElementById('analysis-result').innerHTML = renderAnalysisResult();
    document.getElementById('analysis-result').scrollIntoView({ behavior: 'smooth' });
  };
  const ms = document.getElementById('module-search');
  if (ms) ms.oninput = () => {
    const q = ms.value.toLowerCase();
    const filtered = data.modules.filter(m => (`${m.title} ${m.category}`).toLowerCase().includes(q));
    document.getElementById('module-grid').innerHTML = moduleCards(filtered);
  };

  const sq = document.getElementById('submit-quiz');
  if (sq && path.startsWith('/app/modules/')) {
    const m = data.modules.find(x => x.id === path.split('/').pop());
    sq.onclick = () => {
      const selected = +document.querySelector('input[name="q"]:checked')?.value;
      const ok = selected === m.quiz.correct;
      document.getElementById('quiz-feedback').textContent = ok ? 'Correct! Progress updated.' : 'Not quite. Review the lesson and try again.';
      if (ok) {
        state.completedModules.add(m.id);
        m.progress = 100;
      }
    };
  }
}

window.addEventListener('popstate', render);
const app = document.getElementById('app');

const supportFab = document.getElementById('support-fab');
const supportDrawer = document.getElementById('support-drawer');
const closeSupport = document.getElementById('close-support');
supportFab.onclick = () => { supportDrawer.classList.add('open'); supportDrawer.setAttribute('aria-hidden', 'false'); };
closeSupport.onclick = () => { supportDrawer.classList.remove('open'); supportDrawer.setAttribute('aria-hidden', 'true'); };
document.getElementById('support-form').onsubmit = (e) => { e.preventDefault(); toast('Support request sent (mock).'); closeSupport.click(); };

render();
