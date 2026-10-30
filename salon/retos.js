// retos.js
// Hay dos temas: el árbol de problemas (normal) y factibilidad y viabilidad (/salon/?tema=factibilidad).
const TEMA = new URLSearchParams(location.search).get('tema') === 'factibilidad' ? 'factibilidad' : 'arbol';
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
function armarRetosArbol() {
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
  // Retos de escoger (funcionan en cualquier celular).
  retos.push(parte('El pequeño productor no puede demostrar que su producción es legal y libre de deforestación.', 'tronco', 'Es el problema central: una sola situación negativa. Va en el tronco.', 'tronco'));
  retos.push(parte('Don Arley pierde ventas o se las pagan más baratas.', 'copa', 'Es algo que produce el problema: un efecto. Va en la copa.', 'h1'));
  retos.push(pregunta('¿Cómo se lee un árbol de problemas?', ['De abajo hacia arriba: causas → problema → efectos', 'De arriba hacia abajo: efectos → causas', 'De izquierda a derecha', 'En cualquier orden'], 0, 'Por estas causas pasa este problema, y eso produce estos efectos.', 'h2'));
  retos.push(pregunta('Si arreglamos solo los datos, ¿por qué el lote igual se cae?', ['Porque los datos no importan', 'Porque actores, procesos y control siguen fallando', 'Porque Europa no compra cacao', 'Porque el lote era muy pesado'], 1, 'El problema es del sistema completo: sus partes no están articuladas.', 'h3'));
  retos.push(pregunta('¿De dónde salen las raíces del árbol?', ['De las soluciones que queremos hacer', 'De lo que nos imaginamos', 'De observar dónde falla el sistema real', 'De internet'], 2, 'El árbol no se inventa: sale de analizar el sistema como funciona hoy.', 'fruto'));
  return retos;
}

// Los retos se juegan en 5 capítulos, como una historia: cada uno abre con una presentación en el
// proyector y deja ver qué parte del árbol se va a construir. El último reto vale doble.
const CAPITULOS_ARBOL = [
  { desde: 0, ic: '🏞️', t: 'El terreno', piezas: ['suelo'],
    txt: 'Todo árbol crece en un suelo. Antes de buscar causas, separemos lo que rodea al sistema de lo que pasa dentro de él.' },
  { desde: 1, ic: '🍫', t: 'El viaje de Don Arley', piezas: ['r-act', 'r-dat', 'r-pro', 'r-con'],
    txt: 'El lote de cacao de Don Arley salió del Caquetá y lo rechazaron en Europa. Él no tumbó monte. Entonces, ¿dónde falló el sistema? Encuentren las 4 raíces.' },
  { desde: 5, ic: '🪵', t: 'El tronco', piezas: ['tronco'],
    txt: 'Las 4 raíces llevan a un solo problema. ¿Lo reconocen?' },
  { desde: 6, ic: '🍃', t: 'La copa', piezas: ['h1', 'h2', 'h3'],
    txt: 'Un problema no se queda quieto: produce efectos. Y el árbol se lee en un orden… ¿cuál será?' },
  { desde: 9, ic: '🍎', t: 'El fruto · Gran final', piezas: ['fruto'],
    txt: 'La última pregunta es la más importante de la materia. ¡Vale puntos dobles!' },
];

// ------------------------------------------------------------------ FACTIBILIDAD Y VIABILIDAD
// Mismo árbol del proyector, otra historia: las 4 raíces son las 4 factibilidades de la propuesta
// del Pasaporte Verde y la copa es la viabilidad.
const ESTUDIOS = [
  { k: 'tec', t: 'Técnica',   ic: '🛠️' },
  { k: 'ope', t: 'Operativa', ic: '👥' },
  { k: 'eco', t: 'Económica', ic: '💰' },
  { k: 'leg', t: 'Legal',     ic: '⚖️' },
];
const SITUACIONES_FACT = {
  tec: [
    '¿El sistema funciona aunque la señal se caiga en la vereda?',
    '¿Se pueden unir los datos del IDEAM, el ICA y la ANT alrededor de cada predio?',
    '¿Hay tecnología para ubicar cada finca con sus coordenadas?',
  ],
  ope: [
    '¿Don Arley entiende lo que el sistema le muestra?',
    '¿Las asociaciones como ASOHECA pueden acompañar el registro de las fincas?',
    '¿El productor confía en compartir la información de su predio?',
  ],
  eco: [
    '¿Acreditar el origen cuesta menos que las ventas que hoy se pierden?',
    '¿Se ahorra plata al reutilizar las fuentes públicas que ya existen?',
    '¿El productor deja de pagarle a un intermediario para que le arme la carpeta?',
  ],
  leg: [
    '¿Cumple el Reglamento (UE) 2023/1115 de productos libres de deforestación?',
    '¿Respeta la Ley 1581 de 2012 de datos personales?',
    '¿Quién tiene la autoridad para certificar que un predio está libre de deforestación?',
  ],
};

