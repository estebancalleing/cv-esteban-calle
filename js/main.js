/* ==========================================================================
   main.js · lógica principal de la página

   Secciones de este archivo:
   1. Preparación: idioma, preferencias del usuario y copias del contenido
   2. Idioma (aplicar textos, cambiar ES / EN)
   3. Aviso breve (toast)
   4. Bucle de scroll infinito (medición, salto invisible, desplazamiento suave)
   5. Puntero, tarjetas con inclinación y clics
   6. Elementos animados: letras del nombre, cinta y malla 3D
   7. Ciclo de animación (un solo requestAnimationFrame para todo)
   ========================================================================== */
(function () {
  'use strict';

  var I18N = window.CV_I18N;
  var EN = I18N.EN, TOAST = I18N.TOAST, HTML_KEYS = I18N.HTML_KEYS;

  /* ------------------------------------------------------------------------
     1. Preparación
     ------------------------------------------------------------------------ */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;  // el usuario pidió menos movimiento
  var coarse = window.matchMedia('(pointer: coarse)').matches;                 // pantalla táctil
  var hoverOK = window.matchMedia('(hover: hover)').matches;                   // hay ratón con hover
  var lang = 'es';                                                             // idioma inicial: siempre español

  var main = document.getElementById('loop');
  var orig = main.querySelector('.copy');   // la copia original del contenido
  var pointer = { x: 0, y: 0, active: false };
  var meshApi = null;

  function $all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  /* En pantallas táctiles la pista del inicio habla de "deslizar" en vez de "mover el cursor" */
  if (coarse) {
    var hintEl = orig.querySelector('[data-i="hint"]');
    if (hintEl) { hintEl.setAttribute('data-i', 'hint_t'); hintEl.textContent = I18N.HINT_T_ES; }
  }

  /* Guarda el texto en español de cada elemento traducible ANTES de clonar */
  $all('[data-i]').forEach(function (el) {
    el.setAttribute('data-es', HTML_KEYS[el.getAttribute('data-i')] ? el.innerHTML : el.textContent);
  });

  /* Scroll infinito: se apilan tres copias idénticas del contenido (clon, original, clon).
     El scroll vive siempre en la copia del medio; al salir de ella se salta a la equivalente
     sin que se note. Los clones se ocultan a lector de pantalla y teclado (aria-hidden + inert). */
  var cloneTop = orig.cloneNode(true), cloneBottom = orig.cloneNode(true);
  [cloneTop, cloneBottom].forEach(function (c) {
    c.setAttribute('aria-hidden', 'true');
    c.setAttribute('inert', '');
  });
  main.insertBefore(cloneTop, orig);
  main.appendChild(cloneBottom);
  var copies = [cloneTop, orig, cloneBottom];

  /* ------------------------------------------------------------------------
     2. Idioma
     ------------------------------------------------------------------------ */
  function applyLang() {
    document.documentElement.lang = lang;

    $all('[data-i]').forEach(function (el) {
      var key = el.getAttribute('data-i');
      var text = (lang === 'en' && EN[key] != null) ? EN[key] : el.getAttribute('data-es');
      if (HTML_KEYS[key]) el.innerHTML = text; else el.textContent = text;
    });

    $all('[data-aria-es]').forEach(function (el) {
      el.setAttribute('aria-label', el.getAttribute('data-aria-' + lang));
    });

    /* El botón "Descargar CV" del inicio entrega el PDF del idioma activo */
    $all('[data-dl="auto"]').forEach(function (a) {
      a.setAttribute('href', I18N.PDF[lang]);
      a.setAttribute('download', I18N.FILE[lang]);
    });

    $all('[data-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
  }

  /* Cambiar de idioma conserva la sección que se está leyendo, aunque cambie la altura del contenido */
  function setLang(newLang) {
    if (newLang === lang) return;

    var line = window.scrollY + window.innerHeight * 0.5, anchor = null;
    for (var i = 0; i < secs.length; i++) {
      if (secs[i].top <= line && line < secs[i].bottom) { anchor = secs[i]; break; }
    }
    var rel = anchor ? anchor.el.getBoundingClientRect().top : 0;

    lang = newLang;
    applyLang();
    void main.offsetHeight;   // fuerza el recálculo del layout
    measure();

    if (anchor) window.scrollTo(0, anchor.el.getBoundingClientRect().top + window.scrollY - rel);
    lastY = window.scrollY;
    measure();
  }

  /* ------------------------------------------------------------------------
     3. Aviso breve (toast)
     ------------------------------------------------------------------------ */
  var toastEl = document.getElementById('toast'), toastTimer = 0;
  function toast(key) {
    toastEl.textContent = TOAST[key][lang === 'en' ? 1 : 0];
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 2200);
  }

  /* ------------------------------------------------------------------------
     4. Bucle de scroll infinito
     ------------------------------------------------------------------------ */
  var H = 0;          // altura de una copia completa
  var top1 = 0;       // posición (en el documento) donde empieza la copia del medio
  var secs = [];      // secciones de las tres copias, con su posición, para saber cuál se está viendo
  var anim = null;    // desplazamiento suave en curso
  var lastY = window.scrollY, vel = 0;

  function measure() {
    var sy = window.scrollY;
    top1 = copies[1].getBoundingClientRect().top + sy;
    H = (copies[2].getBoundingClientRect().top + sy) - top1;

    secs = [];
    copies.forEach(function (c) {
      Array.prototype.forEach.call(c.querySelectorAll('[data-sec]'), function (s) {
        var r = s.getBoundingClientRect();
        secs.push({
          el: s,
          id: s.getAttribute('data-sec'),
          top: r.top + sy,
          bottom: r.bottom + sy,
          mesh: parseFloat(s.getAttribute('data-mesh') || '0')   // intensidad de la malla 3D en esa sección
        });
      });
    });
  }

  /* Salta una copia hacia arriba o abajo; el contenido es idéntico, así que no se nota */
  function shift(d) {
    window.scrollTo(0, window.scrollY + d);
    lastY += d;
    if (anim) { anim.from += d; anim.to += d; }
  }
  function wrap() {
    if (!H) return;
    var y = window.scrollY;
    if (y >= top1 + H) shift(-H);
    else if (y < top1 - 1) shift(H);
  }

  /* Si cambia el tamaño (fuentes que cargan, rotar el móvil), se vuelve a medir sin perder el lugar */
  function remeasure() {
    var rel = window.scrollY - top1, oldTop = top1, oldH = H;
    measure();
    if (Math.abs(oldTop - top1) < 1 && Math.abs(oldH - H) < 1) return;
    window.scrollTo(0, top1 + rel);
    lastY = window.scrollY;
  }

  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  measure();
  window.scrollTo(0, top1);   // arranca en la copia del medio
  lastY = window.scrollY;

  if (window.ResizeObserver) new ResizeObserver(remeasure).observe(orig);
  window.addEventListener('resize', function () { remeasure(); if (meshApi) meshApi.resize(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
  window.addEventListener('load', remeasure);
  window.addEventListener('scroll', wrap, { passive: true });

  /* Desplazamiento suave propio (el nativo se cancelaría al saltar entre copias) */
  function animateTo(to) {
    var from = window.scrollY, dist = Math.abs(to - from);
    if (reduce || dist < 2) { window.scrollTo(0, to); wrap(); return; }
    anim = { from: from, to: to, t0: performance.now(), dur: Math.min(1100, 450 + dist * 0.18) };
  }

  /* Va a una sección eligiendo la copia más cercana, para no recorrer toda la página */
  function go(id) {
    var y = window.scrollY, best = null, bestDist = Infinity;
    secs.forEach(function (s) {
      if (s.id !== id) return;
      var t = s.top - (id === 'inicio' ? 0 : 64);   // 64px: espacio de la barra de navegación
      var d = Math.abs(t - y);
      if (d < bestDist) { bestDist = d; best = t; }
    });
    if (best != null) animateTo(best);
  }

  /* Si la persona mueve el scroll, se cancela el desplazamiento automático */
  ['wheel', 'touchstart', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, function () { anim = null; }, { passive: true });
  });

  /* ------------------------------------------------------------------------
     5. Puntero, tarjetas y clics
     ------------------------------------------------------------------------ */
  var hoverCard = null;
  function resetCard(c) { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); }

  document.addEventListener('pointermove', function (e) {
    pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true;
    if (!hoverOK) return;

    /* Tarjetas de proyectos: foco de luz que sigue al cursor e inclinación leve */
    var card = e.target && e.target.closest ? e.target.closest('.card') : null;
    if (hoverCard && hoverCard !== card) resetCard(hoverCard);
    hoverCard = card;
    if (card) {
      var r = card.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty('--mx', x + 'px');
      card.style.setProperty('--my', y + 'px');
      if (!reduce) {
        card.style.setProperty('--ry', ((x / r.width - 0.5) * 8).toFixed(2) + 'deg');
        card.style.setProperty('--rx', ((0.5 - y / r.height) * 6).toFixed(2) + 'deg');
      }
    }
  }, { passive: true });

  document.documentElement.addEventListener('pointerleave', function () {
    pointer.active = false;
    if (hoverCard) { resetCard(hoverCard); hoverCard = null; }
  });

  /* Un solo escuchador de clics para: navegación, idioma y copiar correo */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest) return;

    var goLink = t.closest('[data-go]');
    if (goLink) { e.preventDefault(); go(goLink.getAttribute('data-go')); return; }

    var langBtn = t.closest('[data-lang]');
    if (langBtn) { setLang(langBtn.getAttribute('data-lang')); return; }

    var copyBtn = t.closest('[data-copy-email]');
    if (copyBtn) {
      var src = copyBtn.parentNode.querySelector('.email-text');
      var fallback = function () {
        /* Si el navegador no permite copiar, deja el correo seleccionado */
        try {
          var range = document.createRange(); range.selectNodeContents(src);
          var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
        } catch (err) {}
        toast('copyfail');
      };
      try {
        navigator.clipboard.writeText(src.textContent).then(function () { toast('copied'); }, fallback);
      } catch (err) { fallback(); }
    }
  });

  /* ------------------------------------------------------------------------
     6. Elementos animados
     ------------------------------------------------------------------------ */

  /* Letras del nombre: el grosor sigue al cursor; sin cursor, una ola lenta */
  var letters = [];
  copies.forEach(function (c, ci) {
    Array.prototype.forEach.call(c.querySelectorAll('.hero .ch'), function (el, i) {
      letters.push({ el: el, copy: ci, i: i, w: 340 });
    });
  });

  /* Cinta con tecnologías: se desplaza sola y acelera con el scroll */
  var tracks = copies.map(function (c) {
    return { el: c.querySelector('.marquee-track'), box: c.querySelector('.marquee'), x: 0, w: 0 };
  });
  function measureMarquee() {
    tracks.forEach(function (t) {
      var seq = t.el.querySelector('.seq');
      t.w = seq ? seq.getBoundingClientRect().width : 0;
    });
  }

  /* Malla 3D (ver js/mesh.js) */
  meshApi = window.CVMesh ? window.CVMesh.create({
    canvas: document.getElementById('mesh'),
    pointer: pointer,
    reduce: reduce
  }) : null;

  /* ------------------------------------------------------------------------
     7. Ciclo de animación
     ------------------------------------------------------------------------ */
  applyLang();
  measure();
  measureMarquee();
  window.addEventListener('load', measureMarquee);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureMarquee);

  var navLinks = $all('.nav-links a');
  var activeId = '';
  var lastT = performance.now();

  function frame(now) {
    var dt = Math.min(0.05, Math.max(0.001, (now - lastT) / 1000));
    lastT = now;

    /* Desplazamiento suave hacia una sección */
    if (anim) {
      var p = Math.min(1, (now - anim.t0) / anim.dur);
      var eased = 1 - Math.pow(1 - p, 3);
      window.scrollTo(0, anim.from + (anim.to - anim.from) * eased);
      if (p >= 1) anim = null;
    }

    /* Velocidad de scroll suavizada (px/s): acelera la cinta y el giro de la malla */
    var sy = window.scrollY, vh = window.innerHeight;
    vel += (((sy - lastY) / dt) - vel) * Math.min(1, dt * 8);
    lastY = sy;
    var cv = Math.max(-4000, Math.min(4000, vel));

    /* Sección que se está leyendo (línea al 40% de la pantalla) */
    var readLine = sy + vh * 0.4, current = null;
    for (var i = 0; i < secs.length; i++) {
      if (secs[i].top <= readLine && readLine < secs[i].bottom) { current = secs[i]; break; }
    }
    var id = current ? current.id : '';
    if (id !== activeId) {
      activeId = id;
      navLinks.forEach(function (a) {
        if (a.getAttribute('data-go') === id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }

    /* Cinta (solo la que está visible) */
    if (!reduce) {
      tracks.forEach(function (t) {
        if (!t.w) return;
        var r = t.box.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        t.x += (-70 - cv * 0.22) * dt;
        while (t.x <= -t.w) t.x += t.w;
        while (t.x > 0) t.x -= t.w;
        t.el.style.transform = 'translate3d(' + t.x.toFixed(1) + 'px,0,0)';
      });
    }

    /* Letras del nombre (solo las visibles) */
    letters.forEach(function (L) {
      var target;
      if (reduce) {
        target = 420;
      } else {
        var r = L.el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        if (pointer.active && hoverOK) {
          var dx = pointer.x - (r.left + r.width / 2), dy = pointer.y - (r.top + r.height / 2);
          target = 320 + 480 * Math.exp(-(dx * dx + dy * dy) / (190 * 190));   // más grueso cerca del cursor
        } else {
          target = 380 + 150 * Math.sin(now / 900 + L.i * 0.7);                 // ola lenta
        }
      }
      L.w += (target - L.w) * 0.16;
      L.el.style.setProperty('--w', L.w.toFixed(0));
    });

    /* Malla 3D: su intensidad depende de la sección visible (data-mesh en index.html) */
    if (meshApi) meshApi.step(now, dt, current ? current.mesh : 0, cv);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
