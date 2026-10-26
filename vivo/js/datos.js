// datos.js
// Aquí está todo el contenido del juego: estaciones, fallas, el árbol, el caso de la biblioteca
// y el reto final. La lógica está en los otros archivos. Si quiero cambiar un texto, lo cambio
// aquí y no toco nada más.

// Los 4 componentes del sistema (lo que vimos en Análisis de Sistemas).
//   def:     qué es, en una frase
//   ejemplo: cómo se ve en el caso del cacao
const COMPONENTES = {
  act: { nombre: 'Actores',  pregunta: '¿Quién participa?', icono: '👥',
         def: 'Las personas y entidades que participan en el sistema y cumplen una función.',
         ejemplo: 'Don Arley, el Comité de Ganaderos, ASOHECA, el ICA, el IDEAM, CORPOAMAZONIA, la ANT y la Unión Europea.' },
  dat: { nombre: 'Datos',    pregunta: '¿Qué información?', icono: '📊',
         def: 'La información que el sistema necesita para funcionar y para decidir.',
         ejemplo: 'Dónde queda el predio, cuánto bosque tiene, de quién es la tierra y qué predios forman el lote.' },
  pro: { nombre: 'Procesos', pregunta: '¿Qué se hace?',     icono: '🔁',
         def: 'Las tareas que transforman lo que entra al sistema en lo que sale.',
         ejemplo: 'Producir, documentar, movilizar, acopiar, acreditar el origen y vender.' },
  con: { nombre: 'Control',  pregunta: '¿Cómo se evalúa?',  icono: '🎯',
         def: 'Cómo se mide y se corrige el sistema: normas, indicadores y retroalimentación.',
         ejemplo: 'El reglamento europeo, lo que se mide de cada lote y el registro de lo que salió mal.' },
};
const ORDEN = ['act', 'dat', 'pro', 'con'];

// Lo que aparece en la cortinilla al empezar cada fase.
const INTROS = {
  descubrir:    'Manda el lote de Don Arley y mira qué pasa.',
  experimentar: 'Revisa el camino parada por parada y encuentra qué falla.',
  observar:     'Mira de dónde salió cada falla.',
  comprender:   'Descubre qué armaste sin darte cuenta.',
  aplicar:      'Usa el mismo método en un sistema que no conoces.',
  demostrar:    'Arma el árbol tú solo.',
};

// El sistema completo, visto como entradas, procesos, salidas, control y entorno (AS-IS).
const SISTEMA = {
  entradas: ['🍫 Cacao del predio', '📄 Documentos de la tierra', '💉 Registros sanitarios', '🌍 Exigencia del comprador'],
  salidas: [
    { t: '📦 Producto vendido', mal: false },
    { t: '🔎 Evidencia de origen: incompleta', mal: true },
    { t: '🚪 Acceso… o exclusión del mercado', mal: true },
  ],
  control: 'Normas (Reglamento (UE) 2023/1115) e indicadores',
  entorno: 'Conectividad rural · tenencia informal · presión sobre el bosque · mercado internacional',
};

// Conceptos que se pueden consultar en cualquier momento (tecla G).
const GLOSARIO = [
  ['Sistema', 'Conjunto de partes relacionadas que trabajan para un objetivo. Aquí: todo lo que pasa desde que el cacao sale del predio hasta que el comprador lo acepta o lo rechaza.'],
  ['AS-IS', 'El sistema como funciona hoy, sin cambiarle nada. El análisis empieza aquí.'],
  ['Actores', 'Quiénes participan y qué función cumplen.'],
  ['Datos', 'La información que el sistema necesita para funcionar.'],
  ['Procesos', 'Las tareas que transforman lo que entra en lo que sale.'],
  ['Mecanismos de control', 'Cómo se evalúa el sistema: normas, indicadores y retroalimentación.'],
  ['Entorno', 'Lo que afecta al sistema pero no se controla desde él: la señal, la tenencia de la tierra, la norma europea.'],
  ['Árbol de problemas', 'Un mapa del problema: causas abajo (raíces), el problema central en el tronco y los efectos arriba (copa). Se lee de abajo hacia arriba.'],
  ['Causa', 'Algo que hace que el problema exista. Responde "¿por qué pasa?".'],
  ['Problema central', 'Una sola situación negativa, dicha en términos del sistema.'],
  ['Efecto', 'Lo que el problema produce. Responde "¿y entonces qué pasa?".'],
  ['Trazabilidad', 'Poder seguir un lote hasta los predios de donde salió.'],
  ['Línea base', '31 de diciembre de 2020: la fecha contra la que se compara el bosque de cada predio.'],
  ['ICA', 'Instituto Colombiano Agropecuario: registra el ganado (SINIGAN) y expide las guías para moverlo.'],
  ['IDEAM', 'Monitorea los bosques (SMByC) y publica alertas tempranas de deforestación cada trimestre.'],
  ['CORPOAMAZONIA', 'Autoridad ambiental de Caquetá, Putumayo y Amazonas, con sede en Florencia.'],
  ['ANT', 'Agencia Nacional de Tierras: formaliza la propiedad y adjudica baldíos.'],
  ['Reglamento (UE) 2023/1115', 'La norma europea que exige demostrar que un producto no viene de tierras deforestadas. Rige desde el 30-12-2026 (grandes) y el 30-06-2027 (pequeños).'],
];