function armarRetosFactibilidad() {
  const azar = l => l[Math.floor(Math.random() * l.length)];
  const estudio = (k, pieza) => ({ tipo: 'estudio', titulo: '¿Qué factibilidad revisa esta pregunta?', texto: azar(SITUACIONES_FACT[k]),
    opciones: ESTUDIOS.map(e => ({ txt: e.t, ic: e.ic })), correcta: ESTUDIOS.findIndex(e => e.k === k),
    porque: { tec: 'Es sobre datos y tecnología, ¿hay con qué hacerlo? TÉCNICA.', ope: 'Es sobre las personas, ¿lo usarían y lo pueden manejar? OPERATIVA.',
      eco: 'Es sobre costos y beneficios, ¿cuesta menos de lo que ahorra? ECONÓMICA.', leg: 'Es sobre leyes y normas, ¿lo permite la ley? LEGAL.' }[k], pieza });
  const fov = (texto, correcta, porque, pieza) => ({ tipo: 'fov', titulo: '¿Factible o viable?', texto,
    opciones: [{ txt: 'Factible: ¿se PUEDE hacer?', ic: '🔧' }, { txt: 'Viable: ¿VALE LA PENA y dura?', ic: '🌱' }], correcta, porque, pieza });
  // Las opciones se barajan para que la correcta no quede siempre en el mismo lugar.
  const pregunta = (texto, opciones, porque, pieza) => { const ops = barajar(opciones);
    return { tipo: 'pregunta', titulo: 'Factibilidad y viabilidad', texto, opciones: ops.map(t => ({ txt: t, ic: '' })), correcta: ops.indexOf(opciones[0]), porque, pieza }; };

  return [
    pregunta('¿Qué pregunta la FACTIBILIDAD?', ['¿Se puede hacer con los recursos, la tecnología, las personas y las leyes que hay?', '¿Vale la pena y se sostiene en el tiempo?', '¿Quién tiene la culpa del problema?', '¿Cuál es el efecto final del árbol?'],
      'Factible = se PUEDE hacer. Viable = VALE LA PENA y se sostiene.', 'suelo'),
    fov('Las fechas del reglamento europeo ya están encima: hay que hacerlo ahora.', 1, 'Es el momento: eso dice si vale la pena hacerlo YA. Es VIABILIDAD.', null),
    estudio('tec', 'r-act'),
    estudio('ope', 'r-dat'),
    estudio('eco', 'r-pro'),
    estudio('leg', 'r-con'),
    pregunta('¿Qué propone el Pasaporte Verde?', ['Lineamientos para que el dato nazca en el predio y se integren las fuentes', 'Una app para vender cacao por internet', 'Prohibir la ganadería en el Caquetá', 'Que Europa vaya a revisar cada finca'],
      'No es una app: son lineamientos de cómo debe comportarse el sistema (L-01 a L-07).', 'tronco'),
    pregunta('¿Quién certifica que un predio está libre de deforestación?', ['La autoridad competente: el sistema informa y documenta', 'El mismo sistema', 'El comprador europeo', 'Cualquier vecino de la vereda'],
      'Regla R-03 de la propuesta: el sistema no certifica, deja la evidencia lista.', null),
    fov('Los compradores europeos ya piden coordenadas, imágenes satelitales y documentos.', 1, 'Hay una necesidad real: el proyecto vale la pena. Es VIABILIDAD.', 'h1'),
    fov('Los datos del IDEAM, el ICA y la ANT ya existen; solo hay que integrarlos.', 0, 'Hay con qué hacerlo: es FACTIBILIDAD (técnica).', 'h2'),
    pregunta('¿Cuál es un RIESGO para que el proyecto se sostenga?', ['Que la señal se caiga en el campo y el productor no confíe', 'Que haya demasiados árboles', 'Que el cacao del Caquetá sea muy bueno', 'No tiene ningún riesgo'],
      'La viabilidad también mira los riesgos: la señal, la confianza y que las entidades mantengan sus datos al día.', 'h3'),
    pregunta('Entonces, ¿el Pasaporte Verde es factible y viable?', ['Sí: hay datos, hay fecha y hay necesidad; hay que cuidar la señal y la confianza', 'No: no existe ningún dato', 'Solo si Europa lo paga todo', 'Nunca se puede saber'],
      'Factible porque los datos, las personas y las leyes están; viable porque hay necesidad real, es el momento y tiene impacto.', 'fruto'),
  ];
}

const CAPITULOS_FACTIBILIDAD = [
  { desde: 0, ic: '⚖️', t: 'Dos preguntas del analista', piezas: ['suelo'],
    txt: 'Ya sabemos cuál es el problema. Antes de proponer algo, un analista pregunta: ¿se PUEDE hacer? ¿VALE LA PENA?' },
  { desde: 2, ic: '🔧', t: 'Las 4 factibilidades', piezas: ['r-act', 'r-dat', 'r-pro', 'r-con'],
    txt: 'Técnica, operativa, económica y legal. Cada pregunta revisa una. ¿Cuál es cuál?' },
  { desde: 6, ic: '📜', t: 'La propuesta', piezas: ['tronco'],
    txt: '¿Qué propone de verdad el Pasaporte Verde? Y ojo: ¿quién certifica?' },
  { desde: 8, ic: '🌱', t: 'La viabilidad', piezas: ['h1', 'h2', 'h3'],
    txt: '¿Vale la pena y se sostiene en el tiempo? Necesidad, momento, impacto… y riesgos.' },
  { desde: 11, ic: '🏆', t: 'El veredicto · Gran final', piezas: ['fruto'],
    txt: '¿El Pasaporte Verde es factible y viable? ¡Vale puntos dobles!' },
];

const armarRetos = () => TEMA === 'factibilidad' ? armarRetosFactibilidad() : armarRetosArbol();
const CAPITULOS_SALON = TEMA === 'factibilidad' ? CAPITULOS_FACTIBILIDAD : CAPITULOS_ARBOL;
