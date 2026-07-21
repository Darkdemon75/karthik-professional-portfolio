const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

/* ---------- Mobile nav ---------- */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ---------- Nav border + scroll progress ---------- */
const nav = document.getElementById('nav');
const progress = document.getElementById('progress');
window.addEventListener('scroll', () => {
  nav.style.borderBottomColor = window.scrollY > 20 ? 'rgba(82,224,196,0.15)' : '';
  const h = document.documentElement;
  const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progress.style.width = pct + '%';
}, { passive: true });

/* ---------- Nav dropdown ("About" group) ---------- */
const navDropdown = document.getElementById('navDropdown');
const navDropBtn = document.getElementById('navDropBtn');
const navDropMenu = document.getElementById('navDropMenu');
const navDropLabel = document.getElementById('navDropLabel');

navDropBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = navDropdown.classList.toggle('is-open');
  navDropBtn.setAttribute('aria-expanded', String(isOpen));
});
document.addEventListener('click', (e) => {
  if (!navDropdown.contains(e.target)) {
    navDropdown.classList.remove('is-open');
    navDropBtn.setAttribute('aria-expanded', 'false');
  }
});
navDropMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navDropLabel.textContent = link.dataset.sectionLabel;
    navDropdown.classList.remove('is-open');
    navDropBtn.setAttribute('aria-expanded', 'false');
  });
});

/* ---------- Theme toggle ---------- */
const themeToggle = document.getElementById('themeToggle');
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  try { localStorage.setItem('kd-theme', theme); } catch (e) {}
}
themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
});
applyTheme(document.documentElement.getAttribute('data-theme') || 'dark');

/* ---------- Active nav link on scroll ---------- */
const navAnchors = document.querySelectorAll('[data-nav]');
const sections = [...navAnchors].map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
const dropdownIds = new Set(['about', 'experience', 'education', 'projects', 'skills']);
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = '#' + entry.target.id;
      navAnchors.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === id));
      if (dropdownIds.has(entry.target.id)) {
        navDropBtn.classList.add('is-active');
        const match = navDropMenu.querySelector(`a[href="${id}"]`);
        if (match) navDropLabel.textContent = match.dataset.sectionLabel;
      } else {
        navDropBtn.classList.remove('is-active');
      }
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => navObserver.observe(s));

/* ---------- Reveal on scroll ---------- */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('is-visible'), i * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));

/* ---------- Custom cursor ---------- */
if (!isTouch) {
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    cursorDot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
  });
  function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    cursorRing.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  }
  loop();
  document.querySelectorAll('[data-cursor-hover]').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('is-hover'));
  });
} else {
  document.getElementById('cursorDot').style.display = 'none';
  document.getElementById('cursorRing').style.display = 'none';
}