// El camino del lote: del predio hasta el comprador en Europa.
// Son los 6 procesos del sistema actual (AS-IS) más el destino.
const ESTACIONES = [
  { id: 'predio',        nombre: 'Producir',       icono: '🌱', lugar: 'Predio' },
  { id: 'documentar',    nombre: 'Documentar',     icono: '📋', lugar: 'Papeles' },
  { id: 'movilizar',     nombre: 'Movilizar',      icono: '🚚', lugar: 'Guía' },
  { id: 'acopiar',       nombre: 'Acopiar',        icono: '🏚️', lugar: 'Acopio' },
  { id: 'acreditar',     nombre: 'Acreditar',      icono: '🔏', lugar: 'Evidencia' },
  { id: 'comercializar', nombre: 'Comercializar',  icono: '🤝', lugar: 'Venta' },
  { id: 'comprador',     nombre: 'Comprador UE',   icono: '🌍', lugar: 'Destino' },
];

// Las 12 fallas que el jugador encuentra en el camino.
// Cada una es una CAUSA del árbol de problemas.
//   estacion: dónde aparece
//   comp:     a qué componente pertenece (la respuesta correcta)
//   escena:   lo que ve el jugador
//   causa:    cómo queda escrita en el árbol
//   porque:   la explicación corta después de responder
const FALLAS = [
  { id: 1, estacion: 'predio', comp: 'dat', icono: '📒',
    escena: 'Don Arley anota la cosecha en un cuaderno. El lote sale del predio sin ubicación.',
    causa: 'El dato de origen no se genera en el predio: se anota en papel o de memoria',
    porque: 'La información debería nacer aquí y no nace. Eso es un problema de DATOS.' },
  { id: 2, estacion: 'predio', comp: 'dat', icono: '📐',
    escena: '¿Cuántas hectáreas tiene la finca? "Como unas 40", calcula Don Arley.',
    causa: 'Ubicación y superficie del predio no existen de forma sistemática',
    porque: 'La superficie es un cálculo a ojo, no un dato medido. DATOS.' },
  { id: 3, estacion: 'documentar', comp: 'act', icono: '🤯',
    escena: 'Le llega un papel de la Unión Europea: "declaración de debida diligencia con geolocalización de parcelas". No entiende qué le piden.',
    causa: 'El productor no entiende la “debida diligencia” que pide la UE: llega en lenguaje técnico',
    porque: 'El problema es a quién le llega la exigencia y cómo le llega. ACTORES.' },
  { id: 4, estacion: 'documentar', comp: 'dat', icono: '🗺️',
    escena: 'El mapa del IDEAM muestra la región entera, no su finca. Y la ANT nunca le formalizó la tierra.',
    causa: 'Cobertura boscosa solo a escala agregada; tenencia sin documentos',
    porque: 'El dato existe, pero no a nivel de predio. DATOS.' },
  { id: 5, estacion: 'movilizar', comp: 'pro', icono: '💉',
    escena: 'La guía del ICA para mover el ganado revisa vacunas y sanidad. Nadie revisa el bosque.',
    causa: 'Movilizar se registra solo en lo sanitario: no cruza con lo ambiental',
    porque: 'Es la forma en que se hace el trámite. PROCESOS.' },
  { id: 6, estacion: 'movilizar', comp: 'act', icono: '🏝️',
    escena: 'El ICA tiene la guía del ganado, el IDEAM el mapa del bosque y la ANT los papeles de la tierra. Ninguna oficina habla con la otra.',
    causa: 'ICA (ganado), IDEAM (bosque) y ANT-IGAC (tierra) tienen cada uno una pieza; nadie tiene el expediente',
    porque: 'Son los participantes del sistema trabajando como islas. ACTORES.' },
  { id: 7, estacion: 'acopiar', comp: 'pro', icono: '🌀',
    escena: 'El cacao de Don Arley se mezcla con el de 30 fincas más. Ya nadie sabe qué vino de dónde.',
    causa: 'Acopiar une varios predios en un lote sin conservar el origen de cada uno',
    porque: 'Es una tarea que transforma el producto y en el camino pierde el origen. PROCESOS.' },
  { id: 8, estacion: 'acreditar', comp: 'pro', icono: '🗂️',
    escena: 'Un intermediario arma la carpeta a mano y a su manera. Si otro la revisa, no puede rehacerla.',
    causa: 'Documentar y acreditar depende de intermediarios y no es reproducible',
    porque: 'Es cómo se ejecuta la tarea de acreditar. PROCESOS.' },
  { id: 9, estacion: 'acreditar', comp: 'act', icono: '⬇️',
    escena: 'La Unión Europea le exige al importador, el importador al comprador, el comprador al Comité de Ganaderos… y todo cae en Don Arley.',
    causa: 'La exigencia de la UE baja por compradores y gremios y recae en el productor, el de menos capacidad',
    porque: 'Es sobre quién termina cargando la exigencia. ACTORES.' },
  { id: 10, estacion: 'acreditar', comp: 'con', icono: '📏',
    escena: 'Un comprador pide coordenadas, otro fotos satelitales, otro un certificado. No hay una regla común.',
    causa: 'El requisito del comprador no está estandarizado: cada uno define el suyo',
    porque: 'Es el criterio con el que se evalúa el lote. CONTROL.' },
  { id: 11, estacion: 'comercializar', comp: 'con', icono: '📉',
    escena: '¿Cuántas fincas del Caquetá podrían demostrar hoy su origen? El tablero está vacío: nadie lo sabe.',
    causa: 'No hay indicadores: nadie mide cuántos predios pueden acreditar su origen',
    porque: 'Sin medición no hay evaluación. CONTROL.' },
  { id: 12, estacion: 'comercializar', comp: 'con', icono: '🔁',
    escena: 'El lote rechazado no queda registrado en ningún lado. El próximo va a salir igual.',
    causa: 'Sin retroalimentación: el sistema no detecta su propia falla',
    porque: 'El sistema no aprende de su error porque no lo ve. CONTROL.' },
];

