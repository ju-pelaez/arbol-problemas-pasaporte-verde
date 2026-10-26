// 7-final.js
// Cierre: resultado de la partida y las 3 ideas que tienen que quedar.

Fases.final = {
  entrar(lienzo) {
    // Sumo los aciertos "a la primera" de las fases que sí se jugaron.
    const partes = Object.values(Juego.puntos);
    const total = partes.reduce((s, p) => s + p.ok, 0);
    const max = partes.reduce((s, p) => s + p.total, 0);
    const pct = max ? total / max : 0;
    const estrellas = pct >= .85 ? 3 : pct >= .6 ? 2 : 1;

    objetivo('');
    decir('Gracias por acompañar mi lote. Ahora ya saben por qué me lo rechazaron… y cómo se analiza un sistema.');
    Sonido.tocar('logro');
    lienzo.innerHTML = `
      <div class="fin"><div class="caja">
        <h1>¡Ahora sí!</h1>
        ${max ? `<p class="puntos">${[0, 1, 2].map(i => `<span class="estrella" style="--d:${.3 + i * .25}s">${i < estrellas ? '★' : '☆'}</span>`).join('')}
          &nbsp; <b id="cuenta">0</b> de ${max} a la primera</p>` : ''}
        <ol>
          <li>Un árbol de problemas <b>no se inventa</b>: sale de mirar dónde falla el sistema real.</li>
          <li>Las causas se ordenan por componente: <b>actores, datos, procesos y control</b>. Lo que no se controla es <b>entorno</b>.</li>
          <li>El problema central es <b>uno solo</b>: aquí, que los cuatro componentes no están articulados.</li>
        </ol>
        <button class="btn" id="otra">↺ Jugar otra vez</button>
        <p class="creditos">Hecho por Juan Pablo Peláez Pino · Ingeniería de Sistemas · Universidad de la Amazonia</p>
      </div></div>`;
    $('#otra', lienzo).onclick = () => Juego.ir('portada');
    Voz.leer([...lienzo.querySelectorAll('.fin li')].map(el => ({ el, texto: el.innerHTML })), true);

    // El puntaje sube contando hasta el total.
    const cuenta = $('#cuenta', lienzo);
    if (cuenta) {
      let n = 0;
      const paso = setInterval(() => {
        n = Math.min(total, n + 1);
        cuenta.textContent = n;
        if (n >= total || !cuenta.isConnected) clearInterval(paso);
      }, Juego.ajustes.movimiento ? 60 : 1);
    }
    siguiente('Volver al inicio', () => Juego.ir('portada'));
  },
};