/* ---------- Canvas background network ---------- */
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
function initParticles() {
  const count = isTouch ? 22 : Math.min(60, Math.floor(window.innerWidth / 28));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
  }));
}
function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const linkDist = 130;
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const rgb = isLight ? '13,110,94' : '82,224,196';
  const dotAlpha = isLight ? 0.75 : 0.55;
  const lineAlpha = isLight ? 0.22 : 0.12;
  ctx.fillStyle = `rgba(${rgb},${dotAlpha})`;
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
    ctx.fill();
  });
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < linkDist) {
        ctx.strokeStyle = `rgba(${rgb},${lineAlpha * (1 - dist / linkDist)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawCanvas);
}
resizeCanvas();
initParticles();
if (!reduceMotion) requestAnimationFrame(drawCanvas);
window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

/* ---------- Hero typing effect ---------- */
const roleEl = document.getElementById('roleText');
const roleFull = 'Intelligence Analyst — Research, Data & Sensor Systems';
if (reduceMotion) {
  roleEl.textContent = roleFull;
} else {
  let ri = 0;
  function typeRole() {
    if (ri <= roleFull.length) {
      roleEl.textContent = roleFull.slice(0, ri);
      ri++;
      setTimeout(typeRole, 22);
    }
  }
  setTimeout(typeRole, 600);
}

/* ---------- Stats count-up ---------- */
const statNums = document.querySelectorAll('.stat__num');
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const dur = 1200;
      const start = performance.now();
      function tick(now) {
        const p = Math.min(1, (now - start) / dur);
        el.textContent = Math.floor(p * target) + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(tick);
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
statNums.forEach(el => statObserver.observe(el));

/* ---------- Skills radar chart ---------- */
const radarData = [
  { label: 'Data & Research', value: 85 },
  { label: 'Embedded / IoT', value: 92 },
  { label: 'Web Dev', value: 68 },
  { label: 'Testing & QA', value: 65 },
  { label: 'Operations', value: 80 },
];
const radarHost = document.getElementById('radarChart');
const radarLabel = document.getElementById('radarLabel');
const radarValue = document.getElementById('radarValue');
const radarPanel = radarHost ? radarHost.closest('.console__panel--radar') : null;

if (radarHost) {
  const SVGNS = 'http://www.w3.org/2000/svg';
  const cx = 130, cy = 122, maxR = 80;
  const n = radarData.length;
  const angleFor = (i) => (-90 + i * (360 / n)) * (Math.PI / 180);
  const pointAt = (i, r) => [cx + r * Math.cos(angleFor(i)), cy + r * Math.sin(angleFor(i))];

  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('viewBox', '0 0 260 240');

  // grid rings
  [0.33, 0.66, 1].forEach((f) => {
    const pts = radarData.map((_, i) => pointAt(i, maxR * f).join(',')).join(' ');
    const ring = document.createElementNS(SVGNS, 'polygon');
    ring.setAttribute('points', pts);
    ring.setAttribute('class', 'radar__ring');
    svg.appendChild(ring);
  });

  // axes + labels
  const labels = radarData.map((d, i) => {
    const [x, y] = pointAt(i, maxR);
    const line = document.createElementNS(SVGNS, 'line');
    line.setAttribute('x1', cx); line.setAttribute('y1', cy);
    line.setAttribute('x2', x); line.setAttribute('y2', y);
    line.setAttribute('class', 'radar__axis');
    svg.appendChild(line);

    const [lx, ly] = pointAt(i, maxR + 18);
    const text = document.createElementNS(SVGNS, 'text');
    text.setAttribute('x', lx); text.setAttribute('y', ly);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', ly > cy + 4 ? 'hanging' : ly < cy - 4 ? 'baseline' : 'middle');
    text.setAttribute('class', 'radar__label');
    text.textContent = d.label;
    svg.appendChild(text);
    return text;
  });

  // data area
  const areaPts = radarData.map((d, i) => pointAt(i, (d.value / 100) * maxR).join(',')).join(' ');
  const area = document.createElementNS(SVGNS, 'polygon');
  area.setAttribute('points', areaPts);
  area.setAttribute('class', 'radar__area');
  svg.appendChild(area);

  // interactive nodes
  const nodes = radarData.map((d, i) => {
    const [x, y] = pointAt(i, (d.value / 100) * maxR);
    const node = document.createElementNS(SVGNS, 'circle');
    node.setAttribute('cx', x); node.setAttribute('cy', y); node.setAttribute('r', 4);
    node.setAttribute('class', 'radar__node');
    node.setAttribute('tabindex', '0');
    node.setAttribute('aria-label', `${d.label}: ${d.value}%`);
    const activate = () => {
      nodes.forEach(nn => nn.classList.remove('is-active'));
      labels.forEach(ll => ll.classList.remove('is-active'));
      node.classList.add('is-active');
      labels[i].classList.add('is-active');
      if (radarLabel) radarLabel.textContent = `CH.01 SKILLSET — ${d.label}`;
      if (radarValue) radarValue.textContent = `${d.value}%`;
    };
    node.addEventListener('mouseenter', activate);
    node.addEventListener('click', activate);
    node.addEventListener('focus', activate);
    svg.appendChild(node);
    return node;
  });

  radarHost.appendChild(svg);

  // draw-in on scroll into view
  if (radarPanel) {
    const radarObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          radarObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    radarObserver.observe(radarPanel);
  }

  // idle auto-cycle so it feels alive before the user interacts
  if (!reduceMotion) {
    let ci = 0;
    setInterval(() => {
      if (document.activeElement && nodes.includes(document.activeElement)) return;
      nodes[ci].dispatchEvent(new Event('mouseenter'));
      ci = (ci + 1) % nodes.length;
    }, 1300);
  }
}

/* ---------- Stat popovers (Languages, Certifications) — hover to reveal ---------- */
document.querySelectorAll('.stat--pop').forEach((statEl) => {
  const close = () => {
    statEl.classList.remove('is-open');
    statEl.setAttribute('aria-expanded', 'false');
  };
  if (isTouch) {
    // touch devices have no hover — fall back to tap-toggle
    statEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = statEl.classList.toggle('is-open');
      statEl.setAttribute('aria-expanded', String(isOpen));
      document.querySelectorAll('.stat--pop').forEach(other => { if (other !== statEl) other.classList.remove('is-open'); });
    });
  } else {
    // pointer devices: CSS :hover handles the reveal; keep keyboard access via Enter/Escape
    statEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); statEl.classList.toggle('is-open'); }
      if (e.key === 'Escape') close();
    });
  }
});
document.addEventListener('click', (e) => {
  document.querySelectorAll('.stat--pop.is-open').forEach(statEl => {
    if (!statEl.contains(e.target)) {
      statEl.classList.remove('is-open');
      statEl.setAttribute('aria-expanded', 'false');
    }
  });
});

/* ---------- Magnetic buttons ---------- */
if (!isTouch) {
  document.querySelectorAll('[data-magnetic]').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

/* ---------- Project filters ---------- */
const filterBtns = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('#projectGrid .card');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const f = btn.dataset.filter;
    cards.forEach(card => {
      const tags = card.dataset.tags.split(' ');
      const show = f === 'all' || tags.includes(f);
      card.classList.toggle('is-hidden', !show);
    });
  });
});

/* ---------- Card tilt ---------- */
if (!isTouch) {
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-2px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ---------- Terminal ---------- */
const termBody = document.getElementById('termBody');
const termInput = document.getElementById('termInput');
const termWrap = document.getElementById('termWrap');
const commands = {
  help: 'Commands: about, skills, projects, experience, education, contact, sudo hire karthik, clear',
  about: 'Intelligence Analyst at Consuma AI, BCA graduate from PES University, builds IoT/embedded side-projects in spare time.',
  skills: 'C, Python, Embedded C, JavaScript, SQL, Arduino/IoT, MySQL, front-end web dev, manual testing.',
  projects: '5 builds: Garden Genie, Gas Leakage Detection, RFID Hospital Management, Mimetic, Smoke Detection. See the Projects section above.',
  experience: 'Intelligence Analyst @ Consuma AI (2026–present). Previously Intern @ Consuma AI, and Freelance Event Coordinator @ Paytm Insider.',
  education: 'BCA, PES University, RR Campus, Bengaluru — graduating 2026. Distinction in Semesters 1, 4 & 5.',
  contact: 'Email: Findkarthik7@yahoo.com · Phone: +91 7411530867 · Bengaluru, Karnataka.',
  whoami: 'A visitor checking out Karthik\'s portfolio. Nice to meet you.',
};
function printLine(html) {
  const p = document.createElement('p');
  p.innerHTML = html;
  termBody.appendChild(p);
  termBody.scrollTop = termBody.scrollHeight;
}
function runCommand(raw) {
  const cmd = raw.trim().toLowerCase();
  printLine(`<span class="term__cmd">${raw}</span>`);
  if (!cmd) return;
  if (cmd === 'clear') { termBody.innerHTML = ''; return; }
  if (cmd === 'sudo hire karthik' || cmd === 'hire karthik' || cmd === 'sudo hire-karthik') {
    printLine(`<span class="term__hl">Permission granted.</span> Reach out at Findkarthik7@yahoo.com — he'll respond fast.`);
    return;
  }
  if (commands[cmd]) { printLine(commands[cmd]); return; }
  printLine(`Command not found: "${cmd}". Type <span class="term__hl">help</span> for options.`);
}
termInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && termInput.value.trim() !== '') {
    runCommand(termInput.value);
    termInput.value = '';
  }
});
termWrap.addEventListener('click', () => termInput.focus());

/* ---------- Copy to clipboard ---------- */
const toast = document.getElementById('toast');
let toastTimer;
document.querySelectorAll('[data-copy]').forEach(el => {
  el.addEventListener('click', async () => {
    const val = el.dataset.copy;
    try {
      await navigator.clipboard.writeText(val);
      toast.textContent = `Copied: ${val}`;
    } catch {
      toast.textContent = val;
    }
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1800);
  });
});

/* ---------- Live clock ---------- */
const clockEl = document.getElementById('clock');
function tickClock() {
  const now = new Date();
  const opts = { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
  clockEl.textContent = now.toLocaleTimeString('en-GB', opts);
}
tickClock();
setInterval(tickClock, 1000);
