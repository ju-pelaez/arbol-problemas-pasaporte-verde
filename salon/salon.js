// salon.js
// Reto del salón: el proyector es la "sala" y cada celular es un control.
//   - Sin parámetros:      pantalla de inicio (abrir sala o unirme).
//   - ?sala=CODIGO:        el celular de un jugador.
// Conexión: PeerJS (WebRTC). El proyector crea un "peer" con un nombre fijo (arbolvivo-salon-CODIGO)
// y los celulares se conectan a ese nombre. Los mensajes son objetos pequeños: {t:'hola'}, {t:'resp'}…
// Está pensado para un salón entero (20, 30, 50 personas): cada jugador tiene un id que se guarda
// en su celular, así que si se le bloquea la pantalla o se le cae el internet vuelve con sus puntos.

const $ = (s, r = document) => r.querySelector(s);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const app = $('#app');
const params = new URLSearchParams(location.search);
const PREFIJO = 'arbolvivo-salon-';
const TIEMPO = 20;                                            // segundos por reto
const COLORES = ['#E2533D', '#2B7BB9', '#C99300', '#1E8C4E']; // colores de las respuestas
const COLOR_COMP = ['#1E8C4E', '#2B7BB9', '#D0661C', '#C99300']; // actores, datos, procesos, control
const FORMAS = ['▲', '◆', '●', '■'];                          // figuras: no hay que depender solo del color
const AVATARES = ['🦜', '🐆', '🐸', '🦋', '🐒', '🐢', '🐊', '🦥', '🐝', '🌺', '🍄', '🐟', '🦉', '🐍', '🌽', '🍫', '🦚', '🐞'];
// Los 4 equipos son los 4 componentes del sistema: así cada uno "es" una raíz del árbol.
const EQUIPOS = [
  { n: 'Actores',  ic: '👥', c: '#1E8C4E' },
  { n: 'Datos',    ic: '📊', c: '#2B7BB9' },
  { n: 'Procesos', ic: '🔁', c: '#D0661C' },
  { n: 'Control',  ic: '🎯', c: '#C99300' },
];
const REACCIONES = ['🔥', '👏', '🌳', '😮'];
// Servidores STUN: le ayudan a cada celular a encontrar su dirección pública para conectarse.
const ICE = { config: { iceServers: [
  { urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }, { urls: 'stun:stun.cloudflare.com:3478' },
] } };

const colorDe = (reto, i) => (reto.tipo === 'falla' ? COLOR_COMP : COLORES)[i];
const segs = ms => (ms / 1000).toFixed(1).replace('.', ',') + ' s';

