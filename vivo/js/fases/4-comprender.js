// 4-comprender.js
// FASE 4: el momento clave. El camino desaparece y las fichas que el jugador encontró
// se convierten en las raíces de un árbol: crece el tronco (el problema central) y
// después la copa (lo que le pasó al lote). El árbol estaba escondido en el sistema.
// Después viene el laboratorio: una prueba de la lógica del árbol.

Fases.comprender = {
  paso: 4, titulo: 'Comprender',
  async entrar(lienzo, turno) {
    asegurarEncontradas();
    const ruta = crearRuta(lienzo);
    ruta.ranuras('vacia');
    ruta.lote.style.transitionDuration = '0ms';
    ruta.lote.style.left = ruta.xs[6] + 'px';
    const tablero = crearTablero(lienzo, true);
    objetivo('');
    decir('Ahora miren lo que pasa con lo que encontramos…');
    await esperar(1200);
    if (!sigue(turno)) return;

    // 1. El camino se va.
    ruta.el.style.opacity = '0';
    ruta.el.style.transform = 'translateY(-50px)';
    await esperar(800);
    ruta.el.remove();

    // 2. Las fichas suben un poco: ahora son raíces.
    tablero.el.style.top = '446px';
    await esperar(950);
    if (!sigue(turno)) return;
    letrero(lienzo, '🌱 Raíces = causas', 40, 412);

    // 3. Crece el tronco con el problema central y los 4 componentes.
    const tronco = crear('div', 'tronco', `${PROBLEMA}
      <div class="cuatro">${ORDEN.map(k => `<span class="c-${k}">${COMPONENTES[k].nombre}</span>`).join('')}</div>`);
    lienzo.appendChild(tronco);
    Sonido.tocar('crecer');
    await esperar(900);
    if (!sigue(turno)) return;

    // Las raíces: una curva desde la base del tronco hasta cada columna.
    const svg = capaSVG(lienzo, 'raices');
    const base = posicion(tronco, lienzo);
    $$('.col', tablero.el).forEach((col, i) => {
      const p = posicion($('h3', col), lienzo);
      curva(svg, base.x + base.w / 2 + (i - 1.5) * 60, base.y + base.h, p.x + p.w / 2, p.y - 2, colorDe(col.dataset.comp), i * 120);
    });
    letrero(lienzo, '🪵 Tronco = problema central', 40, 300);
    await esperar(1100);
    if (!sigue(turno)) return;

    // 4. La copa: primero los efectos directos, luego los indirectos y arriba el final.
    const copa = crear('div', 'copa');
    lienzo.appendChild(copa);
    const directos = crear('div', 'fila', ORDEN.map((k, i) =>
      `<div class="hoja directa c-${k}" style="animation-delay:${i * 150}ms">${EFECTOS.directos[k]}</div>`).join(''));
    directos.style.top = '134px';
    copa.appendChild(directos);
    Sonido.tocar('brote');
    await esperar(900);
    const indirectos = crear('div', 'fila', EFECTOS.indirectos.map((t, i) =>
      `<div class="hoja" style="animation-delay:${i * 150}ms">${t}</div>`).join(''));
    indirectos.style.top = '72px';
    copa.appendChild(indirectos);
    Sonido.tocar('brote');
    await esperar(900);
    const final = crear('div', 'fila', `<div class="hoja final">${EFECTOS.final}</div>`);
    final.style.top = '6px';
    copa.appendChild(final);
    Sonido.tocar('logro');
    letrero(lienzo, '🍃 Copa = efectos', 40, 20);
    await esperar(900);
    if (!sigue(turno)) return;

    // 5. El suelo: el entorno, que condiciona pero no se controla.
    const suelo = crear('div', 'suelo', `<b>ENTORNO</b> ${ENTORNO.join(' · ')}`);
    lienzo.appendChild(suelo);
    await esperar(1300);
    if (!sigue(turno)) return;

    // 6. La revelación.
    const rev = crear('div', 'revelacion', `<div class="caja">
      <h1>Esto es un árbol de problemas</h1>
      <ul>
        <li>🌱 <b>Raíces:</b> las fallas que ustedes encontraron en el camino. Son las <b>causas</b>.</li>
        <li>🪵 <b>Tronco:</b> el problema que todas producen juntas. Es <b>uno solo</b>.</li>
        <li>🍃 <b>Copa:</b> lo que le pasó al lote y a Don Arley. Son los <b>efectos</b>.</li>
        <li>🟫 <b>Suelo:</b> lo que rodea al sistema pero no se controla desde él. Es el <b>entorno</b>, no una causa.</li>
      </ul>
      <p style="font:700 26px var(--titulo);color:var(--texto);margin:0 0 22px">Se lee de abajo hacia arriba: causas → problema → efectos.</p>
      <button class="btn" id="verArbol">Ver el árbol completo</button></div>`);
    lienzo.appendChild(rev);
    Sonido.tocar('logro');
    decir('Esto que ustedes encontraron tiene nombre: es un árbol de problemas. Y salió de mirar el sistema.');
    Voz.leer([...rev.querySelectorAll('li, .caja > p')].map(el => ({ el, texto: el.innerHTML })), true);
    const cerrar = () => {
      rev.remove();
      siguiente('');
      modoLectura(lienzo, { tablero, tronco, suelo }, turno);
    };
    $('#verArbol', rev).onclick = cerrar;
    siguiente('Ver el árbol completo', cerrar);
  },
};

