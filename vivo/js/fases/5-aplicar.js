// 5-aplicar.js
// FASE 5: transferencia. Un caso nuevo (la biblioteca, inventado para practicar) sin
// ayudas antes de responder. Si el método se entendió, sirve en cualquier sistema.

Fases.aplicar = {
  paso: 5, titulo: 'Aplicar',
  async entrar(lienzo, turno) {
    const pts = Juego.puntos.apl = { ok: 0, total: 0 };
    const caja = crear('div', 'centro');
    lienzo.appendChild(caja);
    const caso = `<div class="caso">📚 <b>Caso nuevo (inventado para practicar):</b> ${BIBLIOTECA.situacion}</div>`;

    objetivo('Usa el mismo método en otro sistema');
    decir('Ahora sin mi lote. Otro sistema, el mismo método. Esta vez no hay pistas antes de responder.');
    caja.innerHTML = caso + `<div class="hoja-blanca"><p class="grande">Vas a clasificar 9 causas de este problema.</p>
      <p style="font-size:22px;margin:8px 0 0">Ahora hay una opción más: <b>Entorno</b>, para lo que la biblioteca no controla.</p></div>`;
    await esperarSiguiente('Empezar →');
    if (!sigue(turno)) return;

    const opcionesComp = [...ORDEN, 'env'].map(k => ({
      k, html: k === 'env' ? '🟫 Entorno<small>No se controla</small>' : `${COMPONENTES[k].icono} ${COMPONENTES[k].nombre}<small>${COMPONENTES[k].pregunta}</small>`,
    }));
    const causas = mezclar(BIBLIOTECA.causas);
    for (let i = 0; i < causas.length; i++) {
      const c = causas[i];
      objetivo(`Causa ${i + 1} de ${causas.length}: ¿qué componente es?`);
      const ok = await unaPregunta(caja, caso, c.texto,
        opcionesComp.map(o => ({ html: o.html, clase: 'c-' + o.k, ok: o.k === c.comp })), c.porque, 5);
      if (!sigue(turno)) return;
      pts.total++; if (ok) pts.ok++;
    }

    objetivo('¿Cuál es el tronco de este árbol?');
    const t = mezclar(BIBLIOTECA.troncos);
    const okT = await unaPregunta(caja, caso, '¿Cuál es el problema central?',
      t.map(x => ({ html: x.texto, ok: x.ok, porque: x.porque })), null, 1, true);
    if (!sigue(turno)) return;
    pts.total++; if (okT) pts.ok++;

    objetivo('¿Cuál va en la copa?');
    const e = mezclar(BIBLIOTECA.efectos);
    const okE = await unaPregunta(caja, caso, '¿Cuál de estos es un efecto?',
      e.map(x => ({ html: x.texto, ok: x.ok, porque: x.porque })), null, 1, true);
    if (!sigue(turno)) return;
    pts.total++; if (okE) pts.ok++;

    objetivo('');
    decir(`Acertaron ${pts.ok} de ${pts.total} en un sistema que no habían visto. El método sirve para cualquier sistema.`);
    caja.innerHTML = caso + `<div class="hoja-blanca"><p class="grande">${pts.ok} de ${pts.total} correctas</p>
      <p style="font-size:22px;margin:8px 0 0">Mismo método: buscar dónde falla el sistema, ordenar por actores, datos, procesos y control, y dejar aparte el entorno.</p></div>`;
    siguiente('Reto final →', () => Juego.ir('demostrar'));
  },
};

// Muestra una pregunta con opciones y espera UNA respuesta (en esta fase no hay segundo intento).
// Devuelve true si acertó. Si las opciones traen su propio "porque", se muestra el de la elegida.
function unaPregunta(caja, encabezado, texto, opciones, porque, columnas, enLista = false) {
  return new Promise(resolver => {
    caja.innerHTML = encabezado + `<div class="hoja-blanca">
      <p class="grande">${texto} ${aviso()}</p>
      <div class="opciones" style="grid-template-columns:repeat(${columnas},1fr);margin-top:14px">
        ${opciones.map((o, i) => `<button class="op ${o.clase || ''}" data-tecla="${i + 1}" data-i="${i}"><span class="k">${i + 1}</span>${o.html}</button>`).join('')}
      </div><div id="fbz"></div></div>`;
    if (enLista) $$('.op', caja).forEach(b => { b.style.fontSize = '21px'; });
    Voz.leer([{ el: $('.grande', caja), texto: texto }]);
    $$('.op', caja).forEach(b => b.onclick = () => {
      const o = opciones[+b.dataset.i];
      $$('.op', caja).forEach(x => {
        x.disabled = true;
        if (opciones[+x.dataset.i].ok) x.classList.add('bien');
      });
      if (!o.ok) sacudir(b);
      Sonido.tocar(o.ok ? 'bien' : 'mal');
      const explicacion = o.porque || porque;
      $('#fbz', caja).innerHTML = `<p class="fb ${o.ok ? 'bien' : 'mal'}">${o.ok ? '✔ ' : '✘ '}${explicacion}</p>`;
      Voz.leer([{ el: $('#fbz .fb', caja), texto: (o.ok ? '¡Bien! ' : 'No era esa. ') + explicacion }]);
      siguiente('Seguir →', () => resolver(o.ok));
    });
  });
}
