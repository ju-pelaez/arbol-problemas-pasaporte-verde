// retos.js
// Los 10 retos del juego del salón. Cada reto, si la mayoría acierta, le agrega una pieza
// al árbol del proyector. Van en orden para que el árbol se arme de abajo hacia arriba:
// suelo → 4 raíces → tronco → 3 hojas → fruto.

const PARTES = [
  { k: 'raiz',   t: 'Raíces',  ic: '🌱' },
  { k: 'tronco', t: 'Tronco',  ic: '🪵' },
  { k: 'copa',   t: 'Copa',    ic: '🍃' },
  { k: 'suelo',  t: 'Suelo',   ic: '🟫' },
];
const COMPS = [
  { k: 'act', t: 'Actores',  ic: '👥' },
  { k: 'dat', t: 'Datos',    ic: '📊' },
  { k: 'pro', t: 'Procesos', ic: '🔁' },
  { k: 'con', t: 'Control',  ic: '🎯' },
];

// Fallas del viaje del lote de Don Arley (las mismas de los capítulos), agrupadas por componente.
const FALLAS_SALON = {
  act: [
    'La Unión Europea le exige al importador, este al comprador, este a la asociación… y todo termina en Don Arley.',
    'A Don Arley le llega un papel de "debida diligencia con geolocalización" de la UE y no entiende qué le piden.',
    'El ICA tiene la guía del ganado, el IDEAM el mapa del bosque y la ANT los papeles de la tierra: nadie junta la información.',
  ],
  dat: [
    'Don Arley anota la cosecha en un cuaderno. El lote sale sin ubicación.',
    '¿Cuántas hectáreas tiene la finca? "Como unas 40", calcula Don Arley.',
    'El mapa del IDEAM muestra la región entera, no la finca de Don Arley.',
  ],
  pro: [
    'En el acopio, el cacao de Don Arley se mezcla con el de 30 fincas. Ya nadie sabe qué vino de dónde.',
    'Un intermediario arma la carpeta del lote a mano y a su manera. Nadie más la puede rehacer.',
    'La guía del ICA para mover el ganado revisa vacunas, pero nadie revisa el bosque.',
  ],
  con: [
    '¿Cuántas fincas del Caquetá podrían demostrar hoy su origen? Nadie lo sabe: no se mide.',
    'Un comprador pide coordenadas, otro fotos satelitales, otro un certificado. No hay regla común.',
    'El lote rechazado no queda registrado en ningún lado. El próximo va a salir igual.',
  ],
};

// Juegos que no son de escoger una opción: se juegan en el celular y el proyector muestra la solución.
const ORDEN_PROBLEMA = [
  'En el sistema de acreditación de origen del Caquetá,',
  'el pequeño productor',
  'no puede demostrar que su producción es legal y libre de deforestación,',
  'porque sus actores, datos, procesos y control no están articulados.',
];
const ORDEN_LECTURA = ['🌱 Causas (raíces)', '🪵 Problema central (tronco)', '🍃 Efectos directos', '🍎 Efecto final'];
const EFECTOS_DIRECTOS = [
  'El productor depende de intermediarios y no sabe qué le exigen',
  'El lote no se puede rastrear hasta su predio',
  'La evidencia de origen sale incompleta o no existe',
  'Las pérdidas no se registran y el sistema no se corrige',
];

const barajar = l => { const a = l.slice(); for (let n = a.length - 1; n > 0; n--) { const m = Math.floor(Math.random() * (n + 1)); [a[n], a[m]] = [a[m], a[n]]; } return a; };

