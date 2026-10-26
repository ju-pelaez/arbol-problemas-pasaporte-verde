// util.js
// Funciones pequeñas que uso en todas las fases.

// Aquí se registra cada fase. Cada archivo de js/fases/ agrega la suya.
const Fases = {};

const $ = (sel, raiz = document) => raiz.querySelector(sel);
const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];

function crear(etiqueta, clase = '', html = '') {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (html) el.innerHTML = html;
  return el;
}

// Desordena una lista (Fisher-Yates) sin cambiar la original.
function mezclar(lista) {
  const a = lista.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Espera unos milisegundos. Si las animaciones están reducidas, espera casi nada.
function esperar(ms) {
  const t = Juego.ajustes.movimiento ? ms : Math.min(ms, 150);
  return new Promise(r => setTimeout(r, t));
}

// Cada vez que cambio de fase, Juego.turno aumenta. Las animaciones que quedaron
// corriendo de la fase anterior revisan esto y se detienen solas.
function sigue(turno) { return turno === Juego.turno; }

// Lo que dice Don Arley abajo.
function decir(texto, quien = 'Don Arley') {
  Voz.decir(texto);
  const p = $('#dialogo');
  $('#quien').textContent = quien;
  p.textContent = texto;
  p.classList.toggle('largo', texto.length > 130);   // si el texto es largo, letra un poco más pequeña
  p.classList.remove('nuevo'); void p.offsetWidth; p.classList.add('nuevo');
}

// Cortinilla entre fases: número, nombre y qué se va a hacer. Se salta con clic o con →.
function cortinilla(fase, texto) {
  return new Promise(resolver => {
    const c = crear('div', 'cortina',
      `<div class="num">FASE ${fase.paso} DE 6</div><h2>${fase.titulo}</h2><p>${texto}</p><div class="barrita"></div>`);
    $('#escenario').appendChild(c);
    Sonido.tocar('brote');
    Voz.decir(`Fase ${fase.paso}: ${fase.titulo}. ${texto}`);
    let listo = false;
    const cerrar = () => {
      if (listo) return;
      listo = true;
      c.classList.add('sale');
      setTimeout(() => { c.remove(); resolver(); }, Juego.ajustes.movimiento ? 450 : 0);
    };
    c.onclick = cerrar;
    setTimeout(cerrar, Juego.ajustes.movimiento ? 2000 : 700);
  });
}


// ---------- Voz ----------
// Lee en voz alta lo que pasa en pantalla. Elige la voz más natural del computador
// (las neuronales "Natural"/"Online", como Salome en Edge) y habla un poco despacio.
// leer() además ilumina cada bloque mientras lo lee, como un karaoke.
const Voz = {
  hay: 'speechSynthesis' in window,
  voz: null,
  elegir() {
    if (!this.hay) return;
    const p = v => (/natural|online|neural/i.test(v.name) ? 100 : 0) + (/es[-_]CO/i.test(v.lang) ? 30 : /es[-_](MX|US|419)/i.test(v.lang) ? 20 : /es[-_]ES/i.test(v.lang) ? 10 : 0) + (/google/i.test(v.name) ? 15 : 0);
    // Si en el juego principal eligieron una voz, uso esa (comparten el mismo navegador).
    let elegida = null;
    try { elegida = JSON.parse(localStorage.getItem('arbol-sistemas-v1') || '{}').vozNombre; } catch (e) { /* nada */ }
    const todas = speechSynthesis.getVoices().filter(v => /^es/i.test(v.lang));
    this.voz = (elegida && todas.find(v => v.name === elegida)) || todas.sort((a, b) => p(b) - p(a))[0] || null;
  },
  frase(t) {
    // sin emojis: la voz no tiene que leer "chincheta roja" ni "árbol de hoja perenne"
    t = String(t).replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, '').replace(/\s+/g, ' ').trim();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = this.voz ? this.voz.lang : 'es-CO';
    if (this.voz) u.voice = this.voz;
    u.rate = .93; u.pitch = 1;
    return u;
  },
  callar() {
    if (this.hay) try { speechSynthesis.cancel(); } catch (e) { /* nada */ }
    document.querySelectorAll('.leyendo').forEach(x => x.classList.remove('leyendo'));
  },
  // decir: lee un texto (corta lo que estaba sonando).
  decir(t) { this.leer([{ texto: t }]); },
  // leer: lee varios bloques en orden; si "seguir" es true, los pone en cola sin cortar lo anterior.
  leer(bloques, seguir = false) {
    if (!this.hay || !Juego.ajustes.voz) return;
    if (!seguir) this.callar();
    for (const { el, texto } of bloques) {
      const t = plain(texto);
      if (!t) continue;
      const u = this.frase(t);
      u.onstart = () => {
        document.querySelectorAll('.leyendo').forEach(x => x.classList.remove('leyendo'));
        if (el && el.isConnected) el.classList.add('leyendo');
      };
      u.onend = () => { if (el) el.classList.remove('leyendo'); };
      try { speechSynthesis.speak(u); } catch (e) { /* nada */ }
    }
  },
  // Espera a que termine de hablar (máximo unos segundos), para no cortar la lectura de una rama.
  async fin(max = 9000) {
    if (!this.hay || !Juego.ajustes.voz) return;
    const t0 = Date.now();
    await new Promise(r => setTimeout(r, 250));
    while ((speechSynthesis.speaking || speechSynthesis.pending) && Date.now() - t0 < max) await new Promise(r => setTimeout(r, 120));
  },
};
if (Voz.hay) { Voz.elegir(); try { speechSynthesis.onvoiceschanged = () => Voz.elegir(); } catch (e) { /* nada */ } }

