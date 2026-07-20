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

/* ---------- Active nav link on scroll ---------- */
const navAnchors = document.querySelectorAll('[data-nav]');
const sections = [...navAnchors].map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = '#' + entry.target.id;
      navAnchors.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === id));
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
  ctx.fillStyle = 'rgba(82,224,196,0.55)';
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
        ctx.strokeStyle = `rgba(82,224,196,${0.12 * (1 - dist / linkDist)})`;
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

/* ---------- Reactive waveform + readout ---------- */
const scopeBox = document.getElementById('scopeBox');
const wavePath = document.getElementById('wavePath');
const readout = document.getElementById('readout');
const basePath = wavePath.getAttribute('d');
if (scopeBox && !isTouch) {
  scopeBox.addEventListener('mousemove', (e) => {
    const rect = scopeBox.getBoundingClientRect();
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    const amp = 1 + relY * 1.4;
    const newPath = basePath.replace(/T(\d+),(\d+)/g, (m, x, y) => {
      const dev = (parseInt(y, 10) - 80) * amp;
      return `T${x},${Math.max(4, Math.min(156, 80 + dev))}`;
    });
    wavePath.setAttribute('d', newPath);
    readout.textContent = `${(34 + Math.abs(relY) * 20).toFixed(1)} dB`;
  });
  scopeBox.addEventListener('mouseleave', () => {
    wavePath.setAttribute('d', basePath);
  });
} else if (readout && !reduceMotion) {
  setInterval(() => {
    readout.textContent = `${(Math.random() * 6 + 34).toFixed(1)} dB`;
  }, 1400);
}

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
  contact: 'Email: Findkarthik7@yahoo.com · Phone: +91 74115 30867 · Bengaluru, Karnataka.',
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