// MODO LECTURA: el árbol ya está armado. Al tocar una raíz, una chispa sube por su camino
// (raíz → tronco → efecto directo → efecto final) y Don Arley lo lee en voz alta.
// Al tocar el tronco, la copa, el suelo o una columna, se explica qué es esa parte.
function modoLectura(lienzo, partes, turno) {
  objetivo('Toca una raíz y mira cómo se lee el árbol', true);
  decir('Un árbol de problemas se lee de abajo hacia arriba. Toquen cualquier raíz y sigan su camino hasta la copa.');
  const capa = capaSVG(lienzo, 'rama');
  let leidas = 0, ocupado = false;

  $$('.chip', partes.tablero.el).forEach(chip => {
    chip.classList.add('tocable');
    chip.onclick = async () => {
      if (ocupado) return;
      ocupado = true;
      const falla = FALLAS.find(f => f.id === +chip.dataset.id);
      await leerRama(lienzo, capa, partes, chip, falla, turno);
      ocupado = false;
      if (!sigue(turno)) return;
      leidas++;
      objetivo(leidas === 1 ? 'Prueba otra raíz o toca tronco, copa o suelo' : 'Toca otra parte del árbol', true);
      if (leidas === 1) siguiente('Probar la lógica del árbol 🔬', () => laboratorio(lienzo));
    };
  });

  // Explicación de cada parte del árbol al tocarla.
  const explicar = (el, texto) => {
    if (ocupado) return;
    $$('.brilla', lienzo).forEach(e => e.classList.remove('brilla'));
    el.classList.add('brilla');
    Sonido.tocar('clic');
    decir(texto);
  };
  partes.tronco.onclick = () => explicar(partes.tronco,
    'El tronco es el problema central: una sola situación negativa, dicha en términos del sistema. Todas las raíces llegan aquí.');
  $$('.hoja', lienzo).forEach(h => h.onclick = () => explicar(h, h.classList.contains('final')
    ? 'El efecto final: a dónde lleva todo el problema si nadie lo atiende.'
    : h.classList.contains('directa')
      ? 'Un efecto directo: lo que produce el problema en esa columna. Hay uno por cada componente.'
      : 'Un efecto indirecto: aparece cuando se juntan los efectos directos.'));
  partes.suelo.onclick = () => explicar(partes.suelo,
    'El entorno no es una causa: afecta al sistema, pero no se controla desde él. Por eso va aparte, en el suelo.');
  $$('.col h3', partes.tablero.el).forEach(h => h.onclick = () => {
    const k = h.parentElement.dataset.comp;
    explicar(h, `${COMPONENTES[k].nombre} (${COMPONENTES[k].pregunta}): ${COMPONENTES[k].def}`);
  });
}

const minuscula = t => t.charAt(0).toLowerCase() + t.slice(1);

