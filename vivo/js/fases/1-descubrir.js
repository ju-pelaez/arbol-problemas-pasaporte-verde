// 1-descubrir.js
// FASE 1: el jugador manda el lote y ve que lo rechazan. No le explico nada todavía:
// la idea es que nazca la pregunta "¿por qué?".

Fases.descubrir = {
  paso: 1, titulo: 'Descubrir',
  entrar(lienzo, turno) {
    const ruta = crearRuta(lienzo);
    objetivo('Envía el lote y mira qué pasa');
    decir('Este es mi cacao: 400 kilos, bien secos. Va para Europa. ¿Será que llega?');

    siguiente('Enviar el lote 🚚', async () => {
      for (let i = 1; i < ESTACIONES.length; i++) {
        await ruta.mover(i, 650);
        if (!sigue(turno)) return;
      }
      ruta.estacion(6).classList.add('falla');
      sellar(lienzo, 1070, 252, 'RECHAZADO', 'Sin evidencia de origen libre de deforestación');
      decir('¿Rechazado? ¡Pero si yo no tumbé monte! ¿Entonces por qué?');
      objetivo('¿Por qué lo rechazaron?');
      await esperar(1300);
      if (!sigue(turno)) return;

      // Ahora sí muestro qué revisa el comprador: tres cosas que el lote no lleva.
      ruta.ranuras('vacia');
      const caja = crear('div', 'panel', `
        <p class="preg" style="margin-top:0">Desde el 30 de diciembre de 2026, el comprador europeo revisa tres cosas de cada lote:</p>
        <div class="opciones" style="grid-template-columns:repeat(3,1fr)">
          <div class="op" style="padding-left:16px">📍 ¿Dónde se produjo?<small>Coordenadas del predio</small></div>
          <div class="op" style="padding-left:16px">🌳 ¿Hubo deforestación?<small>Bosque comparado con 2020</small></div>
          <div class="op" style="padding-left:16px">📄 ¿Es legal?<small>Tenencia de la tierra</small></div>
        </div>
        <p class="fb mal">El lote llegó sin ninguna de las tres. ¿En qué parte del camino se perdieron?</p>
        <p style="margin:10px 0 0;font-size:17px;color:#5C6B62">¿Por qué Europa pregunta? En solo tres meses de 2026 se perdieron 37.660 hectáreas de bosque en la Amazonia colombiana: el 76 % del país.</p>`);
      caja.style.cssText = 'top:388px;width:1100px';
      lienzo.appendChild(caja);
      Voz.leer([...caja.querySelectorAll('.preg, .op, .fb, p:last-child')].map(el => ({ el, texto: el.innerHTML })), true);
      await esperar(600);
      if (!sigue(turno)) return;
      siguiente('Mirar el sistema completo →', () => mostrarSistema(lienzo, turno));
    });
  },
};

// Antes de buscar fallas, miro el sistema completo: lo que entra, lo que se hace,
// lo que sale, quién lo evalúa y lo que lo rodea. Es el sistema como funciona hoy (AS-IS).
// De aquí van a salir las raíces del árbol.
function mostrarSistema(lienzo, turno) {
  lienzo.innerHTML = '';
  objetivo('Así funciona hoy el sistema (AS-IS)');
  decir('Antes de buscar culpables, miremos el sistema completo: lo que entra, lo que se hace, lo que sale y cómo se evalúa.');
  const s = crear('div', 'sistema', `
    <span class="etq">ENTORNO · ${SISTEMA.entorno}</span>
    <div class="eps3">
      <div class="bloque" style="--d:.1s"><h3 style="color:var(--dat)">ENTRADAS</h3><p class="que">Lo que le llega al sistema</p>
        <ul>${SISTEMA.entradas.map(e => `<li>${e}</li>`).join('')}</ul></div>
      <div class="flecha" style="--d:.35s">➜</div>
      <div class="bloque" style="--d:.45s"><h3 style="color:var(--pro)">PROCESOS</h3><p class="que">Lo que se hace, en orden</p>
        <div class="procs">${ESTACIONES.slice(0, 6).map((e, i) => `<span>${i + 1}. ${e.icono} ${e.nombre}</span>`).join('')}</div></div>
      <div class="flecha" style="--d:.7s">➜</div>
      <div class="bloque" style="--d:.8s"><h3 style="color:var(--efe)">SALIDAS</h3><p class="que">Lo que sale del sistema</p>
        <ul>${SISTEMA.salidas.map(o => `<li class="${o.mal ? 'malo' : ''}">${o.t}</li>`).join('')}</ul></div>
    </div>
    <div class="bloque controlbox" style="--d:1.1s"><h3 style="color:var(--con)">CONTROL</h3><p class="que" style="margin:0">${SISTEMA.control}</p></div>
    <p class="retro" style="--d:1.4s">↺ La retroalimentación existe en el papel, pero casi no funciona: nadie mide ni corrige.</p>`);
  lienzo.appendChild(s);
  const explica = crear('div', 'explica',
    'Un <b>sistema</b> transforma <b>entradas</b> en <b>salidas</b> por medio de <b>procesos</b>, y el <b>control</b> lo evalúa. Aquí la salida que importa, la <b>evidencia de origen</b>, sale incompleta. Vamos a buscar por qué.');
  explica.style.setProperty('--d', '1.7s');
  lienzo.appendChild(explica);
  // La voz recorre el sistema bloque por bloque, iluminando cada uno.
  const nombres = { 0: 'Entradas: lo que le llega al sistema. ', 1: 'Procesos: lo que se hace. ', 2: 'Salidas: lo que sale del sistema. ' };
  Voz.leer([
    ...[...s.querySelectorAll('.eps3 .bloque')].map((el, i) => ({ el, texto: nombres[i] + [...el.querySelectorAll('li, .procs span')].map(x => x.textContent.replace(/^\d+\.\s*/, '')).join(', ') })),
    { el: s.querySelector('.controlbox'), texto: 'Control: ' + SISTEMA.control },
    { el: s.querySelector('.retro'), texto: s.querySelector('.retro').textContent },
    { el: explica, texto: explica.innerHTML },
  ], true);
  setTimeout(() => { if (sigue(turno)) siguiente('Averiguar dónde falla →', () => Juego.ir('experimentar')); }, Juego.ajustes.movimiento ? 1800 : 100);
}
