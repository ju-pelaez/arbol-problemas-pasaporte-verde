// sonido.js
// Sonidos cortos generados con Web Audio (no uso archivos de audio).
// Cada sonido es una lista de notas: [frecuencia en Hz, duración en segundos].
// Se apagan con la tecla M.

const Sonido = {
  ctx: null,
  notas: {
    clic:   [[620, .03]],
    paso:   [[420, .035]],
    bien:   [[660, .08], [990, .14]],
    mal:    [[230, .12], [180, .16]],
    sello:  [[150, .09], [110, .2]],
    brote:  [[880, .05], [1180, .07]],
    crecer: [[262, .12], [330, .12], [392, .12], [523, .25]],
    logro:  [[523, .1], [659, .1], [784, .1], [1047, .3]],
  },
  tocar(nombre) {
    if (!Juego.ajustes.sonido) return;
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (e) { return; }
    const grave = nombre === 'mal' || nombre === 'sello';
    let t = this.ctx.currentTime;
    for (const [f, d] of this.notas[nombre] || []) {
      const osc = this.ctx.createOscillator(), vol = this.ctx.createGain();
      osc.type = grave ? 'square' : 'triangle';
      osc.frequency.value = f;
      vol.gain.setValueAtTime(.0001, t);
      vol.gain.exponentialRampToValueAtTime(grave ? .06 : .14, t + .01);
      vol.gain.exponentialRampToValueAtTime(.0001, t + d);
      osc.connect(vol).connect(this.ctx.destination);
      osc.start(t); osc.stop(t + d + .02);
      t += d * .9;
    }
  },
};
