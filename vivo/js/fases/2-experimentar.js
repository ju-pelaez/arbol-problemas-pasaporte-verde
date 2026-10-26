// 2-experimentar.js
// FASE 2: el lote repite el viaje despacio. En cada estación el jugador revisa qué pasa
// y decide a qué componente pertenece la falla. Cada acierto cae como una ficha en su
// columna: sin saberlo, el jugador está armando las raíces del árbol.

Fases.experimentar = {
  paso: 2, titulo: 'Experimentar',
  async entrar(lienzo, turno) {
    Juego.encontradas = [];
    Juego.puntos.exp = { ok: 0, total: 0 };

    // Primero, las 4 preguntas del analista: son las 4 columnas donde van a caer las fallas.
    await cuatroPreguntas(lienzo, turno);
    if (!sigue(turno)) return;
    lienzo.innerHTML = '';

    const ruta = crearRuta(lienzo);
    ruta.ranuras('vacia');
    const tablero = crearTablero(lienzo);
    decir('Repitamos el viaje despacio. En cada parada miren bien qué pasa con mi lote.');

    for (let i = 0; i < 6; i++) {
      await ruta.mover(i, 700);
      if (!sigue(turno)) return;
      const est = ruta.estacion(i);
      est.classList.add('activa');
      objetivo(`Revisa la parada: ${ESTACIONES[i].nombre}`);

      // Espero a que toquen la estación o el botón de revisar.
      const marca = crear('span', 'pulso', '🔍 toca');
      est.appendChild(marca);
      await new Promise(r => {
        const listo = () => { est.onclick = null; marca.remove(); Sonido.tocar('clic'); siguiente(''); r(); };
        est.onclick = listo;
        siguiente(`🔍 Revisar ${ESTACIONES[i].nombre}`, listo);
      });
      if (!sigue(turno)) return;

      for (const falla of FALLAS.filter(f => f.estacion === ESTACIONES[i].id)) {
        await preguntarFalla(lienzo, falla, tablero, turno);
        if (!sigue(turno)) return;
      }
      est.classList.remove('activa');
      est.classList.add('falla');
    }

    objetivo('');
    decir(`Encontramos ${Juego.encontradas.length} fallas en el camino. Ahora miremos el viaje completo.`);
    siguiente('Ver el viaje completo →', () => Juego.ir('observar'));
  },
};

// Las 4 cartas: hay que abrirlas todas (tocándolas o con 1-4) para seguir.
function cuatroPreguntas(lienzo, turno) {
  return new Promise(resolver => {
    objetivo('Abre las 4 cartas: son las preguntas que hace un analista');
    decir('Para revisar el camino usamos 4 preguntas. Abran cada carta.');
    const caja = crear('div', 'lentes', ORDEN.map((k, i) => `
      <button class="lente c-${k}" style="--d:${.1 + i * .12}s" data-tecla="${i + 1}" data-comp="${k}">
        <div class="giro">
          <div class="cara"><span class="ic">${COMPONENTES[k].icono}</span><b>${COMPONENTES[k].nombre}</b><small>Toca para abrir (${i + 1})</small></div>
          <div class="dorso">
            <span class="q">${COMPONENTES[k].pregunta}</span>
            <p>${COMPONENTES[k].def}</p>
            <div class="ej"><b>EN EL CASO DEL CACAO</b>${COMPONENTES[k].ejemplo}</div>
          </div>
        </div>
      </button>`).join(''));
    lienzo.appendChild(caja);
    const abiertas = new Set();
    $$('.lente', caja).forEach(b => b.onclick = () => {
      if (abiertas.has(b.dataset.comp)) return;
      abiertas.add(b.dataset.comp);
      b.classList.add('abierta');
      Sonido.tocar('brote');
      const k = b.dataset.comp;
      decir(`${COMPONENTES[k].nombre}: ${COMPONENTES[k].def}`);
      Voz.leer([{ el: b.querySelector('.ej'), texto: 'En el caso del cacao: ' + COMPONENTES[k].ejemplo }], true);
      if (abiertas.size === 4 && sigue(turno)) {
        objetivo('Ya tienes las 4 preguntas. Ahora, al camino.');
        siguiente('Revisar el camino →', resolver);
      }
    });
  });
}

// Muestra una falla y espera a que la clasifiquen bien.
// 1er error: pista general. 2do error: pista con la pregunta del componente correcto.
function preguntarFalla(lienzo, falla, tablero, turno) {
  return new Promise(resolver => {
    objetivo('¿Qué componente del sistema falla aquí?');
    const panel = crear('div', 'panel', `
      <div class="escena"><span class="ic">${falla.icono}</span><p>${falla.escena}</p></div>
      <p class="preg" id="preg">¿Es sobre quién participa, qué información hay, qué se hace o cómo se evalúa? ${aviso()}</p>
      <div class="opciones" style="grid-template-columns:repeat(4,1fr)">
        ${ORDEN.map((k, i) => `<button class="op c-${k}" data-tecla="${i + 1}" data-comp="${k}">
            <span class="k">${i + 1}</span>${COMPONENTES[k].icono} ${COMPONENTES[k].nombre}<small>${COMPONENTES[k].pregunta}</small></button>`).join('')}
      </div>`);
    panel.style.cssText = 'top:236px;width:1180px';
    lienzo.appendChild(panel);
    Voz.leer([{ el: $('.escena', panel), texto: falla.escena }, { el: $('#preg', panel), texto: '¿Qué componente está fallando? ¿Es sobre quién participa, qué información hay, qué se hace o cómo se evalúa?' }]);
    let errores = 0;

    $$('.op', panel).forEach(b => b.onclick = () => {
      const preg = $('#preg', panel);
      if (b.dataset.comp === falla.comp) {
        b.classList.add('bien');
        $$('.op', panel).forEach(x => x.disabled = true);
        Sonido.tocar('bien');
        preg.className = 'fb bien';
        preg.textContent = '✔ ' + falla.porque;
        Voz.leer([{ el: preg, texto: '¡Exacto! ' + falla.porque }]);
        Juego.encontradas.push(falla.id);
        Juego.puntos.exp.total++;
        if (errores === 0) Juego.puntos.exp.ok++;
        siguiente('Seguir →', () => {
          panel.remove();
          tablero.agregar(falla);
          Sonido.tocar('brote');
          resolver();
        });
      } else {
        errores++;
        b.disabled = true;
        sacudir(b);
        Sonido.tocar('mal');
        preg.className = 'fb mal';
        preg.textContent = errores === 1
          ? 'Todavía no. Piensa: ¿esto es sobre una persona, sobre la información, sobre una tarea o sobre cómo se mide?'
          : `Casi. Pregúntate: "${COMPONENTES[falla.comp].pregunta}"`;
        Voz.leer([{ el: preg, texto: preg.textContent }]);
      }
    });
  });
}