async function leerRama(lienzo, capa, partes, chip, falla, turno) {
  capa.innerHTML = '';
  $$('.chispa', lienzo).forEach(e => e.remove());
  $$('.brilla', lienzo).forEach(e => e.classList.remove('brilla'));

  const k = falla.comp, i = ORDEN.indexOf(k);
  const hojaD = $(`.hoja.directa.c-${k}`, lienzo), hojaF = $('.hoja.final', lienzo);
  const pc = posicion(chip, lienzo), pt = posicion(partes.tronco, lienzo);
  const pd = posicion(hojaD, lienzo), pf = posicion(hojaF, lienzo);
  const xT = pt.x + pt.w / 2 + (i - 1.5) * 120;   // cada columna entra al tronco por su lado

  // El camino: raíz → base del tronco → punta del tronco → efecto directo → efecto final.
  const d = caminoSuave([
    { x: pc.x + pc.w / 2, y: pc.y },
    { x: xT, y: pt.y + pt.h },
    { x: xT, y: pt.y },
    { x: pd.x + pd.w / 2, y: pd.y + pd.h },
    { x: pd.x + pd.w / 2, y: pd.y },
    { x: pf.x + pf.w / 2, y: pf.y + pf.h },
  ]);
  const camino = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  camino.setAttribute('d', d);
  camino.setAttribute('stroke', colorDe(k));
  camino.style.animationDuration = '3.2s';
  capa.appendChild(camino);

  // La chispa recorre el mismo camino (offset-path). Si el navegador no lo soporta, solo se ve la línea.
  if (Juego.ajustes.movimiento && CSS.supports('offset-path', 'path("M0,0 L1,1")')) {
    const chispa = crear('div', 'chispa');
    chispa.style.offsetPath = `path('${d}')`;
    lienzo.appendChild(chispa);
    chispa.animate([{ offsetDistance: '0%' }, { offsetDistance: '100%' }], { duration: 3200, easing: 'ease-in-out', fill: 'forwards' });
  }

  // Don Arley lee la rama al mismo ritmo de la chispa.
  chip.classList.add('brilla');
  Sonido.tocar('brote');
  decir(`Porque ${minuscula(falla.causa)}…`);
  await Promise.all([esperar(1000), Voz.fin()]); if (!sigue(turno)) return;
  partes.tronco.classList.add('brilla');
  decir('…el pequeño productor no puede demostrar que su cacao es legal y libre de deforestación…');
  await Promise.all([esperar(1000), Voz.fin()]); if (!sigue(turno)) return;
  hojaD.classList.add('brilla');
  Sonido.tocar('brote');
  decir(`…entonces: ${minuscula(EFECTOS.directos[k])}…`);
  await Promise.all([esperar(1000), Voz.fin()]); if (!sigue(turno)) return;
  hojaF.classList.add('brilla');
  Sonido.tocar('logro');
  decir(`…y al final, ${minuscula(EFECTOS.final)}. Así se lee: causa → problema → efecto.`);
  await esperar(600);
}

function letrero(lienzo, texto, x, y) {
  const l = crear('div', 'letrero', texto);
  l.style.left = x + 'px'; l.style.top = y + 'px';
  lienzo.appendChild(l);
}

