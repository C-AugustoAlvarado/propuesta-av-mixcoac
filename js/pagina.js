// Comportamiento de la página: barra que se vuelve sólida al dejar la portada, menú en
// móvil, aparición suave de las secciones y visor de imágenes (lightbox) para los renders.
(function () {
  'use strict';

  // --- barra ---
  var barra = document.querySelector('.barra');
  var portada = document.querySelector('.portada');
  if (barra && portada && !barra.classList.contains('barra--siempre')) {
    var actualizar = function () {
      var limite = portada.offsetHeight - barra.offsetHeight;
      barra.classList.toggle('barra--solida', window.scrollY > limite);
    };
    window.addEventListener('scroll', actualizar, { passive: true });
    actualizar();
  }
  var menu = document.querySelector('.barra__menu');
  if (menu && barra) {
    menu.addEventListener('click', function () {
      var abierta = barra.classList.toggle('barra--abierta');
      menu.setAttribute('aria-expanded', abierta ? 'true' : 'false');
    });
    barra.querySelectorAll('.barra__enlaces a').forEach(function (a) {
      a.addEventListener('click', function () { barra.classList.remove('barra--abierta'); menu.setAttribute('aria-expanded', 'false'); });
    });
  }

  // --- aparición ---
  var aparecen = document.querySelectorAll('.aparece');
  if ('IntersectionObserver' in window && aparecen.length) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); observador.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    aparecen.forEach(function (el) { observador.observe(el); });
  } else {
    aparecen.forEach(function (el) { el.classList.add('visible'); });
  }

  // --- visor ---
  var visor = document.querySelector('.visor');
  var piezas = Array.prototype.slice.call(document.querySelectorAll('.galeria__pieza'));
  if (!visor || !piezas.length || typeof visor.showModal !== 'function') return;
  var imagen = visor.querySelector('.visor__escena img');
  var titulo = visor.querySelector('.visor__titulo');
  var contador = visor.querySelector('.visor__contador');
  var actual = 0;

  var mostrar = function (i) {
    actual = (i + piezas.length) % piezas.length;
    var pieza = piezas[actual];
    imagen.src = pieza.getAttribute('data-grande');
    imagen.alt = pieza.querySelector('img').alt;
    titulo.textContent = pieza.getAttribute('data-titulo');
    contador.textContent = pieza.getAttribute('data-indice') + ' · ' + (actual + 1) + ' / ' + piezas.length;
    // precarga de la siguiente
    var siguiente = new Image();
    siguiente.src = piezas[(actual + 1) % piezas.length].getAttribute('data-grande');
  };
  piezas.forEach(function (pieza, i) {
    pieza.addEventListener('click', function (ev) { ev.preventDefault(); mostrar(i); visor.showModal(); document.body.style.overflow = 'hidden'; });
  });
  var cerrar = function () { visor.close(); };
  visor.addEventListener('close', function () { document.body.style.overflow = ''; imagen.removeAttribute('src'); });
  visor.querySelector('.visor__cerrar').addEventListener('click', cerrar);
  visor.querySelector('.visor__nav--anterior').addEventListener('click', function () { mostrar(actual - 1); });
  visor.querySelector('.visor__nav--siguiente').addEventListener('click', function () { mostrar(actual + 1); });
  visor.addEventListener('click', function (ev) { if (ev.target === visor || ev.target.classList.contains('visor__escena')) cerrar(); });
  visor.addEventListener('keydown', function (ev) {
    if (ev.key === 'ArrowRight') mostrar(actual + 1);
    if (ev.key === 'ArrowLeft') mostrar(actual - 1);
  });
  // deslizar en pantallas táctiles
  var inicioX = null;
  visor.addEventListener('touchstart', function (ev) { inicioX = ev.touches[0].clientX; }, { passive: true });
  visor.addEventListener('touchend', function (ev) {
    if (inicioX === null) return;
    var dx = ev.changedTouches[0].clientX - inicioX; inicioX = null;
    if (Math.abs(dx) > 48) mostrar(dx < 0 ? actual + 1 : actual - 1);
  });
})();
