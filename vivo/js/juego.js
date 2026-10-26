// juego.js
// El motor del juego. Se carga de último porque usa todo lo demás.
// Hace 5 cosas:
//   1. Guarda el estado de la partida (Juego).
//   2. Cambia de fase (Juego.ir).
//   3. Escala el escenario de 1600x900 a la pantalla.
//   4. Atiende el teclado (para presentar con el control o el teclado).
//   5. Guarda los ajustes (sonido, animaciones, modo salón) en el navegador.

const ORDEN_FASES = ['portada', 'descubrir', 'experimentar', 'observar', 'comprender', 'aplicar', 'demostrar', 'final'];
const CLAVE_AJUSTES = 'sistemaVivo.ajustes';

// MODO CAPÍTULO: el juego grande (Expedición Árbol de Problemas) abre Sistema Vivo dentro de un
// iframe con ?capitulo=... y solo se juegan las fases de ese capítulo. Al terminar, aviso al
// juego grande con postMessage para que me devuelva al mapa y me dé las estrellas.
const CAPITULOS = {
  viaje:  { nombre: 'El viaje del lote',  fases: ['descubrir'],                 puntos: null },
  camino: { nombre: 'Revisar el camino',  fases: ['experimentar', 'observar'],  puntos: 'exp' },
  arbol:  { nombre: 'Nace el árbol',      fases: ['comprender'],                puntos: null },
  otro:   { nombre: 'Otro sistema',       fases: ['aplicar'],                   puntos: 'apl' },
  reto:   { nombre: 'Demuéstralo',        fases: ['demostrar'],                 puntos: 'reto' },
};
const CAPITULO = CAPITULOS[new URLSearchParams(location.search).get('capitulo')] ? new URLSearchParams(location.search).get('capitulo') : null;
const EN_IFRAME = window.parent !== window;
function avisarAlJuego(datos) { if (EN_IFRAME) window.parent.postMessage({ origen: 'sistema-vivo', ...datos }, '*'); }

const Juego = {
  fase: null,
  turno: 0,          // aumenta en cada cambio de fase (ver sigue() en util.js)
  escala: 1,
  ajustes: {
    sonido: true,
    movimiento: !matchMedia('(prefers-reduced-motion: reduce)').matches,
    salon: false,
    voz: true,
  },
  encontradas: [],   // ids de las fallas que el jugador ya clasificó
  puntos: {},        // aciertos a la primera por fase: { exp, apl, reto }

  async ir(nombre) {
    Voz.callar();
    // En modo capítulo, salir de las fases del capítulo = capítulo terminado.
    if (CAPITULO && !CAPITULOS[CAPITULO].fases.includes(nombre)) return terminarCapitulo();
    const turno = ++this.turno;
    this.fase = nombre;
    const lienzo = $('#lienzo');
    lienzo.innerHTML = '';
    objetivo('');
    siguiente('');
    $('#notasTexto').textContent = NOTAS[nombre] || '';
    pintarPasos();
    // Antes de cada fase de juego, la cortinilla con su nombre y qué se va a hacer.
    const fase = Fases[nombre];
    if (fase.paso && INTROS[nombre]) {
      await cortinilla(fase, INTROS[nombre]);
      if (!sigue(turno)) return;
    }
    fase.entrar(lienzo, turno);
  },

  cambiarAjuste(cual) {
    this.ajustes[cual] = !this.ajustes[cual];
    aplicarAjustes();
    try { localStorage.setItem(CLAVE_AJUSTES, JSON.stringify(this.ajustes)); } catch (e) { /* modo privado: no pasa nada */ }
    if (cual === 'sonido' && this.ajustes.sonido) Sonido.tocar('clic');
  },
};

// Los 6 pasos de arriba (Descubrir … Demostrar). También sirven para saltar de fase al presentar.
function pintarPasos() {
  const actual = Fases[Juego.fase].paso || (Juego.fase === 'final' ? 7 : 0);
  $('#pasos').innerHTML = ORDEN_FASES.filter(n => Fases[n].paso).map(n => {
    const p = Fases[n].paso;
    const clase = p < actual ? 'hecho' : p === actual ? 'actual' : '';
    return `<li class="${clase}" data-fase="${n}" title="Ir a ${Fases[n].titulo}"><i>${p < actual ? '✓' : p}</i>${Fases[n].titulo}</li>`;
  }).join('');
  if (!CAPITULO) $$('#pasos li').forEach(li => li.onclick = () => Juego.ir(li.dataset.fase));
  // Barra de progreso debajo de la barra de arriba.
  $('#progreso i').style.width = (Math.min(actual, 6) / 6 * 100) + '%';
}