// El tronco: el problema central, dicho en términos del sistema.
const PROBLEMA = 'El pequeño productor del Caquetá no puede demostrar que su producción es legal y libre de deforestación, porque sus actores, datos, procesos y mecanismos de control no están articulados.';

// La copa: lo que el problema produce.
const EFECTOS = {
  directos: {
    act: 'Depende de intermediarios y no sabe qué le exigen',
    dat: 'El lote no se puede rastrear hasta su predio',
    pro: 'La evidencia de origen sale incompleta',
    con: 'Las pérdidas no se registran ni se corrigen',
  },
  indirectos: [
    'Ventas perdidas o castigadas en precio',
    'Queda marcado como deforestador sin serlo',
    'Se agranda la brecha con los productores grandes',
  ],
  final: 'El pequeño productor queda por fuera de la cadena formal',
};

// El suelo: lo que condiciona al sistema pero no se controla desde él.
const ENTORNO = ['Conectividad rural intermitente', 'Tenencia informal de la tierra', 'Presión económica sobre el bosque', 'Norma europea (UE 2023/1115)'];

// Fase "Aplicar": un caso nuevo para ver si el método se entendió.
// Es un caso inventado para practicar, no es parte del proyecto.
const BIBLIOTECA = {
  situacion: 'En la biblioteca de la universidad, los estudiantes no encuentran los libros que necesitan.',
  causas: [
    { texto: 'Cada facultad compra libros sin avisarle a la biblioteca', comp: 'act', porque: 'Son participantes que no se coordinan: ACTORES.' },
    { texto: 'El catálogo no dice si el libro está prestado', comp: 'dat', porque: 'Falta información en el momento en que se necesita: DATOS.' },
    { texto: 'Un libro devuelto tarda una semana en volver al estante', comp: 'pro', porque: 'Es una tarea que se hace mal: PROCESOS.' },
    { texto: 'Nadie mide cuántas búsquedas terminan sin encontrar el libro', comp: 'con', porque: 'No hay indicador, entonces no hay evaluación: CONTROL.' },
    { texto: 'Los estudiantes no saben usar el catálogo', comp: 'act', porque: 'Es sobre quién participa y qué capacidad tiene: ACTORES.' },
    { texto: 'La ubicación del libro en el estante está mal registrada', comp: 'dat', porque: 'Es un dato equivocado: DATOS.' },
    { texto: 'Para prestar un libro hay que hacer fila en tres ventanillas', comp: 'pro', porque: 'Es la forma de hacer la tarea: PROCESOS.' },
    { texto: 'Las quejas de los estudiantes no llegan a nadie', comp: 'con', porque: 'Falta retroalimentación: CONTROL.' },
    { texto: 'El internet del campus se cae seguido', comp: 'env', porque: 'La biblioteca no lo controla: es ENTORNO.' },
  ],
  troncos: [
    { texto: 'Los estudiantes no encuentran los libros porque los actores, datos, procesos y control de la biblioteca no están articulados', ok: true, porque: 'Una sola situación negativa, dicha en términos del sistema.' },
    { texto: 'Falta comprar una aplicación para la biblioteca', ok: false, porque: 'Eso ya es una solución. El tronco describe el problema.' },
    { texto: 'El internet del campus se cae', ok: false, porque: 'Eso es entorno, y además es una sola causa.' },
  ],
  efectos: [
    { texto: 'Los estudiantes dejan de usar la biblioteca', ok: true, porque: 'Es una consecuencia del problema: va en la copa.' },
    { texto: 'Nadie mide las búsquedas fallidas', ok: false, porque: 'Eso es una causa (control): va en las raíces.' },
    { texto: 'El internet se cae', ok: false, porque: 'Eso es entorno: va en el suelo.' },
  ],
};