// Arma los 11 retos de una partida (las fallas y el orden de las fichas cambian cada vez).
function armarRetos() {
  const azar = l => l[Math.floor(Math.random() * l.length)];
  const parte = (texto, correcta, porque, pieza) => ({ tipo: 'parte', titulo: '¿En qué parte del árbol va?', texto, opciones: PARTES.map(p => ({ txt: p.t, ic: p.ic })), correcta: PARTES.findIndex(p => p.k === correcta), porque, pieza });
  const usadas = [];
  const falla = (comp, pieza) => { const texto = azar(FALLAS_SALON[comp]); usadas.push(texto); return { tipo: 'falla', titulo: '¿Qué componente falla aquí?', texto, opciones: COMPS.map(c => ({ txt: c.t, ic: c.ic })), correcta: COMPS.findIndex(c => c.k === comp),
    porque: { act: 'Es sobre quién participa y quién carga la exigencia: ACTORES.', dat: 'Es información que falta o está mal: DATOS.', pro: 'Es una tarea que se hace mal: PROCESOS.', con: 'Es sobre cómo se mide y se corrige: CONTROL.' }[comp], pieza }; };
  const pregunta = (texto, opciones, correcta, porque, pieza) => ({ tipo: 'pregunta', titulo: 'Pregunta del árbol', texto, opciones: opciones.map(t => ({ txt: t, ic: '' })), correcta, porque, pieza });
  // Ordenar: se barajan las fichas y se guarda en qué posición debe ir cada una.
  const ordena = (titulo, texto, orden, porque, pieza) => { const items = barajar(orden); return { tipo: 'ordena', titulo, texto, items, correctas: orden.map(t => items.indexOf(t)), porque, pieza, tiempo: 35 }; };

  const retos = [
    parte('La señal de internet se cae seguido en las veredas.', 'suelo', 'Es entorno: afecta al sistema pero no se controla desde él. Va en el suelo.', 'suelo'),
    falla('act', 'r-act'),
    falla('dat', 'r-dat'),
    falla('pro', 'r-pro'),
    falla('con', 'r-con'),
  ];
  // Lluvia de fallas: 8 fallas (2 de cada componente) para clasificar lo más rápido posible.
  const lluvia = barajar(COMPS.flatMap((c, k) => barajar(FALLAS_SALON[c.k].filter(t => !usadas.includes(t))).slice(0, 2).map(t => ({ t, k }))));
  retos.push({ tipo: 'clasifica', titulo: 'Lluvia de fallas', texto: 'Clasifica cada falla en su componente: actores, datos, procesos o control.', items: lluvia.map(x => x.t), correctas: lluvia.map(x => x.k),
    porque: 'Cada falla del viaje cae en una de las 4 preguntas del analista: ¿quién?, ¿qué información?, ¿qué se hace?, ¿cómo se controla?', pieza: null, tiempo: 45 });
  retos.push(ordena('Arma el problema central', 'Ordena las 4 partes del problema central, como se escribe en el tronco.', ORDEN_PROBLEMA,
    'Dónde pasa, a quién le pasa, qué le pasa y por qué: la causa de fondo es que el sistema no está articulado.', 'tronco'));
  const der = barajar(EFECTOS_DIRECTOS);
  retos.push({ tipo: 'une', titulo: 'Une cada raíz con su efecto', texto: 'Cada raíz sube por su columna hasta un efecto directo. Únelas.', izq: COMPS.map(c => c.ic + ' ' + c.t), der, correctas: EFECTOS_DIRECTOS.map(t => der.indexOf(t)),
    porque: 'Cada componente que falla produce su propio efecto directo en la copa.', pieza: 'h1', tiempo: 35 });
  retos.push(ordena('¿Cómo se lee el árbol?', 'Ordena de lo primero a lo último cuando se lee el árbol.', ORDEN_LECTURA,
    'Se lee de abajo hacia arriba: por estas causas pasa este problema, que produce estos efectos.', 'h2'));
  retos.push(pregunta('Si arreglamos solo los datos, ¿por qué el lote igual se cae?', ['Porque los datos no importan', 'Porque actores, procesos y control siguen fallando', 'Porque Europa no compra cacao', 'Porque el lote era muy pesado'], 1, 'El problema es del sistema completo: sus partes no están articuladas.', 'h3'));
  retos.push(pregunta('¿De dónde salen las raíces del árbol?', ['De las soluciones que queremos hacer', 'De lo que nos imaginamos', 'De observar dónde falla el sistema real', 'De internet'], 2, 'El árbol no se inventa: sale de analizar el sistema como funciona hoy.', 'fruto'));
  return retos;
}

// Los retos se juegan en 5 capítulos, como una historia: cada uno abre con una presentación en el
// proyector y deja ver qué parte del árbol se va a construir. El último reto vale doble.
const CAPITULOS_SALON = [
  { desde: 0, ic: '🏞️', t: 'El terreno', piezas: ['suelo'],
    txt: 'Todo árbol crece en un suelo. Antes de buscar causas, separemos lo que rodea al sistema de lo que pasa dentro de él.' },
  { desde: 1, ic: '🍫', t: 'El viaje de Don Arley', piezas: ['r-act', 'r-dat', 'r-pro', 'r-con'],
    txt: 'El lote de cacao de Don Arley salió del Caquetá y lo rechazaron en Europa. Él no tumbó monte. Entonces, ¿dónde falló el sistema? Encuentren las 4 raíces… y aguanten la lluvia de fallas.' },
  { desde: 6, ic: '🪵', t: 'El tronco', piezas: ['tronco'],
    txt: 'Las 4 raíces llevan a un solo problema. Ármenlo pieza por pieza, como se escribe en el árbol.' },
  { desde: 7, ic: '🍃', t: 'La copa', piezas: ['h1', 'h2', 'h3'],
    txt: 'Un problema no se queda quieto: produce efectos. Unan cada raíz con su efecto y descubran cómo se lee el árbol.' },
  { desde: 10, ic: '🍎', t: 'El fruto · Gran final', piezas: ['fruto'],
    txt: 'La última pregunta es la más importante de la materia. ¡Vale puntos dobles!' },
];