// Pantalla de capítulo terminado (solo en modo capítulo).
function terminarCapitulo() {
  const turno = ++Juego.turno;
  const cap = CAPITULOS[CAPITULO];
  const p = cap.puntos && Juego.puntos[cap.puntos];
  const estrellas = !p || !p.total ? 3 : p.ok / p.total >= .85 ? 3 : p.ok / p.total >= .6 ? 2 : 1;
  objetivo('');
  Sonido.tocar('logro');
  decir('¡Capítulo completo! Volvamos al camino: todavía hay mucho por descubrir.');
  $('#lienzo').innerHTML = `<div class="fin"><div class="caja">
      <p style="font:800 22px var(--titulo);letter-spacing:.3em;color:var(--oro);margin:0">CAPÍTULO COMPLETO</p>
      <h1>${cap.nombre}</h1>
      <p class="puntos">${[0, 1, 2].map(i => `<span class="estrella" style="--d:${.3 + i * .25}s">${i < estrellas ? '★' : '☆'}</span>`).join('')}</p>
      <button class="btn" id="volverMapa">${EN_IFRAME ? '🗺️ Volver al mapa' : '↺ Volver al inicio'}</button>
    </div></div>`;
  const volver = () => {
    if (!sigue(turno)) return;
    if (EN_IFRAME) avisarAlJuego({ tipo: 'capitulo', capitulo: CAPITULO, estrellas });
    else location.href = location.pathname;
  };
  $('#volverMapa').onclick = volver;
  siguiente(EN_IFRAME ? 'Volver al mapa →' : 'Volver al inicio →', volver);
}

// Glosario: los conceptos clave, siempre a mano (tecla G).
function glosario() {
  const g = $('#glosario');
  if (!g.hidden) { g.hidden = true; return; }
  $('#glosarioLista').innerHTML = GLOSARIO.map(([t, d]) => `<dt>${t}</dt><dd>${d}</dd>`).join('');
  g.hidden = false;
}

function aplicarAjustes() {
  document.body.classList.toggle('quieto', !Juego.ajustes.movimiento);
  $('#bSonido').classList.toggle('apagado', !Juego.ajustes.sonido);
  $('#bMovimiento').classList.toggle('apagado', !Juego.ajustes.movimiento);
  $('#bVoz').classList.toggle('apagado', !Juego.ajustes.voz);
}

// El escenario siempre mide 1600x900; lo escalo para que quepa completo en la pantalla.
function escalar() {
  Juego.escala = Math.min(innerWidth / 1600, innerHeight / 900);
  $('#escenario').style.setProperty('--escala', Juego.escala);
}

function pantallaCompleta() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.();
}

// ---------- teclado ----------
addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const tecla = e.key.toLowerCase();

  // Con la pantalla negra o la ayuda abiertas, cualquier tecla las cierra.
  if (!$('#negro').hidden) { $('#negro').hidden = true; e.preventDefault(); return; }
  if (!$('#ayuda').hidden) { $('#ayuda').hidden = true; e.preventDefault(); return; }
  const cortina = $('.cortina');
  if (cortina && (tecla === 'arrowright' || tecla === ' ' || tecla === 'enter')) { e.preventDefault(); cortina.click(); return; }

  if (tecla === 'arrowright' || tecla === ' ') {
    const b = $('#siguiente');
    if (!b.hidden && !b.disabled) { e.preventDefault(); b.click(); }
    return;
  }
  if (/^[1-6]$/.test(tecla)) {
    const op = $$(`#lienzo [data-tecla="${tecla}"]`).find(x => !x.disabled);
    if (op) { e.preventDefault(); op.click(); }
    return;
  }
  if (tecla === 'm') Juego.cambiarAjuste('sonido');
  if (tecla === 'v') { Juego.cambiarAjuste('voz'); if (!Juego.ajustes.voz) Voz.callar(); }
  if (tecla === 'r') Juego.cambiarAjuste('movimiento');
  if (tecla === 'n') $('#notas').hidden = !$('#notas').hidden;
  if (tecla === 'f') pantallaCompleta();
  if (tecla === 'b') $('#negro').hidden = false;
  if (tecla === 'h') $('#ayuda').hidden = false;
  if (tecla === 'g') glosario();
});

// ---------- botones de la barra ----------
$('#bSonido').onclick = () => Juego.cambiarAjuste('sonido');
$('#bVoz').onclick = () => { Juego.cambiarAjuste('voz'); if (!Juego.ajustes.voz) Voz.callar(); else Voz.decir('Voz encendida.'); };
$('#bMovimiento').onclick = () => Juego.cambiarAjuste('movimiento');
$('#bPantalla').onclick = pantallaCompleta;
$('#bAyuda').onclick = () => { $('#ayuda').hidden = false; };
$('#bGlosario').onclick = glosario;
$('#cerrarGlosario').onclick = () => { $('#glosario').hidden = true; };
$('#cerrarAyuda').onclick = () => { $('#ayuda').hidden = true; };
$('#negro').onclick = () => { $('#negro').hidden = true; };
$('#marca').onclick = () => { if (EN_IFRAME) avisarAlJuego({ tipo: 'salir' }); else if (CAPITULO) location.href = location.pathname; else Juego.ir('portada'); };

// ---------- arranque ----------
try {
  const guardados = JSON.parse(localStorage.getItem(CLAVE_AJUSTES));
  if (guardados) Object.assign(Juego.ajustes, guardados);
} catch (e) { /* sin ajustes guardados */ }
// Dentro del juego grande, el logo se vuelve el botón para regresar al mapa (y Esc también).
if (EN_IFRAME) {
  $('#marca').innerHTML = '<span class="logo">🗺️</span><span><b>Volver al mapa</b><small>Expedición</small></span>';
  addEventListener('keydown', e => { if (e.key === 'Escape') avisarAlJuego({ tipo: 'salir' }); });
}
aplicarAjustes();
escalar();
addEventListener('resize', escalar);
Juego.ir(CAPITULO ? CAPITULOS[CAPITULO].fases[0] : 'portada');
