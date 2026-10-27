/* Rei do iPhone JP · interações (sem dependências) */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Intro do logo ---------- */
  var intro = document.getElementById('intro');
  function endIntro() {
    if (!intro || intro.dataset.done) return;
    intro.dataset.done = '1';
    intro.style.animation = 'intro-out .5s cubic-bezier(.7,0,.3,1) forwards';
    doc.classList.remove('intro-active');
    try { sessionStorage.setItem('rei-intro', '1'); } catch (e) {}
    setTimeout(function () { intro.remove(); }, 600);
  }
  if (intro && !doc.classList.contains('no-intro')) {
    setTimeout(endIntro, reduceMotion ? 900 : 3000);
    intro.addEventListener('click', endIntro);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') endIntro(); }, { once: true });
  } else if (intro) {
    intro.remove();
  }

  /* ---------- Navbar ---------- */
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav__toggle');
  var sheet = document.getElementById('menu-mobile');
  function onScroll() { nav.classList.toggle('is-scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    sheet.hidden = !open;
  }
  toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  sheet.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) { setMenu(false); toggle.focus(); } });
  window.matchMedia('(min-width: 961px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });

  // link ativo conforme a seção visível
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__links a'));
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s) spy.observe(s); });
  }

  /* ---------- Revelar ao rolar ---------- */
  var revealEls = document.querySelectorAll('.reveal, .lineup');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Utilitários de vídeo ---------- */
  function load(video) { if (video && !video.src && video.dataset.src) { video.src = video.dataset.src; } }
  function play(video) { if (!video) return; load(video); var p = video.play(); if (p && p.catch) p.catch(function () {}); }
  function pause(video) { if (video && !video.paused) video.pause(); }
  function whenVisible(el, cb) {
    if (!('IntersectionObserver' in window)) { cb(true); return; }
    new IntersectionObserver(function (entries) { cb(entries[0].isIntersecting); }, { threshold: 0.35 }).observe(el);
  }

  /* ---------- Destaques: vídeo no centro + 2 fotos ---------- */
  var sc = document.querySelector('[data-showcase]');
  if (sc) {
    var tabs = Array.prototype.slice.call(sc.querySelectorAll('.seg__btn'));
    var panels = Array.prototype.slice.call(sc.querySelectorAll('.trio'));
    var scIndex = 0, scVisible = false;
    function scVideo(i) { return panels[i].querySelector('video'); }
    function showColor(i, focus) {
      scIndex = (i + panels.length) % panels.length;
      tabs.forEach(function (t, k) {
        var on = k === scIndex;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      panels.forEach(function (p, k) {
        var on = k === scIndex;
        p.hidden = !on;
        p.classList.toggle('is-active', on);
        var v = scVideo(k);
        if (on) { v.currentTime = 0; if (scVisible) play(v); } else { pause(v); }
      });
    }
    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { showColor(k); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); showColor(scIndex + 1, true); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); showColor(scIndex - 1, true); }
      });
    });
    panels.forEach(function (p, k) {
      var v = scVideo(k);
      v.addEventListener('ended', function () { if (reduceMotion) { v.currentTime = 0; } else { showColor(k + 1); } });
    });
    whenVisible(sc, function (vis) { scVisible = vis; var v = scVideo(scIndex); if (vis) play(v); else pause(v); });
  }

  /* ---------- Carrossel (destaque central, laterais passando) ---------- */
  function Flow(root) {
    var stage = root.querySelector('.flow__stage');
    var slides = Array.prototype.slice.call(root.querySelectorAll('.flow__slide'));
    var dotsWrap = root.querySelector('.flow__dots');
    var isVideo = root.dataset.flow === 'video';
    var n = slides.length, index = 0, visible = false, timer = null, hover = false;

    var dots = slides.map(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', (isVideo ? 'Vídeo ' : 'Foto ') + (i + 1) + ' de ' + n);
      b.addEventListener('click', function () { go(i, true); });
      dotsWrap.appendChild(b);
      return b;
    });

    function render() {
      slides.forEach(function (s, i) {
        var d = i - index;
        if (d > n / 2) d -= n;
        if (d < -n / 2) d += n;
        var ad = Math.abs(d);
        s.style.setProperty('--d', d);
        s.style.setProperty('--ad', Math.min(ad, 3));
        s.classList.toggle('is-active', d === 0);
        s.classList.toggle('is-far', ad > 2);
        s.setAttribute('aria-hidden', String(d !== 0));
        s.setAttribute('aria-label', (i + 1) + ' de ' + n);
        if (isVideo) {
          var v = s.querySelector('video');
          if (d === 0 && visible) { play(v); } else { pause(v); if (ad > 0) { try { v.currentTime = 0; } catch (e) {} } }
          if (ad === 1) { v.preload = 'metadata'; }
        }
      });
      dots.forEach(function (b, i) { b.setAttribute('aria-selected', String(i === index)); });
    }
    function go(i, user) { index = (i + n) % n; render(); if (user) restart(); }
    function next() { go(index + 1); }
    function prev() { go(index - 1); }

    // fotos: troca automática; vídeos: avança quando o vídeo termina
    function restart() {
      clearInterval(timer);
      if (!isVideo && visible && !hover && !reduceMotion) timer = setInterval(next, 3800);
    }
    if (isVideo) {
      slides.forEach(function (s, i) {
        s.querySelector('video').addEventListener('ended', function () { if (i === index) next(); });
      });
    }

    root.querySelector('[data-next]').addEventListener('click', function () { go(index + 1, true); });
    root.querySelector('[data-prev]').addEventListener('click', function () { go(index - 1, true); });
    slides.forEach(function (s, i) { s.addEventListener('click', function () { if (i !== index) go(i, true); }); });
    root.addEventListener('mouseenter', function () { hover = true; restart(); });
    root.addEventListener('mouseleave', function () { hover = false; restart(); });
    root.addEventListener('focusin', function () { hover = true; restart(); });
    root.addEventListener('focusout', function () { hover = false; restart(); });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1, true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1, true); }
    });

    // arrastar / deslizar
    var x0 = null, moved = false;
    stage.addEventListener('pointerdown', function (e) { x0 = e.clientX; moved = false; });
    stage.addEventListener('pointermove', function (e) { if (x0 !== null && Math.abs(e.clientX - x0) > 8) moved = true; });
    stage.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) { dx < 0 ? go(index + 1, true) : go(index - 1, true); }
    });
    stage.addEventListener('pointercancel', function () { x0 = null; });
    stage.addEventListener('click', function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); } }, true);

    whenVisible(root, function (vis) { visible = vis; render(); restart(); });
    render();
  }
  document.querySelectorAll('[data-flow]').forEach(function (el) { Flow(el); });

  /* ---------- Ano no rodapé ---------- */
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
