// 3-observar.js
// FASE 3: el lote hace el viaje otra vez y, en cada estación, se dibuja una línea
// hasta las fallas que encontramos ahí. Así se ve que el sistema falla en todo el camino.

Fases.observar = {
  paso: 3, titulo: 'Observar',
  async entrar(lienzo, turno) {
    asegurarEncontradas();
    const ruta = crearRuta(lienzo);
    ruta.ranuras('vacia');
    const tablero = crearTablero(lienzo, true);
    const svg = capaSVG(lienzo, 'lineas');
    objetivo('Mira de dónde salió cada ficha');
    decir('Miren el viaje otra vez, ahora con todo lo que encontramos.');
    await esperar(900);

    for (let i = 0; i < ESTACIONES.length; i++) {
      await ruta.mover(i, 550);
      if (!sigue(turno)) return;
      const est = ruta.estacion(i);
      est.classList.add('falla');
      const centro = posicion($('.bola', est), lienzo);
      for (const falla of FALLAS.filter(f => f.estacion === ESTACIONES[i].id)) {
        const chip = tablero.chip(falla.id);
        if (!chip) continue;
        const p = posicion(chip, lienzo);
        curva(svg, centro.x + centro.w / 2, centro.y + centro.h, p.x + p.w / 2, p.y, colorDe(falla.comp));
        chip.classList.add('brilla');
        Sonido.tocar('brote');
        await esperar(380);
        if (!sigue(turno)) return;
      }
    }
    sellar(lienzo, 1070, 252, 'RECHAZADO', 'Otra vez: sin evidencia de origen');
    await esperar(800);
    if (!sigue(turno)) return;
    objetivo('');
    decir('El lote no se cae por una sola cosa: se cae en todo el camino. Y todo eso quedó abajo, en cuatro columnas.');
    siguiente('¿Y esto qué es? →', () => Juego.ir('comprender'));
  },
};
