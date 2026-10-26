// ruta.js
// Piezas que se repiten en varias fases:
//   crearRuta()    -> el camino del lote con sus 7 estaciones
//   crearTablero() -> las 4 columnas donde caen las fallas (las futuras raíces)
//   sellar()       -> el sello de RECHAZADO / ACEPTADO

function crearRuta(contenedor, opciones = {}) {
  const ancho = opciones.ancho || 1600;
  const margen = opciones.margen || 110;
  const ruta = crear('div', 'ruta' + (opciones.mini ? ' mini' : ''));
  ruta.innerHTML = '<div class="camino"></div>';
  if (opciones.mini) ruta.querySelector('.camino').style.cssText = `left:${margen}px;right:${margen}px`;

  // Reparto las estaciones a la misma distancia entre sí.
  const paso = (ancho - 2 * margen) / (ESTACIONES.length - 1);
  const xs = ESTACIONES.map((e, i) => margen + i * paso);

  ESTACIONES.forEach((e, i) => {
    const est = crear('div', 'estacion', `<div class="bola">${e.icono}</div><div class="nom">${e.nombre}</div>`);
    est.style.left = xs[i] + 'px';
    est.dataset.i = i;
    ruta.appendChild(est);
  });

  // El lote lleva 3 "ranuras": los datos que Europa le va a pedir.
  const lote = crear('div', 'lote',
    `<b>🍫 Lote 127</b><div class="ranuras"><span title="Ubicación del predio">📍</span><span title="Bosque sin tumbar desde 2020">🌳</span><span title="Tierra legal">📄</span></div>`);
  lote.style.left = xs[0] + 'px';
  ruta.appendChild(lote);
  contenedor.appendChild(ruta);

  return {
    el: ruta, lote, xs,
    estacion: i => ruta.querySelectorAll('.estacion')[i],
    // Mueve el lote a la estación i (la animación la hace el CSS con transition: left).
    async mover(i, ms = 700) {
      lote.style.transitionDuration = (Juego.ajustes.movimiento ? ms : 0) + 'ms';
      lote.style.left = xs[i] + 'px';
      Sonido.tocar('paso');
      await esperar(ms);
    },
    ranuras(estado) { lote.querySelectorAll('.ranuras span').forEach(s => { s.className = estado; }); },
  };
}

function crearTablero(lienzo, lleno = false) {
  const el = crear('div', 'tablero');
  el.innerHTML = ORDEN.map(k =>
    `<div class="col c-${k}" data-comp="${k}">
       <h3>${COMPONENTES[k].icono} ${COMPONENTES[k].nombre} <small>${COMPONENTES[k].pregunta}</small></h3>
       <div class="zona vacia"></div>
     </div>`).join('');
  lienzo.appendChild(el);

  const tablero = {
    el,
    agregar(falla, animado = true) {
      const zona = el.querySelector(`[data-comp="${falla.comp}"] .zona`);
      zona.classList.remove('vacia');
      const chip = crear('div', `chip c-${falla.comp}` + (animado ? ' nuevo' : ''), falla.causa);
      chip.dataset.id = falla.id;
      zona.appendChild(chip);
      return chip;
    },
    chip: id => el.querySelector(`.chip[data-id="${id}"]`),
  };
  if (lleno) FALLAS.filter(f => Juego.encontradas.includes(f.id)).forEach(f => tablero.agregar(f, false));
  return tablero;
}

function sellar(lienzo, x, y, texto, detalle, ok = false) {
  const s = crear('div', 'sello' + (ok ? ' ok' : ''), `${texto}<small>${detalle}</small>`);
  s.style.left = x + 'px'; s.style.top = y + 'px';
  lienzo.appendChild(s);
  Sonido.tocar(ok ? 'logro' : 'sello');
  return s;
}
