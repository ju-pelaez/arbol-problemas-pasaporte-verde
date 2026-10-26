// 6-demostrar.js
// FASE 6: el reto final. Parte A: ubicar 8 piezas del árbol real (raíces por columna,
// copa o suelo). Parte B: 3 preguntas de "¿por qué?" para comprobar que se entendió.
// El reloj es solo para darle ritmo: si se acaba, se puede terminar igual.

Fases.demostrar = {
  paso: 6, titulo: 'Demostrar',
  async entrar(lienzo, turno) {
    const pts = Juego.puntos.reto = { ok: 0, total: 0 };
    const caja = crear('div', 'centro');
    lienzo.appendChild(caja);
    decir('El reto final: armen mi árbol sin ayuda. Cada pieza va en una raíz, en la copa o en el suelo.');

    const zonas = [
      { id: 'copa', nombre: '🍃 Copa · efectos', clase: 'c-efe', ancha: true, tecla: 5 },
      ...ORDEN.map((k, i) => ({ id: k, nombre: `🌱 ${COMPONENTES[k].nombre}`, clase: 'c-' + k, tecla: i + 1 })),
      { id: 'suelo', nombre: '🟫 Suelo · entorno', clase: 'c-env', ancha: true, tecla: 6 },
    ];
    const piezas = mezclar(RETO.piezas);

    // Reloj de 2 minutos (en modo salón no hay reloj).
    let segundos = 120, reloj = null;
    const conReloj = !Juego.ajustes.salon;

    for (let i = 0; i < piezas.length; i++) {
      const p = piezas[i];
      objetivo(`Pieza ${i + 1} de ${piezas.length}: ¿dónde va?`);
      caja.innerHTML = `
        <div class="contador"><span>🌳 Arma tu árbol</span><span>${conReloj ? `⏱ <b id="seg">${segundos}</b> s` : aviso()}</span></div>
        ${conReloj ? `<div class="barra-tiempo"><i id="barra" style="width:${segundos / 120 * 100}%"></i></div>` : ''}
        <div class="pieza">${p.texto}</div>
        <div class="zonas">${zonas.map(z => `<button class="zona-btn ${z.clase} ${z.ancha ? 'ancha' : ''}" data-tecla="${z.tecla}" data-z="${z.id}"><span class="k">${z.tecla}</span>${z.nombre}</button>`).join('')}</div>
        <p class="fb" id="fbr" hidden></p>`;
      Voz.leer([{ el: $('.pieza', caja), texto: p.texto + '. ¿Dónde va?' }]);
      if (conReloj && !reloj) reloj = setInterval(() => {
        if (!sigue(turno)) { clearInterval(reloj); return; }
        segundos = Math.max(0, segundos - 1);
        const s = $('#seg'), b = $('#barra');
        if (s) s.textContent = segundos;
        if (b) b.style.width = (segundos / 120 * 100) + '%';
        if (segundos === 0) { clearInterval(reloj); decir('Se acabó el tiempo, pero terminen tranquilos.'); }
      }, 1000);

      // Se puede intentar hasta acertar; solo cuenta como punto si fue a la primera.
      const aLaPrimera = await new Promise(resolver => {
        let primera = true;
        $$('.zona-btn', caja).forEach(b => b.onclick = () => {
          const fb = $('#fbr', caja);
          fb.hidden = false;
          if (b.dataset.z === p.zona) {
            b.classList.add('bien');
            $$('.zona-btn', caja).forEach(x => x.disabled = true);
            Sonido.tocar('bien');
            fb.className = 'fb bien';
            fb.textContent = '✔ Ahí va.';
            setTimeout(() => resolver(primera), Juego.ajustes.movimiento ? 650 : 200);
          } else {
            primera = false;
            sacudir(b);
            Sonido.tocar('mal');
            fb.className = 'fb mal';
            fb.textContent = '✘ Ahí no. ¿Es una causa (de qué columna), un efecto o algo del entorno?';
          }
        });
      });
      if (!sigue(turno)) return;
      pts.total++; if (aLaPrimera) pts.ok++;
    }
    clearInterval(reloj);

    // Parte B: las preguntas de "por qué".
    for (let i = 0; i < RETO.preguntas.length; i++) {
      const q = RETO.preguntas[i];
      objetivo(`Pregunta ${i + 1} de ${RETO.preguntas.length}`);
      const ok = await unaPregunta(caja, '', q.q,
        mezclar(q.opciones).map(o => ({ html: o.t, ok: o.ok })), q.porque, 1, true);
      if (!sigue(turno)) return;
      pts.total++; if (ok) pts.ok++;
    }
    Juego.ir('final');
  },
};