// LABORATORIO: si una columna funcionara bien, ¿pasaría el lote?
// Sirve para comprobar que el tronco está bien dicho: el problema es que los
// 4 componentes NO están articulados, no que falle uno solo.
function laboratorio(lienzo) {
  // Nuevo turno: si la animación del árbol seguía corriendo, se detiene aquí.
  const turno = ++Juego.turno;
  lienzo.innerHTML = '';
  objetivo('Prueba: ¿qué pasa si solo una parte funciona bien?');
  decir('Hagamos una prueba. Si arreglamos una sola columna, ¿será que el lote pasa?');
  const bien = { act: false, dat: false, pro: false, con: false };

  const lab = crear('div', 'lab', `
    <div class="lado">
      <h2>Columnas del sistema</h2>
      <p>Prende las que quieras que funcionen bien y manda un lote de prueba.</p>
      ${ORDEN.map((k, i) => `<button class="interruptor c-${k}" data-tecla="${i + 1}" data-comp="${k}"><span class="pista"></span>
        <span>${COMPONENTES[k].icono} ${COMPONENTES[k].nombre}<small>${COMPONENTES[k].pregunta}</small></span></button>`).join('')}
      <button class="interruptor bloq" id="entorno"><span class="pista"></span><span>🔒 Entorno<small>Conectividad, tenencia, norma europea…</small></span></button>
      <p class="nota-chica">Esto es una prueba de la lógica del árbol, no una propuesta de solución.</p>
    </div>
    <div class="lado">
      <h2>Lote de prueba</h2>
      <div class="minipista" id="pista"></div>
      <button class="btn" id="enviar" data-tecla="5">🚚 Enviar lote de prueba <small style="font-size:15px;opacity:.7">(5)</small></button>
      <div class="veredicto" id="veredicto"></div>
      <h2 style="font-size:19px;margin-top:6px">Efectos que siguen vivos</h2>
      <div class="efx" id="efx" style="grid-template-columns:1fr 1fr">
        ${ORDEN.map(k => `<div data-comp="${k}">${EFECTOS.directos[k]}</div>`).join('')}
        <div data-comp="todos" style="grid-column:1/-1">${EFECTOS.final}</div>
      </div>
    </div>`);
  lienzo.appendChild(lab);
  const ruta = crearRuta($('#pista', lab), { mini: true, ancho: 880, margen: 60 });
  ruta.ranuras('vacia');

  $$('.interruptor[data-comp]', lab).forEach(b => b.onclick = () => {
    bien[b.dataset.comp] = !bien[b.dataset.comp];
    b.classList.toggle('on', bien[b.dataset.comp]);
    Sonido.tocar('clic');
  });
  $('#entorno', lab).onclick = () => {
    Sonido.tocar('mal');
    decir('El entorno no se apaga desde el sistema: la señal, la tenencia de la tierra o la norma europea condicionan, pero no se controlan desde aquí.');
  };

  let enviando = false;
  $('#enviar', lab).onclick = async () => {
    if (enviando) return;
    enviando = true;
    $$('.sello', lab).forEach(s => s.remove());
    $$('.estacion', lab).forEach(e => e.classList.remove('falla', 'lista'));
    ruta.lote.style.transitionDuration = '0ms';
    ruta.lote.style.left = ruta.xs[0] + 'px';
    const cuantas = ORDEN.filter(k => bien[k]).length;
    ruta.ranuras(cuantas === 4 ? 'ok' : 'vacia');
    await esperar(80);

    // El lote recorre el camino. Cada estación se pone roja si alguna de sus fallas sigue sin arreglar.
    for (let i = 1; i < ESTACIONES.length; i++) {
      await ruta.mover(i, 380);
      if (!sigue(turno)) return;
      const anterior = FALLAS.filter(f => f.estacion === ESTACIONES[i - 1].id);
      const falla = anterior.some(f => !bien[f.comp]);
      ruta.estacion(i - 1).classList.add(falla ? 'falla' : 'lista');
    }

    // Efectos: el directo de una columna se apaga si esa columna funciona.
    // El efecto final solo se apaga si funcionan las 4.
    $$('#efx div', lab).forEach(d => {
      const k = d.dataset.comp;
      d.classList.toggle('apagado', k === 'todos' ? cuantas === 4 : bien[k]);
    });

    const v = $('#veredicto', lab);
    const pista = $('#pista', lab);
    if (cuantas === 4) {
      const s = sellar(pista, 470, 22, 'ACEPTADO', 'Los 4 componentes funcionan juntos', true);
      s.style.fontSize = '30px';
      v.innerHTML = '✅ Solo cuando los cuatro funcionan <b>juntos</b>, el lote pasa. El problema es del sistema completo.';
      decir('¿Ven? No era una sola cosa. Por eso el tronco dice "no están articulados".');
    } else {
      const s = sellar(pista, 470, 22, 'RECHAZADO', `Siguen fallando: ${ORDEN.filter(k => !bien[k]).map(k => COMPONENTES[k].nombre).join(', ')}`);
      s.style.fontSize = '30px';
      v.innerHTML = cuantas === 0
        ? '❌ Así está hoy: todo falla.'
        : `❌ Arreglaste ${cuantas} de 4 y el lote igual se cae: las otras columnas siguen fallando. Eso es "no están articulados".`;
      decir(cuantas === 0 ? 'Así está hoy. Prendan una columna y prueben otra vez.' : 'Arreglamos una parte y nada. Prueben prendiendo las cuatro.');
    }
    enviando = false;
    siguiente('Ahora un caso nuevo →', () => Juego.ir('aplicar'));
  };
}