// Fase "Demostrar": el reto final con el árbol real.
const RETO = {
  piezas: [
    { texto: 'Cada entidad tiene una pieza del expediente', zona: 'act' },
    { texto: 'La ubicación del predio no existe de forma sistemática', zona: 'dat' },
    { texto: 'Acopiar mezcla predios sin conservar el origen', zona: 'pro' },
    { texto: 'Nadie mide cuántos predios pueden acreditar', zona: 'con' },
    { texto: 'El productor queda por fuera de la cadena formal', zona: 'copa' },
    { texto: 'Ventas castigadas en precio', zona: 'copa' },
    { texto: 'Conectividad rural intermitente', zona: 'suelo' },
    { texto: 'La norma europea define la exigencia y sus fechas', zona: 'suelo' },
  ],
  preguntas: [
    { q: '¿De dónde salieron las raíces del árbol?',
      opciones: [
        { t: 'De observar dónde falla el sistema real', ok: true },
        { t: 'De las soluciones que queremos construir', ok: false },
        { t: 'De lo que creemos que podría pasar', ok: false } ],
      porque: 'El árbol no se inventa: sale de analizar el sistema como funciona hoy.' },
    { q: '¿Por qué arreglar solo los datos no salva el lote?',
      opciones: [
        { t: 'Porque actores, procesos y control siguen fallando: no están articulados', ok: true },
        { t: 'Porque los datos no importan', ok: false },
        { t: 'Porque Europa no compra cacao', ok: false } ],
      porque: 'El problema es del sistema completo, no de una sola parte.' },
    { q: '¿Por qué la conectividad va en el suelo y no en las raíces?',
      opciones: [
        { t: 'Porque es entorno: condiciona al sistema pero no se controla desde él', ok: true },
        { t: 'Porque no afecta en nada', ok: false },
        { t: 'Porque es un efecto del problema', ok: false } ],
      porque: 'Lo que el sistema no controla se pone aparte, como entorno.' },
  ],
};

// Lo que digo en cada pantalla cuando presento (se ve con la tecla N).
const NOTAS = {
  portada: 'Saludo. "Les traje un juego para explicar nuestro árbol de problemas. La idea es que lo descubran jugando, no que yo se los explique." Pedir un voluntario o que el salón decida.',
  descubrir: 'Que alguien toque "Enviar el lote". Cuando lo rechacen, preguntar: "Don Arley no tumbó monte. ¿Por qué creen que se lo rechazaron?" Escuchar 2 o 3 respuestas.',
  experimentar: 'En cada estación el salón vota a qué componente pertenece la falla (1 Actores, 2 Datos, 3 Procesos, 4 Control). Si se equivocan, leer la explicación en voz alta. Recordar: ¿quién? ¿qué información? ¿qué se hace? ¿cómo se evalúa?',
  observar: '"Fíjense: cada falla del camino quedó abajo, en su columna. El lote no se cae por una sola cosa, se cae en todo el camino."',
  comprender: 'Dejar que se arme el árbol sin hablar. Después: "Esto que ustedes encontraron tiene nombre: es un árbol de problemas." En el laboratorio, que prueben arreglar una sola columna y vean que el lote igual se cae. Esa es la idea de "no están articulados".',
  aplicar: '"Ahora un caso nuevo, sin ayudas: la biblioteca." Es inventado, solo para practicar el método. Que el salón vote cada causa.',
  demostrar: 'Reto final. Si hay tiempo, pasa un compañero a armar el árbol. Cerrar con las 3 preguntas de "por qué".',
  final: 'Cierre: "Un árbol de problemas no se inventa: sale de mirar dónde falla el sistema." Dar las gracias y abrir preguntas.',
};