// Convierte HTML en texto para leer en voz alta.
function plain(h) {
  const d = document.createElement('div');
  d.innerHTML = String(h || '').replace(/<\/(div|li|p|h1|h2|h3|span|b)>/g, '$&. ').replace(/→/g, ', ');
  return d.textContent.replace(/\s+/g, ' ').replace(/(\s*\.\s*){2,}/g, '. ').trim();
}

// Une varios puntos con curvas suaves (para dibujar el camino de una rama).
function caminoSuave(puntos) {
  let d = `M${puntos[0].x},${puntos[0].y}`;
  for (let i = 1; i < puntos.length; i++) {
    const a = puntos[i - 1], b = puntos[i], my = (a.y + b.y) / 2;
    d += ` C${a.x},${my} ${b.x},${my} ${b.x},${b.y}`;
  }
  return d;
}

// El objetivo de la pantalla, arriba en el centro. Siempre una sola tarea.
// esquina = true lo pone arriba a la derecha (para no tapar la copa del árbol).
function objetivo(texto, esquina = false) {
  const o = $('#objetivo');
  o.classList.toggle('esquina', esquina);
  if (!texto) { o.hidden = true; return; }
  o.textContent = '🎯 ' + texto;
  o.hidden = false;
  o.style.animation = 'none'; void o.offsetWidth; o.style.animation = '';
}

// El botón grande de abajo a la derecha (también responde a → y Espacio).
function siguiente(texto, accion) {
  const b = $('#siguiente');
  if (!texto) { b.hidden = true; b.onclick = null; return; }
  b.hidden = false;
  b.disabled = false;
  b.textContent = texto;
  b.onclick = () => { Sonido.tocar('clic'); b.hidden = true; accion(); };
}

// Devuelve una promesa que se cumple cuando tocan el botón de siguiente.
function esperarSiguiente(texto) {
  return new Promise(r => siguiente(texto, r));
}

function sacudir(el) {
  el.classList.remove('mal'); void el.offsetWidth; el.classList.add('mal');
}

// En modo salón aparece este aviso para que el grupo vote levantando la mano.
function aviso() {
  return Juego.ajustes.salon ? '<span class="voto">🙋 Voten levantando la mano</span>' : '';
}

// Posición de un elemento dentro del lienzo, en coordenadas del escenario (1600x900).
// Divido por la escala porque getBoundingClientRect mide en píxeles reales de la pantalla.
function posicion(el, lienzo) {
  const a = el.getBoundingClientRect(), b = lienzo.getBoundingClientRect(), s = Juego.escala;
  return { x: (a.left - b.left) / s, y: (a.top - b.top) / s, w: a.width / s, h: a.height / s };
}

// Crea una capa SVG encima del lienzo para dibujar líneas.
function capaSVG(lienzo, clase) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', clase);
  svg.setAttribute('viewBox', '0 0 1600 726');
  svg.setAttribute('width', '1600'); svg.setAttribute('height', '726');
  lienzo.appendChild(svg);
  return svg;
}

// Dibuja una curva de (x1,y1) a (x2,y2) con el color indicado.
function curva(svg, x1, y1, x2, y2, color, retraso = 0) {
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const my = (y1 + y2) / 2;
  p.setAttribute('d', `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`);
  p.setAttribute('stroke', color);
  p.style.animationDelay = retraso + 'ms';
  svg.appendChild(p);
  return p;
}

// Si alguien salta directo a una fase (presentando), lleno lo que debía encontrar antes.
function asegurarEncontradas() {
  if (Juego.encontradas.length < FALLAS.length) Juego.encontradas = FALLAS.map(f => f.id);
}

const colorDe = comp => getComputedStyle(document.documentElement).getPropertyValue('--' + comp).trim();
