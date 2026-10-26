// 0-portada.js
// Pantalla de inicio. El árbol se dibuja solo, de abajo hacia arriba (raíces, tronco, copa),
// que es justo como se lee un árbol de problemas.

Fases.portada = {
  entrar(lienzo) {
    decir('Buenas. Yo soy Don Arley, cacaotero de Cartagena del Chairá. Acompáñenme a mandar mi cacao a Europa.');
    lienzo.innerHTML = `
      <div class="portada">
        <div>
          <p class="entra" style="--d:.1s;font:700 17px var(--titulo);letter-spacing:.22em;color:var(--suave);margin:0 0 14px">ANÁLISIS DE SISTEMAS · PASAPORTE VERDE DEL PREDIO AMAZÓNICO</p>
          <h1><span style="--d:.25s">Sistema</span><br><em><span style="--d:.45s">Vivo</span></em></h1>
          <p class="bajada entra" style="--d:.7s">Sigue un lote de cacao del Caquetá hasta Europa, encuentra dónde falla el sistema y mira cómo nace el árbol de problemas.</p>
          <button class="btn entra" style="--d:.9s" id="jugar">▶ Empezar la partida</button>
          <div class="ajustes entra" style="--d:1.05s">
            <button class="ajuste" data-ajuste="sonido">🔊 Sonido</button>
            <button class="ajuste" data-ajuste="movimiento">🎞️ Animaciones</button>
            <button class="ajuste" data-ajuste="salon">🙋 Modo salón (votar)</button>
          </div>
          <p class="creditos entra" style="--d:1.2s">Hecho por <b>Juan Pablo Peláez Pino</b> · Ingeniería de Sistemas · Universidad de la Amazonia · 2026<br>
          Proyecto Pasaporte Verde: Juan Pablo Peláez y Brahiam Parra. Don Arley es un personaje inventado.</p>
        </div>
        <div>${arbolPortada()}</div>
      </div>`;

    // Luciérnagas de fondo (solo decoración suave).
    const portada = $('.portada', lienzo);
    for (let i = 0; i < 16; i++) {
      const l = crear('span', 'luciernaga');
      l.style.left = (Math.random() * 1580) + 'px';
      l.style.top = (Math.random() * 700) + 'px';
      l.style.animationDelay = (-Math.random() * 7) + 's';
      portada.appendChild(l);
    }

    $('#jugar', lienzo).onclick = () => { Sonido.tocar('clic'); Juego.ir('descubrir'); };
    const pintar = () => $$('.ajuste', lienzo).forEach(b => b.classList.toggle('on', !!Juego.ajustes[b.dataset.ajuste]));
    $$('.ajuste', lienzo).forEach(b => b.onclick = () => { Juego.cambiarAjuste(b.dataset.ajuste); pintar(); });
    pintar();
    siguiente('Empezar →', () => Juego.ir('descubrir'));
  },
};

// El árbol de la portada. Cada parte trae su retraso (--d) para dibujarse en orden:
// primero las 4 raíces (actores, datos, procesos, control), luego el tronco, la copa y los frutos.
function arbolPortada() {
  const raices = ORDEN.map((k, i) => {
    const x = 130 + i * 100, d = .5 + i * .18;
    return `<path class="raiz" style="--d:${d}s" d="M280,330 C280,390 ${x},380 ${x},450" stroke="var(--${k})" stroke-width="12" fill="none" stroke-linecap="round"/>
            <text class="etq" style="--d:${d + .5}s" x="${x}" y="482" text-anchor="middle" fill="var(--${k})" font-family="Nunito" font-weight="800" font-size="20">${COMPONENTES[k].nombre}</text>`;
  }).join('');
  const frutos = [[225, 95], [330, 120], [280, 60], [190, 170], [372, 175]]
    .map(([x, y], i) => `<circle class="fruto" style="--d:${2.4 + i * .12}s" cx="${x}" cy="${y}" r="10" fill="var(--efe)" stroke="#13201A" stroke-width="2"/>`).join('');
  return `<svg class="arbolito" viewBox="0 0 560 520" role="img" aria-label="Un árbol de problemas: raíces de cuatro colores, tronco y copa">
    <circle cx="280" cy="150" r="150" fill="rgba(255,201,74,.06)"/>
    ${raices}
    <path class="tronco-p" style="--d:1.3s" d="M250,330 L262,190 L298,190 L310,330 Z" fill="#6E4527" stroke="#3A2414" stroke-width="5"/>
    <circle class="copa-c" style="--d:1.75s" cx="190" cy="160" r="70" fill="#2F8F4E" stroke="#13201A" stroke-width="5"/>
    <circle class="copa-c" style="--d:1.9s" cx="370" cy="160" r="70" fill="#2F8F4E" stroke="#13201A" stroke-width="5"/>
    <circle class="copa-c" style="--d:2.05s" cx="280" cy="110" r="90" fill="#3FA35B" stroke="#13201A" stroke-width="5"/>
    ${frutos}
  </svg>`;
}