// Sonidos cortos sin archivos (Web Audio).
let ctxAudio = null;
function sonar(tipo) {
  try { ctxAudio = ctxAudio || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  const notas = { bien: [[660, .08], [990, .15]], mal: [[220, .15]], tic: [[880, .03]], logro: [[523, .1], [659, .1], [784, .1], [1047, .3]], entra: [[700, .05], [940, .07]], pop: [[1200, .03]] }[tipo] || [];
  let t = ctxAudio.currentTime;
  for (const [f, d] of notas) {
    const o = ctxAudio.createOscillator(), g = ctxAudio.createGain();
    o.type = tipo === 'mal' ? 'square' : 'triangle'; o.frequency.value = f;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(tipo === 'mal' ? .05 : tipo === 'pop' ? .04 : .14, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g).connect(ctxAudio.destination); o.start(t); o.stop(t + d + .02); t += d * .9;
  }
}

// ---------- movimiento ----------
const SIN_MOVIMIENTO = matchMedia('(prefers-reduced-motion: reduce)').matches;
// Cambio de pantalla con View Transitions (la pantalla vieja se desenfoca y la nueva entra enfocándose).
let enTransicion = false;   // mientras cambia la pantalla, un segundo clic no hace nada (no se salta un reto)
function transicion(fn) {
  if (enTransicion) return;
  if (SIN_MOVIMIENTO || !document.startViewTransition) return fn();
  enTransicion = true;
  const vt = document.startViewTransition(fn);
  vt.updateCallbackDone.finally(() => { enTransicion = false; });
  vt.ready.catch(() => {}); vt.finished.catch(() => {});   // si otra transición la interrumpe, no es un error
}
// Los números de puntos suben contando, en vez de aparecer de golpe.
function contar(raiz = document) {
  raiz.querySelectorAll('[data-cuenta]').forEach(el => {
    const fin = +el.dataset.cuenta, t0 = performance.now(), dur = 900;
    if (SIN_MOVIMIENTO) { el.textContent = fin; return; }
    const paso = ahora => {
      const x = Math.min(1, (ahora - t0) / dur), e = 1 - Math.pow(1 - x, 3);
      el.textContent = Math.round(fin * e);
      if (x < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  });
}
// Chispas que salen de una pieza del árbol cuando crece.
function chispas(raiz, id) {
  if (SIN_MOVIMIENTO) return;
  const el = raiz.querySelector('#' + id), svg = el && el.ownerSVGElement;
  if (!svg) return;
  const b = el.getBBox(), cx = b.x + b.width / 2, cy = b.y + b.height / 2;
  const colores = ['#FFC23D', '#2FBF71', '#FFF7E8', '#FF8A3D'];
  for (let n = 0; n < 14; n++) {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    const ang = n / 14 * Math.PI * 2, dist = 40 + Math.random() * 40;
    c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', 2.5 + Math.random() * 3);
    c.setAttribute('fill', colores[n % 4]);
    c.classList.add('chispa');
    c.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
    c.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
    c.style.animationDelay = (Math.random() * 120) + 'ms';
    svg.appendChild(c);
    setTimeout(() => c.remove(), 1200);
  }
}

// Confeti para el final (canvas encima de todo, 5 segundos).
function confeti() {
  const cv = document.createElement('canvas'), g = cv.getContext('2d');
  cv.className = 'confeti'; document.body.appendChild(cv);
  const W = cv.width = innerWidth, H = cv.height = innerHeight;
  const colores = ['#FFC23D', '#2FBF71', '#2B7BB9', '#E2533D', '#D0661C', '#FFF7E8'];
  if (SIN_MOVIMIENTO) { cv.remove(); return; }
  // Sale disparado desde las dos esquinas de abajo, como cañones.
  const ps = Array.from({ length: 220 }, (_, n) => {
    const izq = n % 2 === 0, ang = (izq ? -60 : -120) * Math.PI / 180 + (Math.random() - .5) * .7, vel = 700 + Math.random() * 700;
    return { x: izq ? -10 : W + 10, y: H * .85, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel, r: Math.random() * 6, vr: (Math.random() - .5) * 10,
      fase: Math.random() * 6, vf: 6 + Math.random() * 8, w: 7 + Math.random() * 8, h: 4 + Math.random() * 5, c: colores[Math.floor(Math.random() * colores.length)] };
  });
  let antes = performance.now(); const fin = antes + 5000;
  (function cuadro(ahora) {
    const dt = Math.min(.05, (ahora - antes) / 1000); antes = ahora;
    g.clearRect(0, 0, W, H);
    for (const p of ps) {
      p.vy += 900 * dt;                       // gravedad
      p.vx *= Math.pow(.35, dt); p.vy *= Math.pow(.55, dt);   // el aire lo frena
      p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; p.fase += p.vf * dt;
      g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.scale(1, Math.cos(p.fase)); g.fillStyle = p.c; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); g.restore();
    }
    if (ahora < fin) requestAnimationFrame(cuadro); else cv.remove();
  })(antes);
}

// ------------------------------------------------------------------ inicio
function inicio() {
  app.innerHTML = `<div class="inicio">
    <h1>Reto del <em>salón</em></h1>
    <p>Todos responden desde el celular, en 4 equipos. Cuando la mayoría acierta, el árbol de problemas crece en el proyector.</p>
    <div class="dos">
      <button class="btn" id="abrir">📽️ Abrir la sala<small>En el computador del proyector</small></button>
      <button class="btn sec" id="unirme">📱 Unirme con un código<small>En tu celular</small></button>
    </div>
    <p style="margin-top:14px"><a href="../">← Volver al juego</a></p>
  </div>`;
  $('#abrir').onclick = () => { sonar('tic'); anfitrion(); };
  $('#unirme').onclick = () => { sonar('tic'); pedirCodigo(); };
}

function pedirCodigo() {
  app.innerHTML = `<div class="cel">
    <div class="avatar">📱</div><h1>Entrar a la sala</h1><p>Escribe el código que sale en el proyector.</p>
    <input id="cod" maxlength="4" autocomplete="off" autocapitalize="characters" placeholder="ABCD">
    <button class="btn" id="ir">Entrar →</button></div>`;
  const ir = () => { const c = $('#cod').value.trim().toUpperCase(); if (c.length === 4) location.search = '?sala=' + c; };
  $('#ir').onclick = ir;
  $('#cod').onkeydown = e => { if (e.key === 'Enter') ir(); };
  $('#cod').focus();
}

// ------------------------------------------------------------------ el árbol del salón (SVG)
// Cada pieza tiene un id; empieza "fantasma" (punteada) y se vuelve "viva" cuando el salón acierta.
function arbolSVG() {
  const raiz = (id, x, color) => `<path id="${id}" class="pz raiz" pathLength="1" style="--c:${color}" d="M200,300 C200,340 ${x},330 ${x},372"/>`;
  return `<svg viewBox="0 0 400 400" role="img" aria-label="El árbol del salón">
    <rect id="suelo" class="pz" x="20" y="372" width="360" height="22" rx="10" style="fill:none"/>
    ${raiz('r-act', 70, 'var(--act)')}${raiz('r-dat', 150, 'var(--dat)')}${raiz('r-pro', 250, 'var(--pro)')}${raiz('r-con', 330, 'var(--con)')}
    <path id="tronco" class="pz" d="M178,300 L186,175 L214,175 L222,300 Z"/>
    <circle id="h1" class="pz" cx="125" cy="150" r="62"/>
    <circle id="h3" class="pz" cx="275" cy="150" r="62"/>
    <circle id="h2" class="pz" cx="200" cy="100" r="78"/>
    <circle id="fruto" class="pz" cx="236" cy="92" r="16"/>
  </svg>`;
}
const COLOR_PIEZA = { suelo: '#7A5634', tronco: '#7A4E2D', h1: '#3FA35B', h2: '#4DB86A', h3: '#2F8F4E', fruto: '#FFC23D' };
function pintarPieza(raiz, id, estado, nueva) {
  const el = raiz.querySelector('#' + id);
  if (!el) return;
  el.classList.remove('viva', 'floja', 'meta', 'nueva');
  if (estado) el.classList.add(estado);
  if (nueva) el.classList.add('nueva');
  if (estado === 'viva' && COLOR_PIEZA[id]) el.style.fill = COLOR_PIEZA[id];
}

// ------------------------------------------------------------------ PROYECTOR
function anfitrion() {
  const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const nuevoCodigo = () => Array.from({ length: 4 }, () => ALFABETO[Math.floor(Math.random() * ALFABETO.length)]).join('');
  let codigo = nuevoCodigo(), peer = null, conectado = false;
  const jugadores = new Map();        // id del jugador -> { nombre, avatar, equipo, puntos, racha, mejor, aciertos, msBien, conn, enLinea }
  const porConexion = new Map();      // id de la conexión -> id del jugador
  let retos = armarRetos(), i = -1, estado = 'sala', inicio = 0, reloj = null;
  const respuestas = new Map();       // id del jugador -> { k, ms }
  const piezas = {};                  // id de pieza -> 'viva' | 'floja'

  const enviar = (conn, msg) => { try { if (conn && conn.open) conn.send(msg); } catch (e) { /* se fue */ } };
  const todos = () => [...jugadores.values()];
  const enLinea = () => todos().filter(j => j.enLinea);
  const enviarA = (j, msg) => { j.ultimoMsg = msg; enviar(j.conn, msg); };   // guarda el último mensaje de cada jugador
  const aTodos = msg => jugadores.forEach(j => enviarA(j, msg));
  const ranking = () => todos().sort((a, b) => b.puntos - a.puntos);
  // Al entrar, cada jugador va al equipo que tenga menos gente.
  const equipoMenor = () => { const n = [0, 0, 0, 0]; jugadores.forEach(j => n[j.equipo]++); return n.indexOf(Math.min(...n)); };
  // Puntaje del equipo = promedio de sus jugadores (así no gana el equipo más grande).
  const equipos = () => EQUIPOS.map((e, k) => {
    const m = todos().filter(j => j.equipo === k);
    return { ...e, k, cant: m.length, prom: m.length ? Math.round(m.reduce((s, j) => s + j.puntos, 0) / m.length) : 0 };
  }).sort((a, b) => b.prom - a.prom);
  const bienvenida = j => ({ t: 'bienvenido', nombre: j.nombre, avatar: j.avatar, equipo: j.equipo, puntos: j.puntos });

  function abrirPeer() {
    peer = new Peer(PREFIJO + codigo, ICE);
    peer.on('open', () => { conectado = true; if (estado === 'sala') pintarSala(); });
    // Si se cae el enlace con el servidor de PeerJS, los que ya entraron siguen jugando; solo hay que reconectar para recibir nuevos.
    peer.on('disconnected', () => { setTimeout(() => { try { if (!peer.destroyed) peer.reconnect(); } catch (e) { /* lo intenta el próximo */ } }, 1500); });
    peer.on('error', e => {
      if (e.type === 'unavailable-id' && !jugadores.size) { codigo = nuevoCodigo(); peer.destroy(); abrirPeer(); return; }
      if (['network', 'server-error', 'socket-error', 'socket-closed', 'disconnected'].includes(e.type)) return;
      if (e.type === 'peer-unavailable') return;
      conectado = false;
      if (estado === 'sala') pintarSala(`No hay conexión para celulares (${e.type}). Pueden jugar votando con la mano.`);
    });
    peer.on('connection', conn => {
      conn.on('data', d => recibir(conn, d));
      conn.on('close', () => salio(conn));
      conn.on('error', () => salio(conn));
    });
  }

  function salio(conn) {
    const pid = porConexion.get(conn.peer);
    porConexion.delete(conn.peer);
    const j = pid && jugadores.get(pid);
    if (!j || j.conn !== conn) return;
    j.enLinea = false;
    if (estado === 'sala') pintarJugadores();
    if (estado === 'pregunta') { actualizarMuro(); if (enLinea().length && respuestas.size >= enLinea().length) revelar(); }
  }

  function recibir(conn, d) {
    if (!d || typeof d !== 'object') return;
    if (d.t === 'hola') {
      const pid = String(d.pid || conn.peer).slice(0, 40);
      let j = jugadores.get(pid);
      if (j) {
        // Vuelve alguien que ya estaba: se le cambia la conexión y conserva sus puntos.
        if (j.conn && j.conn !== conn) { porConexion.delete(j.conn.peer); try { j.conn.close(); } catch (e) { /* ya estaba cerrada */ } }
        j.conn = conn; j.enLinea = true;
      } else {
        const nombre = String(d.nombre || '').trim().slice(0, 14) || 'Jugador';
        j = { nombre, avatar: AVATARES[jugadores.size % AVATARES.length], equipo: equipoMenor(), puntos: 0, racha: 0, mejor: 0, aciertos: 0, msBien: 0, conn, enLinea: true, nuevo: true };
        jugadores.set(pid, j);
        sonar('entra');
      }
      porConexion.set(conn.peer, pid);
      const vuelve = !!j.ultimoMsg;
      enviar(conn, { ...bienvenida(j), vuelve });
      if (estado === 'sala') pintarJugadores();
      if (estado === 'pregunta') { enviar(conn, respuestas.has(pid) ? { t: 'esperar' } : mensajePregunta()); actualizarMuro(); }
      else if (vuelve && estado !== 'sala') enviar(conn, j.ultimoMsg);   // vuelve a la pantalla donde iba
      return;
    }
    const pid = porConexion.get(conn.peer), j = pid && jugadores.get(pid);
    if (!j) return;
    if (d.t === 'avance' && estado === 'pregunta' && d.id === i && Array.isArray(d.sel)) parciales.set(pid, d.sel.slice(0, 12).map(x => x | 0));
    if (d.t === 'resp' && estado === 'pregunta' && d.id === i && !respuestas.has(pid)) {
      const ms = performance.now() - inicio;
      respuestas.set(pid, Array.isArray(d.sel) ? { sel: d.sel.slice(0, 12).map(x => x | 0), ms } : { k: Math.max(0, Math.min(3, d.k | 0)), ms });
      sonar('pop');
      actualizarMuro(pid);
      if (respuestas.size >= enLinea().length) revelar();
    }
    if (d.t === 'reac' && REACCIONES.includes(d.e)) {
      const ahora = performance.now();
      if (ahora - (j.ultReac || 0) < 1200) return;   // máximo una reacción cada 1,2 s por persona
      j.ultReac = ahora;
      flotar(d.e, j);
    }
  }

  // Reacciones que suben por la pantalla del proyector.
  function flotar(emoji, j) {
    if (document.querySelectorAll('.flota').length > 40) return;
    const el = document.createElement('div');
    el.className = 'flota';
    el.style.left = (4 + Math.random() * 88) + '%';
    el.style.setProperty('--c', EQUIPOS[j.equipo].c);
    el.style.setProperty('--dx', (Math.random() * 80 - 40) + 'px');
    el.innerHTML = `<span class="mece">${emoji}</span><small>${esc(j.nombre)}</small>`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  function pintarSala(aviso) {
    estado = 'sala';
    const url = location.origin + location.pathname + '?sala=' + codigo;
    const qr = qrcode(0, 'M'); qr.addData(url); qr.make();
    app.innerHTML = `<div class="proy">
      <div class="cab"><div class="titulo"><small>ÁRBOL DE PROBLEMAS</small>Reto del salón</div><span class="pill grande-pill" id="njug"></span><a class="pill" href="../">← Juego</a></div>
      <div class="sala">
        <div class="qr">${qr.createSvgTag({ cellSize: 8, margin: 2, scalable: true })}
          <div>Código de la sala</div><div class="cod">${codigo}</div><div class="url">${esc(location.host + location.pathname)}</div>
          <div class="estado ${conectado ? 'ok' : 'mal'}">${aviso ? esc(aviso) : conectado ? '✓ Sala lista: escaneen el QR' : 'Conectando…'}</div></div>
        <div class="lobby">
          <h2>¡Construyamos el árbol entre todos!</h2>
          <p>Escaneen el QR y escriban su nombre. Cada uno cae en un equipo: <b>Actores, Datos, Procesos o Control</b>. Pueden hablar con su equipo: gana el que tenga mejor promedio. Cuando la mayoría del salón acierta, el árbol crece.</p>
          <div class="equipos" id="equipos"></div>
          <div class="acciones">
            <button class="btn" id="empezar" disabled>▶ Empezar</button>
            <button class="btn sec" id="manos">🙋 Jugar sin celulares</button>
          </div>
        </div>
      </div>
      <div></div></div>`;
    pintarJugadores();
    $('#empezar').onclick = () => { retos = armarRetos(); i = -1; transicion(siguiente); };
    $('#manos').onclick = () => { retos = armarRetos(); i = -1; siguiente(); };
  }

  // Solo se repintan los equipos (no el QR) cada vez que entra alguien.
  function pintarJugadores() {
    const caja = $('#equipos'); if (!caja) return;
    const lista = todos(), n = enLinea().length;
    caja.innerHTML = EQUIPOS.map((e, k) => {
      const m = lista.filter(j => j.equipo === k);
      return `<div class="equipo" style="--c:${e.c}"><div class="eq-cab">${e.ic} ${e.n}<b>${m.length}</b></div>
        <div class="eq-jug">${m.map(j => `<span class="jug${j.nuevo ? ' nuevo' : ''}${j.enLinea ? '' : ' fuera'}">${j.avatar} ${esc(j.nombre)}</span>`).join('') || '<span class="vacio">—</span>'}</div></div>`;
    }).join('');
    lista.forEach(j => { j.nuevo = false; });
    $('#njug').textContent = n ? `👥 ${n} conectado${n === 1 ? '' : 's'}` : 'Esperando jugadores…';
    const b = $('#empezar'); b.disabled = !n; b.textContent = n ? `▶ Empezar con ${n} jugador${n === 1 ? '' : 'es'}` : '▶ Empezar';
  }

  const mensajePregunta = () => {
    const r = retos[i];
    const m = { t: 'pregunta', id: i, n: i + 1, total: retos.length, titulo: r.titulo, texto: r.texto, tipo: r.tipo };
    if (r.tipo === 'clasifica') { m.items = r.items; m.comps = COMPS.map((c, k) => ({ txt: c.t, ic: c.ic, color: COLOR_COMP[k] })); }
    else if (r.tipo === 'ordena') m.items = r.items;
    else if (r.tipo === 'une') { m.izq = r.izq; m.der = r.der; m.colores = COLOR_COMP; }
    else m.opciones = r.opciones.map((o, k) => ({ txt: o.txt, ic: o.ic, color: colorDe(r, k), forma: FORMAS[k] }));
    return m;
  };
  const esJuego = r => !!r.correctas;   // unir, ordenar o clasificar
  const ETIQUETA = { falla: '🍫 El viaje de Don Arley', parte: '🌳 Partes del árbol', clasifica: '🌧️ Lluvia de fallas · en el celular', ordena: '🧩 Ordenar · en el celular', une: '🔗 Unir · en el celular' };

  function siguiente() {
    i++;
    if (i >= retos.length) return final();
    const cap = CAPITULOS_SALON.findIndex(c => c.desde === i);
    if (cap >= 0) return capitulo(cap);
    pregunta();
  }

  // Presentación de cada capítulo: el árbol muestra qué piezas se van a jugar.
  function capitulo(n) {
    estado = 'capitulo';
    const c = CAPITULOS_SALON[n], cuantos = (CAPITULOS_SALON[n + 1] ? CAPITULOS_SALON[n + 1].desde : retos.length) - c.desde;
    app.innerHTML = `<div class="proy"><div class="cab"><div class="titulo"><small>RETO DEL SALÓN</small>${enLinea().length ? `👥 ${enLinea().length} jugando` : 'Árbol de problemas'}</div><span class="pill">Capítulo ${n + 1} de ${CAPITULOS_SALON.length}</span></div>
      <div class="cap">
        <div class="cap-txt">
          <div class="cap-num">CAPÍTULO ${n + 1}</div>
          <div class="cap-ic">${c.ic}</div>
          <h1>${esc(c.t)}</h1>
          <p>${esc(c.txt)}</p>
          <div class="cap-retos">${cuantos} reto${cuantos === 1 ? '' : 's'} · ${TIEMPO} s cada uno${n === CAPITULOS_SALON.length - 1 ? ' · ⭐ puntos dobles' : ''}</div>
        </div>
        <div class="arbol">${arbolSVG()}<div class="rotulo">Lo que vamos a construir</div></div>
      </div>
      <div class="pie"><span class="info"></span><button class="btn" id="vamos">¡Vamos! →</button></div></div>`;
    Object.entries(piezas).forEach(([id, e]) => pintarPieza(app, id, e));
    c.piezas.forEach(id => { const el = app.querySelector('#' + id); if (el) el.classList.add('meta'); });
    aTodos({ t: 'capitulo', n: n + 1, total: CAPITULOS_SALON.length, ic: c.ic, titulo: c.t, texto: c.txt });
    sonar('logro');
    $('#vamos').onclick = cuenta;
    // El título del capítulo se descubre palabra por palabra.
    const h1 = app.querySelector('.cap h1');
    h1.innerHTML = c.t.split(' ').map((p, k) => `<span class="pal" style="animation-delay:${250 + k * 90}ms">${esc(p)}</span>`).join(' ');
  }

  // Cuenta regresiva 3, 2, 1 antes del primer reto del capítulo.
  function cuenta() {
    if (estado !== 'capitulo') return;
    estado = 'cuenta';
    aTodos({ t: 'cuenta' });
    let n = 3;
    const capa = document.createElement('div');
    capa.className = 'cuenta';
    document.body.appendChild(capa);
    const paso = () => {
      if (n === 0) { capa.classList.add('sale'); setTimeout(() => capa.remove(), 250); pregunta(); return; }
      capa.innerHTML = `<i class="anillo"></i><span>${n}</span>`;
      sonar('tic');
      n--;
      setTimeout(paso, 750);
    };
    paso();
  }

  // Lo que se ve en el proyector mientras se juega cada tipo de reto.
  function tareaHTML(r) {
    if (r.tipo === 'clasifica') return `<div class="tarea"><div class="leyenda">${COMPS.map((c, k) => `<span style="--c:${COLOR_COMP[k]}">${c.ic} ${c.t}</span>`).join('')}</div>
      <div class="cartas">${r.items.map((t, n) => `<div class="carta" style="animation-delay:${n * 60}ms"><b>${n + 1}</b><span>${esc(t)}</span></div>`).join('')}</div></div>`;
    if (r.tipo === 'ordena') return `<div class="tarea"><div class="fichas">${r.items.map((t, n) => `<div class="ficha" style="animation-delay:${n * 80}ms">${esc(t)}</div>`).join('')}</div></div>`;
    if (r.tipo === 'une') return `<div class="tarea une"><div class="col">${r.izq.map((t, n) => `<div class="ficha izq" style="--c:${COLOR_COMP[n]}">${esc(t)}</div>`).join('')}</div>
      <div class="col">${r.der.map((t, n) => `<div class="ficha" style="animation-delay:${n * 80}ms">${esc(t)}</div>`).join('')}</div></div>`;
    return `<div class="ops">${r.opciones.map((o, k) => `<button class="op" data-k="${k}" style="--c:${colorDe(r, k)};animation-delay:${k * 80}ms"><span class="f">${FORMAS[k]}</span>${o.ic ? o.ic + ' ' : ''}${esc(o.txt)}<span class="votos"></span><i class="barra"></i></button>`).join('')}</div>`;
  }

  // La solución de los juegos, con el porcentaje del salón que acertó cada parte.
  function solucionHTML(r, pct) {
    const p = n => `<span class="pct">${pct[n]} %</span>`;
    if (r.tipo === 'clasifica') return `<div class="cartas">${r.items.map((t, n) => `<div class="carta sol" style="--c:${COLOR_COMP[r.correctas[n]]}"><b>${COMPS[r.correctas[n]].ic}</b><span>${esc(t)}<small>${COMPS[r.correctas[n]].t}</small></span>${p(n)}</div>`).join('')}</div>`;
    if (r.tipo === 'ordena') return `<div class="fichas orden">${r.correctas.map((ix, n) => `<div class="ficha sol"><b>${n + 1}</b>${esc(r.items[ix])}${p(n)}</div>`).join('')}</div>`;
    if (r.tipo === 'une') return `<div class="pares">${r.izq.map((t, n) => `<div class="par" style="--c:${COLOR_COMP[n]}"><span class="ficha izq">${esc(t)}</span><i>→</i><span class="ficha">${esc(r.der[r.correctas[n]])}</span>${p(n)}</div>`).join('')}</div>`;
    return '';
  }

  let limite = TIEMPO;
  const parciales = new Map();   // lo que lleva cada uno en la lluvia de fallas, por si se acaba el tiempo

  function pregunta() {
    estado = 'pregunta';
    respuestas.clear(); parciales.clear();
    const r = retos[i], hay = enLinea().length > 0;
    limite = r.tiempo || TIEMPO;
    app.innerHTML = `<div class="proy">
      <div class="cab"><div class="titulo"><small>RETO ${i + 1} DE ${retos.length}</small>${esc(r.titulo)}</div>${i === retos.length - 1 ? '<span class="pill rayo">⭐ PUNTOS DOBLES</span>' : ''}${esJuego(r) && hay ? '<span class="pill rayo">📱 ¡Juéguenlo en el celular!</span>' : ''}<span class="pill" id="cuenta">${hay ? '' : '🙋 Respondan en voz alta'}</span></div>
      <div class="reto">
        <div>
          <div class="enunciado"><div class="tipo">${ETIQUETA[r.tipo] || '❓ Pregunta'}</div><div class="texto">${esc(r.texto)}</div></div>
          ${tareaHTML(r)}
          <div class="reloj"><i id="barra"></i></div>
          ${hay ? '<div class="muro" id="muro"></div>' : ''}
        </div>
        <div class="lado arbol">${arbolSVG()}<div class="rotulo">El árbol del salón</div></div>
      </div>
      <div class="pie"><span class="info" id="seg">${limite} s</span><button class="btn sec" id="revelar">Revelar respuesta ⏭</button></div></div>`;
    Object.entries(piezas).forEach(([id, e]) => pintarPieza(app, id, e));
    if (r.pieza) { const el = app.querySelector('#' + r.pieza); if (el) el.classList.add('meta'); }
    actualizarMuro();
    aTodos(mensajePregunta());
    // Sin celulares, el presentador toca la opción que eligió el salón.
    app.querySelectorAll('.op').forEach(b => b.onclick = () => { if (estado !== 'pregunta' || enLinea().length) return; respuestas.set('salon', { k: +b.dataset.k, ms: 0 }); revelar(); });
    $('#revelar').onclick = revelar;
    inicio = performance.now();
    clearInterval(reloj);
    reloj = setInterval(() => {
      const quedan = Math.max(0, limite - (performance.now() - inicio) / 1000);
      const b = $('#barra'), sg = $('#seg');
      if (b) b.style.transform = `scaleX(${quedan / limite})`;
      if (sg) sg.textContent = Math.ceil(quedan) + ' s';
      if (quedan <= 0) revelar();
    }, 200);
  }

  // El muro: un círculo por jugador conectado que se enciende cuando responde.
  function actualizarMuro(recien) {
    const muro = $('#muro'), cuenta = $('#cuenta');
    const lista = [...jugadores.entries()].filter(([, j]) => j.enLinea);
    if (cuenta && lista.length) cuenta.textContent = `${respuestas.size}/${lista.length} respondieron`;
    if (!muro) return;
    if (recien) {   // solo se enciende el que acaba de responder
      const el = muro.querySelector(`[data-pid="${CSS.escape(recien)}"]`);
      if (el) { el.classList.add('ya'); return; }
    }
    muro.innerHTML = lista.map(([pid, j]) => `<span class="mu${respuestas.has(pid) ? ' ya' : ''}" data-pid="${esc(pid)}" style="--c:${EQUIPOS[j.equipo].c}" title="${esc(j.nombre)}">${j.avatar}</span>`).join('');
  }

  function revelar() {
    if (estado !== 'pregunta') return;
    estado = 'revelado';
    clearInterval(reloj);
    const r = retos[i], juego = esJuego(r), votos = [0, 0, 0, 0];
    // En la lluvia de fallas cuenta lo que alcanzó a clasificar quien no terminó.
    if (juego) parciales.forEach((sel, pid) => { if (!respuestas.has(pid)) respuestas.set(pid, { sel, ms: limite * 1000, parcial: true }); });
    // Qué tanto acertó cada respuesta: 1 = todo bien; en los juegos puede ser parcial (3 de 4 = 0,75).
    const fraccion = v => !v ? 0 : juego ? r.correctas.reduce((a, c, n) => a + (v.sel && v.sel[n] === c ? 1 : 0), 0) / r.correctas.length : (v.k === r.correcta ? 1 : 0);
    respuestas.forEach(v => { if (v.k != null) votos[v.k]++; });
    const total = respuestas.size;
    const prom = total ? [...respuestas.values()].reduce((a, v) => a + fraccion(v), 0) / total : 0;
    const acerto = total > 0 && prom >= .5;
    if (r.pieza) piezas[r.pieza] = acerto ? 'viva' : 'floja';
    sonar(acerto ? 'bien' : 'mal');

    // Puntos: 500 × lo que acertó + hasta 500 por rapidez (si quedó perfecto) + 100 por cada acierto seguido.
    let rapido = null;
    const doble = i === retos.length - 1 ? 2 : 1;
    jugadores.forEach((j, pid) => {
      const v = respuestas.get(pid), f = fraccion(v), ok = f === 1;
      j.racha = ok ? j.racha + 1 : 0;
      j.mejor = Math.max(j.mejor, j.racha);
      const gano = Math.round((500 * f + (ok ? 500 * Math.max(0, 1 - v.ms / (limite * 1000)) + Math.max(0, j.racha - 1) * 100 : 0)) * doble);
      if (ok) { j.aciertos++; j.msBien += v.ms; if (!rapido || v.ms < rapido.ms) rapido = { j, ms: v.ms }; }
      j.puntos += gano;
      j.ultimo = v ? { ok, gano, bien: juego ? Math.round(f * r.correctas.length) : null } : null;
    });
    const orden = ranking(), eqs = equipos();
    jugadores.forEach(j => {
      enviarA(j, { t: 'resultado', ok: !!(j.ultimo && j.ultimo.ok), respondio: !!j.ultimo, gano: j.ultimo ? j.ultimo.gano : 0, puntos: j.puntos, puesto: orden.indexOf(j) + 1, de: orden.length,
        racha: j.racha, eqPuesto: eqs.findIndex(e => e.k === j.equipo) + 1, porque: r.porque,
        correcta: juego ? null : r.opciones[r.correcta].txt, bien: j.ultimo ? j.ultimo.bien : null, partes: juego ? r.correctas.length : null });
      j.ultimo = null;
    });

    if (juego) {
      // Porcentaje del salón que acertó cada ficha.
      const pct = r.correctas.map((c, n) => total ? Math.round([...respuestas.values()].filter(v => v.sel && v.sel[n] === c).length / total * 100) : 0);
      const tarea = app.querySelector('.tarea');
      tarea.className = 'tarea';
      tarea.innerHTML = solucionHTML(r, pct);
    }
    app.querySelectorAll('.op').forEach(b => {
      const k = +b.dataset.k;
      b.classList.add(k === r.correcta ? 'correcta' : 'atenuada');
      if (total) { b.querySelector('.votos').textContent = votos[k]; b.querySelector('.barra').style.transform = `scaleX(${votos[k] / total})`; }
    });
    if (r.pieza) { pintarPieza(app, r.pieza, piezas[r.pieza], true); if (acerto) chispas(app, r.pieza); }
    const top = orden.slice(0, 3).filter(j => j.puntos > 0);
    const muro = $('#muro'); if (muro) muro.remove();
    const perfectos = [...respuestas.values()].filter(v => fraccion(v) === 1).length;
    const dato = juego ? `${Math.round(prom * 100)} % de aciertos · ${perfectos} perfecto${perfectos === 1 ? '' : 's'}` : `${Math.round(prom * 100)} % acertó`;
    const pie = app.querySelector('.reto > div');
    pie.insertAdjacentHTML('beforeend', `<div class="porque">${!total ? '⏱ Nadie respondió.' : acerto ? `🌱 <b>¡El salón acertó (${dato})!</b> ${r.pieza ? 'El árbol crece.' : '¡Ronda bonus superada!'}` : `🔁 <b>Esta se nos escapó (${dato}).</b> ${r.pieza ? 'La pieza queda marcada para repasar.' : ''}`} ${esc(r.porque)}</div>
      ${top.length ? `<div class="top3">${top.map((j, n) => `<span class="pill">${['🥇', '🥈', '🥉'][n]} ${j.avatar} ${esc(j.nombre)} · ${j.puntos}</span>`).join('')}${rapido ? `<span class="pill rayo">⚡ Más rápido: ${esc(rapido.j.nombre)} (${segs(rapido.ms)})</span>` : ''}</div>` : ''}`);
    $('#seg').textContent = acerto ? '✔ ¡Bien, salón!' : 'Respuesta revelada';
    const b = $('#revelar');
    b.className = 'btn';
    if (jugadores.size && i + 1 < retos.length) { b.textContent = 'Ver posiciones 🏆'; b.onclick = () => transicion(posiciones); }
    else { b.textContent = i + 1 < retos.length ? 'Siguiente reto →' : 'Ver el árbol final 🌳'; b.onclick = () => transicion(siguiente); }
  }

  // Tabla de posiciones: los 10 mejores y la carrera de los 4 equipos.
  function posiciones() {
    estado = 'posiciones';
    const orden = ranking(), max = Math.max(1, orden[0] ? orden[0].puntos : 1);
    const eqs = equipos(), maxEq = Math.max(1, eqs[0].prom);
    const fila = (j, n) => `<div class="fila" style="animation-delay:${n * 70}ms">
        <span class="pos">${['🥇', '🥈', '🥉'][n] || n + 1}</span><span class="nom"><i class="punto" style="--c:${EQUIPOS[j.equipo].c}"></i>${j.avatar} ${esc(j.nombre)}${j.racha >= 2 ? ` <span class="racha">🔥 ${j.racha}</span>` : ''}</span>
        <span class="bar"><i style="--f:${j.puntos / max};animation-delay:${300 + n * 70}ms"></i></span><span class="pts" data-cuenta="${j.puntos}">0</span></div>`;
    app.innerHTML = `<div class="proy"><div class="cab"><div class="titulo"><small>DESPUÉS DEL RETO ${i + 1} DE ${retos.length}</small>🏆 Así va la competencia</div><span class="pill">${enLinea().length} jugando</span></div>
      <div class="posgrid">
        <div class="tabla">${orden.slice(0, 10).map(fila).join('')}</div>
        <div class="carrera"><h3>Carrera de equipos</h3><p>Promedio de puntos de cada equipo</p>
          ${eqs.map((e, n) => `<div class="eq-fila" style="--c:${e.c};animation-delay:${300 + n * 120}ms"><span class="eq-nom">${['🥇', '🥈', '🥉', '4'][n]} ${e.ic} ${e.n}</span>
            <span class="eq-bar"><i style="--f:${e.prom / maxEq};animation-delay:${500 + n * 120}ms"></i></span><span class="eq-pts" data-cuenta="${e.prom}">0</span></div>`).join('')}
        </div>
      </div>
      <div class="pie"><span class="info sigue">${(c => c ? `🔒 Lo que sigue: <b>Capítulo ${CAPITULOS_SALON.indexOf(c) + 1} · ${esc(c.t)}</b> ${c.ic}` : 'Sigue otro reto de este capítulo')(CAPITULOS_SALON.find(c => c.desde === i + 1))}</span><button class="btn" id="seguir">Seguir →</button></div></div>`;
    sonar('logro');
    contar(app);
    $('#seguir').onclick = () => transicion(siguiente);
  }

  function final() {
    estado = 'final';
    clearInterval(reloj);
    const vivas = Object.values(piezas).filter(e => e === 'viva').length;
    const orden = ranking(), eqs = equipos();
    // Premios: el más rápido en promedio (con 3 aciertos o más) y la racha más larga.
    const rapidos = todos().filter(j => j.aciertos >= 3).sort((a, b) => a.msBien / a.aciertos - b.msBien / b.aciertos);
    const racha = todos().sort((a, b) => b.mejor - a.mejor)[0];
    const premios = [];
    if (orden.length) premios.push(`<div class="premio" style="--c:${eqs[0].c}"><span>${eqs[0].ic}</span><b>Equipo ganador</b>${eqs[0].n} · ${eqs[0].prom} pts</div>`);
    if (rapidos[0]) premios.push(`<div class="premio"><span>⚡</span><b>Más rápido</b>${esc(rapidos[0].nombre)} · ${segs(rapidos[0].msBien / rapidos[0].aciertos)}</div>`);
    if (racha && racha.mejor >= 2) premios.push(`<div class="premio"><span>🔥</span><b>Mejor racha</b>${esc(racha.nombre)} · ${racha.mejor} seguidas</div>`);
    sonar('logro');
    app.innerHTML = `<div class="proy"><div class="cab"><div class="titulo"><small>RETO DEL SALÓN</small>Resultado</div><a class="pill" href="../">← Juego</a></div>
      <div class="final">
        <h2>${vivas >= 10 ? '¡Árbol completo entre todos!' : vivas >= 8 ? '¡Casi completo, salón!' : vivas >= 5 ? '¡Buen árbol, salón!' : '¡Ya tenemos un árbol!'}</h2>
        <div class="final-grid">
          <div class="arbol">${arbolSVG()}<div class="rotulo">${vivas} de ${retos.filter(r => r.pieza).length} piezas firmes</div></div>
          <div>
            ${orden.length ? `<div class="podio">${[1, 0, 2].map(n => orden[n] ? `<div class="p${n + 1}"><span class="av">${orden[n].avatar}</span>${['🥇', '🥈', '🥉'][n]} ${esc(orden[n].nombre)}<br>${orden[n].puntos} pts</div>` : '').join('')}</div>` : ''}
            ${premios.length ? `<div class="premios">${premios.join('')}</div>` : ''}
          </div>
        </div>
        <div class="acciones"><button class="btn" id="otra">↺ Otra partida</button></div>
      </div><div></div></div>`;
    // El árbol final se arma solo, de abajo hacia arriba: suelo, raíces, tronco, copa y fruto.
    ['suelo', 'r-act', 'r-dat', 'r-pro', 'r-con', 'tronco', 'h1', 'h3', 'h2', 'fruto'].forEach((id, n) => {
      const el = app.querySelector('#' + id); if (el) el.style.animationDelay = (n * 160) + 'ms';
    });
    Object.entries(piezas).forEach(([id, e]) => pintarPieza(app, id, e, true));
    if (orden.length) setTimeout(confeti, 1900);
    jugadores.forEach(j => enviarA(j, { t: 'fin', puesto: orden.indexOf(j) + 1, de: orden.length, puntos: j.puntos, piezas: vivas, eqPuesto: eqs.findIndex(e => e.k === j.equipo) + 1, eqGanador: eqs[0].n }));
    $('#otra').onclick = () => {
      Object.keys(piezas).forEach(k => delete piezas[k]);
      jugadores.forEach(j => { j.puntos = 0; j.racha = 0; j.mejor = 0; j.aciertos = 0; j.msBien = 0; j.ultimoMsg = null; enviar(j.conn, bienvenida(j)); });
      pintarSala();
    };
  }

  // Teclado para presentar: → o Espacio avanza; 1-4 elige (sin celulares).
  addEventListener('keydown', e => {
    if (enTransicion) return;
    if (e.key === 'ArrowRight' || e.key === ' ') {
      if (estado === 'pregunta') { e.preventDefault(); revelar(); }
      else if (estado === 'revelado') { e.preventDefault(); $('#revelar').click(); }
      else if (estado === 'posiciones') { e.preventDefault(); siguiente(); }
      else if (estado === 'capitulo') { e.preventDefault(); cuenta(); }
    }
    if (/^[1-4]$/.test(e.key) && estado === 'pregunta' && !enLinea().length) { respuestas.set('salon', { k: +e.key - 1, ms: 0 }); revelar(); }
  });

  pintarSala();
  abrirPeer();
}

// ------------------------------------------------------------------ CELULAR
function jugador(codigo) {
  // El id y el nombre se guardan en el celular: si se recarga la página o se cae la conexión, vuelve solo.
  const CLAVE = 'arbolvivo-yo-' + codigo;
  let guardado = {};
  try { guardado = JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { /* sin almacenamiento */ }
  const yo = { pid: guardado.pid || 'j' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36), nombre: guardado.nombre || '', avatar: '📱', equipo: -1, puntos: 0 };
  let peer = null, conn = null, idPregunta = -1, dentro = false, intentos = 0, reintento = null, espera = null, ultReac = 0;
  const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify({ pid: yo.pid, nombre: yo.nombre })); } catch (e) { /* no pasa nada */ } };
  const vibrar = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { /* no pasa nada */ } };

  // Cada pantalla lleva arriba el equipo y, si se pide, la barra de reacciones abajo.
  let ultimaPantalla = '';
  function pantalla(html, reacciones) {
    const eq = EQUIPOS[yo.equipo];
    // Si es la misma clase de pantalla que la anterior (un toque dentro de un juego), no se repite la animación de entrada.
    const tipo = html.slice(0, 40), quieto = tipo === ultimaPantalla;
    ultimaPantalla = tipo;
    app.innerHTML = `<div class="cel${quieto ? ' quieto' : ''}">${eq ? `<div class="mi-eq" style="--c:${eq.c}">${eq.ic} Equipo ${eq.n} <span>${yo.avatar} ${esc(yo.nombre)} · ${yo.puntos} pts</span></div>` : ''}${html}
      ${reacciones ? `<div class="reac">${REACCIONES.map(e => `<button data-e="${e}" aria-label="Reaccionar ${e}">${e}</button>`).join('')}</div>` : ''}</div>`;
    app.querySelectorAll('.reac button').forEach(b => b.onclick = () => {
      const ahora = Date.now();
      if (ahora - ultReac < 1200 || !conn || !conn.open) return;
      ultReac = ahora;
      conn.send({ t: 'reac', e: b.dataset.e });
      vibrar(15);
      b.classList.remove('salta'); void b.offsetWidth; b.classList.add('salta');
    });
  }

  function pedirNombre(msj) {
    app.innerHTML = `<div class="cel">
      <div class="avatar">🌳</div><h1>Reto del salón</h1><p>Sala <b>${esc(codigo)}</b>. ¿Cómo te llamas?</p>
      <input id="nombre" maxlength="14" autocomplete="off" placeholder="Tu nombre" value="${esc(yo.nombre)}">
      <button class="btn" id="entrar">Entrar →</button><p id="msj">${msj ? esc(msj) : 'Vas a quedar en un equipo: Actores, Datos, Procesos o Control.'}</p></div>`;
    const entrar = () => {
      const n = $('#nombre').value.trim();
      if (!n) { $('#nombre').focus(); return; }
      yo.nombre = n.slice(0, 14);
      guardar();
      $('#entrar').disabled = true;
      $('#msj').textContent = 'Conectando…';
      intentos = 0;
      conectar();
    };
    $('#entrar').onclick = entrar;
    $('#nombre').onkeydown = e => { if (e.key === 'Enter') entrar(); };
    $('#nombre').focus();
  }

  function conectar() {
    clearTimeout(reintento);
    clearTimeout(espera);
    // Si en 12 s no entra la primera vez, se avisa (sala equivocada o sin internet).
    if (!dentro) espera = setTimeout(() => { if (!dentro) pedirNombre('No se pudo entrar. Revisa el código del proyector y tu internet, y vuelve a intentar.'); }, 12000);
    if (peer && !peer.destroyed && peer.open) return abrirConexion();
    if (peer && !peer.destroyed && peer.disconnected) { try { peer.reconnect(); } catch (e) { /* abajo se crea otro */ } return; }
    if (peer && !peer.destroyed) return;   // todavía abriendo
    peer = new Peer(ICE);
    peer.on('open', abrirConexion);
    peer.on('disconnected', () => { if (!peer.destroyed) reintentar(); });
    peer.on('error', e => {
      if (e.type === 'peer-unavailable' && !dentro) { clearTimeout(espera); return pedirNombre(`No encontramos la sala ${codigo}. Revisa el código del proyector.`); }
      if (['network', 'server-error', 'socket-error', 'socket-closed'].includes(e.type)) { try { peer.destroy(); } catch (x) { /* listo */ } }
      reintentar();
    });
  }

  function abrirConexion() {
    if (conn && conn.open) return;
    const c = conn = peer.connect(PREFIJO + codigo, { reliable: true });
    c.on('open', () => { intentos = 0; c.send({ t: 'hola', nombre: yo.nombre, pid: yo.pid }); });
    c.on('data', recibir);
    c.on('close', () => { if (c === conn) perdida(); });
    c.on('error', () => { if (c === conn) perdida(); });
  }

  function perdida() {
    if (!dentro) return;
    conn = null;
    pantalla(`<div class="grande">📡</div><h1>Reconectando…</h1><p>No cierres esta página: vuelves con tus puntos.</p>`);
    reintentar();
  }

  function reintentar() {
    if (!dentro) return;
    clearTimeout(reintento);
    intentos++;
    if (intentos > 60) return pantalla(`<div class="grande">📡</div><h1>Se cortó la conexión</h1><p>Recarga la página: vuelves con tu nombre y tus puntos.</p><button class="btn" onclick="location.reload()">Recargar</button>`);
    reintento = setTimeout(conectar, Math.min(4000, 600 + intentos * 400));
  }

  // Al volver al navegador (pantalla bloqueada, otra app) se revisa la conexión.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || !dentro) return;
    if (conn && conn.open) conn.send({ t: 'hola', nombre: yo.nombre, pid: yo.pid });
    else { intentos = 0; conectar(); }
  });

  function recibir(d) {
    if (!d || typeof d !== 'object') return;
    if (d.t === 'bienvenido') {
      const primera = !dentro;
      dentro = true; clearTimeout(espera);
      if (d.avatar) yo.avatar = d.avatar;
      if (d.equipo >= 0) yo.equipo = d.equipo;
      yo.puntos = d.puntos || 0;
      if (d.vuelve) return;   // ya estaba jugando: el proyector manda enseguida la pantalla donde iba
      if (primera) vibrar([30, 40, 30]);
      const eq = EQUIPOS[yo.equipo];
      pantalla(`<div class="avatar">${yo.avatar}</div><h1>¡Estás dentro, ${esc(yo.nombre)}!</h1>
        ${eq ? `<div class="tu-eq" style="--c:${eq.c}">${eq.ic} Eres del equipo <b>${eq.n}</b></div>` : ''}
        <p>Mira el proyector. Puedes hablar con tu equipo antes de responder. Mientras esperas, manda reacciones 👇</p>`, true);
    }
    if (d.t === 'pregunta') {
      idPregunta = d.id;
      vibrar(40);
      const cab = `<p><b>Reto ${d.n} de ${d.total}</b> · ${esc(d.titulo)}</p>`;
      if (d.tipo === 'clasifica') jugarClasifica(d, cab);
      else if (d.tipo === 'ordena') jugarOrdena(d, cab);
      else if (d.tipo === 'une') jugarUne(d, cab);
      else {
        pantalla(`${cab}${d.texto ? `<div class="enun-cel">${esc(d.texto)}</div>` : ''}
          <div class="ops">${d.opciones.map((o, k) => `<button class="op" data-k="${k}" style="--c:${o.color}"><span class="f">${o.forma}</span>${o.ic ? o.ic + ' ' : ''}${esc(o.txt)}</button>`).join('')}</div>`);
        app.querySelectorAll('.op').forEach(b => b.onclick = () => {
          if (!conn || !conn.open) return;
          conn.send({ t: 'resp', id: idPregunta, k: +b.dataset.k });
          vibrar(20);
          pantalla(`<div class="grande">${b.querySelector('.f').textContent}</div><h1>¡Respuesta enviada!</h1><p>Mira el proyector 👀</p>`, true);
        });
      }
    }
    if (d.t === 'capitulo') {
      vibrar([20, 30, 20]);
      pantalla(`<div class="cap-cel"><small>CAPÍTULO ${d.n} DE ${d.total}</small><div class="grande">${d.ic}</div><h1>${esc(d.titulo)}</h1><p>${esc(d.texto)}</p></div>`, true);
    }
    if (d.t === 'cuenta') pantalla(`<div class="grande latido">⏱</div><h1>¡Prepárate!</h1><p>El reto empieza en 3 segundos.</p>`);
    if (d.t === 'esperar') pantalla(`<div class="grande">⏳</div><h1>Ya respondiste</h1><p>Mira el proyector 👀</p>`, true);
    if (d.t === 'resultado') {
      yo.puntos = d.puntos;
      vibrar(d.ok ? [30, 40, 30] : 120);
      const eq = EQUIPOS[yo.equipo];
      const lineaEq = eq ? `<p>Tu equipo <b>${eq.n}</b> va <b>${d.eqPuesto}.º</b> de 4</p>` : '';
      pantalla(d.respondio
        ? `<div class="res ${d.ok ? 'ok' : 'no'}">${d.ok ? `✔ ¡${d.partes ? 'Perfecto' : 'Bien'}!<br>+<span data-cuenta="${d.gano}">0</span>` : d.partes ? `${d.bien} de ${d.partes} bien<br>+<span data-cuenta="${d.gano}">0</span>` : `✘ Era: ${esc(d.correcta)}`}</div>${d.racha >= 2 ? `<p class="racha-cel">🔥 ¡Racha de ${d.racha}! Puntos extra</p>` : ''}<p>Vas de <b>${d.puesto}</b> de ${d.de} · ${d.puntos} puntos</p>${lineaEq}<div class="porque-cel">💡 ${esc(d.porque || '')}</div>`
        : `<div class="grande">⏱</div><h1>Se acabó el tiempo</h1><p>${d.correcta ? `Era: <b>${esc(d.correcta)}</b>` : 'Mira la solución en el proyector.'}</p>${lineaEq}<div class="porque-cel">💡 ${esc(d.porque || '')}</div>`, true);
      contar(app);
    }
    if (d.t === 'fin') {
      yo.puntos = d.puntos;
      vibrar([60, 60, 60, 60, 200]);
      pantalla(`<div class="grande">${d.puesto <= 3 ? ['🥇', '🥈', '🥉'][d.puesto - 1] : '🌳'}</div><h1>Quedaste de ${d.puesto} de ${d.de}</h1>
        <p>${d.puntos} puntos · Tu equipo quedó <b>${d.eqPuesto}.º</b> · Ganó <b>${esc(d.eqGanador)}</b></p><p>El salón armó ${d.piezas} de 10 piezas del árbol.</p>`, true);
    }
  }

  // ---------- juegos en el celular ----------
  function enviarJuego(sel) {
    if (!conn || !conn.open) return;
    conn.send({ t: 'resp', id: idPregunta, sel });
    vibrar([20, 30, 20]);
    pantalla(`<div class="grande">✅</div><h1>¡Listo!</h1><p>Mira el proyector 👀</p>`, true);
  }

  // Lluvia de fallas: una falla a la vez y 4 botones (actores, datos, procesos, control).
  function jugarClasifica(d, cab) {
    const sel = [], id = d.id;
    const paso = () => {
      if (id !== idPregunta) return;
      if (sel.length >= d.items.length) return enviarJuego(sel);
      const n = sel.length;
      pantalla(`${cab}<div class="prog">${d.items.map((_, k) => `<i class="${k < n ? 'ya' : k === n ? 'ahora' : ''}"></i>`).join('')}</div>
        <div class="enun-cel grande-txt">${esc(d.items[n])}</div>
        <div class="ops">${d.comps.map((c, k) => `<button class="op" data-k="${k}" style="--c:${c.color}"><span class="f">${c.ic}</span>${esc(c.txt)}</button>`).join('')}</div>`);
      app.querySelectorAll('.op').forEach(b => b.onclick = () => {
        sel.push(+b.dataset.k);
        vibrar(12);
        if (conn && conn.open) conn.send({ t: 'avance', id, sel });
        paso();
      });
    };
    paso();
  }

  // Ordenar: se tocan las fichas en orden; tocar una ya puesta la devuelve.
  function jugarOrdena(d, cab) {
    const sel = [];
    const pintar = () => {
      const listo = sel.length === d.items.length;
      pantalla(`${cab}<div class="enun-cel">${esc(d.texto)}</div>
        <div class="mi-orden">${sel.map((ix, p) => `<button class="ficha-cel puesta" data-p="${p}"><b>${p + 1}</b>${esc(d.items[ix])}</button>`).join('') || '<p class="vacio-cel">Toca la primera ficha 👇</p>'}</div>
        <div class="fichas-cel">${d.items.map((t, ix) => sel.includes(ix) ? '' : `<button class="ficha-cel" data-ix="${ix}">${esc(t)}</button>`).join('')}</div>
        ${listo ? '<button class="btn" id="listo">Enviar mi orden ✓</button>' : ''}`);
      app.querySelectorAll('.ficha-cel[data-ix]').forEach(b => b.onclick = () => { sel.push(+b.dataset.ix); vibrar(12); pintar(); });
      app.querySelectorAll('.ficha-cel.puesta').forEach(b => b.onclick = () => { sel.splice(+b.dataset.p, 1); pintar(); });
      if (listo) $('#listo').onclick = () => enviarJuego(sel);
    };
    pintar();
  }

  // Unir: se marca una raíz (izquierda) y luego su efecto (derecha). Cada pareja toma el color de la raíz.
  function jugarUne(d, cab) {
    const pares = d.izq.map(() => -1);
    let activo = 0;
    const pintar = () => {
      const listo = pares.every(x => x >= 0);
      const deQuien = m => pares.indexOf(m);
      pantalla(`${cab}<div class="enun-cel">Toca una raíz y después su efecto.</div>
        <div class="une-cel">
          <div>${d.izq.map((t, n) => `<button class="ficha-cel izq${n === activo ? ' activa' : ''}${pares[n] >= 0 ? ' unida' : ''}" data-n="${n}" style="--c:${d.colores[n]}">${esc(t)}</button>`).join('')}</div>
          <div>${d.der.map((t, m) => `<button class="ficha-cel der${deQuien(m) >= 0 ? ' unida' : ''}" data-m="${m}" style="--c:${deQuien(m) >= 0 ? d.colores[deQuien(m)] : 'transparent'}">${esc(t)}</button>`).join('')}</div>
        </div>
        ${listo ? '<button class="btn" id="listo">Enviar mis parejas ✓</button>' : ''}`);
      app.querySelectorAll('.ficha-cel.izq').forEach(b => b.onclick = () => { activo = +b.dataset.n; pintar(); });
      app.querySelectorAll('.ficha-cel.der').forEach(b => b.onclick = () => {
        if (activo < 0) return;
        const m = +b.dataset.m, otro = pares.indexOf(m);
        if (otro >= 0) pares[otro] = -1;   // ese efecto ya estaba unido a otra raíz: se suelta
        pares[activo] = m;
        vibrar(12);
        activo = pares.indexOf(-1);
        pintar();
      });
      if (listo) $('#listo').onclick = () => enviarJuego(pares);
    };
    pintar();
  }

  if (yo.nombre && guardado.pid) {   // ya había entrado a esta sala: vuelve directo
    app.innerHTML = `<div class="cel"><div class="grande">🌳</div><h1>Volviendo a la sala…</h1><p>Hola de nuevo, ${esc(yo.nombre)}.</p></div>`;
    dentro = false;
    conectar();
  } else pedirNombre();
}

// ------------------------------------------------------------------ arranque
const salaUrl = (params.get('sala') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
if (salaUrl) jugador(salaUrl); else inicio();
