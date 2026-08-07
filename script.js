/* ============================================================
   Mert Cihan Bayır — AI System UI  |  interactions
   ============================================================ */
(function () {
  'use strict';

  const root = document.documentElement;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme (dark default, light optional) ---------- */
  const themeToggle = document.getElementById('themeToggle');
  function applyTheme(theme) {
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
  }
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = root.getAttribute('data-theme') === 'light';
      const next = isLight ? 'dark' : 'light';
      applyTheme(next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* ---------- Language (EN / TR) ---------- */
  const langBtns = document.querySelectorAll('.lang-btn');
  const typedPhrases = {
    en: ['RAG & LLM pipelines', 'Machine Learning models', 'Deep Learning & Computer Vision', 'AI deployed to mobile'],
    tr: ['RAG & LLM pipeline’ları', 'Makine Öğrenmesi modelleri', 'Derin Öğrenme & Bilgisayarlı Görü', 'Mobile dağıtılan AI']
  };
  let currentLang = 'en';

  function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    langBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-lang') === lang));
    document.querySelectorAll('[data-' + lang + ']').forEach(el => {
      el.textContent = el.getAttribute('data-' + lang);
    });
    try { localStorage.setItem('language', lang); } catch (e) {}
    restartTyped();
  }
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.getAttribute('data-lang')));
  });

  /* ---------- Typed hero line ---------- */
  const typedEl = document.getElementById('typed');
  let typeTimer = null;
  function restartTyped() {
    if (!typedEl) return;
    clearTimeout(typeTimer);
    if (prefersReduced) {
      typedEl.textContent = typedPhrases[currentLang][0];
      return;
    }
    let phrases = typedPhrases[currentLang];
    let pi = 0, ci = 0, deleting = false;
    function tick() {
      const word = phrases[pi];
      if (!deleting) {
        typedEl.textContent = word.slice(0, ++ci);
        if (ci === word.length) { deleting = true; typeTimer = setTimeout(tick, 1600); return; }
      } else {
        typedEl.textContent = word.slice(0, --ci);
        if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
      }
      typeTimer = setTimeout(tick, deleting ? 38 : 70);
    }
    tick();
  }

  /* ---------- Navbar scroll state ---------- */
  const navbar = document.getElementById('navbar');
  function onScrollNavbar() {
    if (window.scrollY > 30) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }

  /* ---------- Active nav link ---------- */
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  function updateActiveLink() {
    const pos = window.scrollY + 120;
    let currentId = '';
    sections.forEach(sec => {
      if (pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight) currentId = sec.id;
    });
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + currentId));
  }

  /* ---------- Smooth scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
      if (navMenu && navMenu.classList.contains('open')) toggleMenu(false);
    });
  });

  /* ---------- Mobile menu ---------- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  function toggleMenu(force) {
    const open = typeof force === 'boolean' ? force : !navMenu.classList.contains('open');
    navMenu.classList.toggle('open', open);
    navToggle.classList.toggle('active', open);
    const spans = navToggle.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  }
  if (navToggle) navToggle.addEventListener('click', () => toggleMenu());

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = (Math.min(entry.target.dataset.i || 0, 4) * 0) + 's';
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- Count-up stats ---------- */
  const statEls = document.querySelectorAll('.stat-number[data-target]');
  function countUp(el) {
    const target = parseFloat(el.getAttribute('data-target'));
    const suffix = el.getAttribute('data-suffix') || '';
    const isFloat = target % 1 !== 0;
    const dur = 1400;
    const start = performance.now();
    function frame(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = (isFloat ? val.toFixed(1) : Math.floor(val)) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = (isFloat ? target.toFixed(1) : target) + suffix;
    }
    requestAnimationFrame(frame);
  }
  if ('IntersectionObserver' in window) {
    const statObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (prefersReduced) {
            const t = entry.target;
            t.textContent = t.getAttribute('data-target') + (t.getAttribute('data-suffix') || '');
          } else countUp(entry.target);
          statObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    statEls.forEach(el => statObs.observe(el));
  }

  /* ---------- Magnetic buttons ---------- */
  if (!prefersReduced && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Hero glow follows cursor ---------- */
  const glow = document.getElementById('heroGlow');
  const hero = document.getElementById('hero');
  if (glow && hero && !prefersReduced && window.matchMedia('(pointer:fine)').matches) {
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      glow.style.left = (e.clientX - r.left) + 'px';
      glow.style.top = (e.clientY - r.top) + 'px';
    });
  }

  /* ---------- Neural point-cloud canvas ---------- */
  function initNeural() {
    const canvas = document.getElementById('neuralCanvas');
    if (!canvas || prefersReduced) return;
    const ctx = canvas.getContext('2d');
    let w, h, dpr, nodes = [];
    const mouse = { x: -9999, y: -9999 };

    function isLight() { return root.getAttribute('data-theme') === 'light'; }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(Math.floor((w * h) / 15000), 90);
      nodes = [];
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 0.6
        });
      }
    }

    function step() {
      ctx.clearRect(0, 0, w, h);
      const light = isLight();
      const dotColor = light ? 'rgba(8,145,178,0.55)' : 'rgba(34,211,238,0.8)';
      const lineBase = light ? '8,145,178' : '34,211,238';
      const linkDist = 130;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        // cursor attraction
        const dxm = mouse.x - n.x, dym = mouse.y - n.y;
        const dm = Math.hypot(dxm, dym);
        if (dm < 160) {
          n.x += dxm * 0.008;
          n.y += dym * 0.008;
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x, dy = n.y - m.y;
          const d = Math.hypot(dx, dy);
          if (d < linkDist) {
            const alpha = (1 - d / linkDist) * (light ? 0.28 : 0.35);
            ctx.strokeStyle = `rgba(${lineBase},${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(step);
    }

    let raf;
    window.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
    window.addEventListener('mouseout', () => { mouse.x = -9999; mouse.y = -9999; });
    window.addEventListener('resize', () => { cancelAnimationFrame(raf); resize(); step(); });

    resize();
    step();
  }

  /* ---------- Init ---------- */
  function init() {
    // restore language
    let savedLang = 'en';
    try { savedLang = localStorage.getItem('language') || 'en'; } catch (e) {}
    setLanguage(savedLang);

    onScrollNavbar();
    updateActiveLink();
    window.addEventListener('scroll', () => { onScrollNavbar(); updateActiveLink(); }, { passive: true });

    initNeural();
    restartTyped();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
