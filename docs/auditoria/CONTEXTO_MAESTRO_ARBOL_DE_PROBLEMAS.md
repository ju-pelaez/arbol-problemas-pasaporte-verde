# Contexto maestro — Árbol de Problemas · Expedición

Documento de referencia sobre el proyecto de **Juan Pablo Peláez Pino**. Lo escribió Claude (Claude Code) el 18-11-2026 como colaborador técnico y auditor, después de leer todo el repositorio (commit `dac9c20`), las guías PDF y la presentación, y de jugar la versión publicada. Los detalles técnicos están en `MAPA_TECNICO_Y_ARQUITECTURA.md`, los pedagógicos en `MAPA_PEDAGOGICO_Y_DINAMICAS.md`, los hallazgos en `INFORME_DE_AUDITORIA_Y_PRUEBAS.md` y las reglas de trabajo en `GUIA_PARA_FUTUROS_AGENTES.md`.

---

## 1. Identidad y autoría

| | |
|---|---|
| Nombre | Árbol de Problemas · Expedición |
| Autor del juego | Juan Pablo Peláez Pino — Ingeniería de Sistemas, Universidad de la Amazonia |
| Proyecto académico de base | Pasaporte Verde del Predio Amazónico — Juan Pablo Peláez y Brahiam Parra Bolaños |
| Asignatura | Análisis de Sistemas |
| Repositorio | https://github.com/ju-pelaez/arbol-problemas-pasaporte-verde |
| Aplicación | https://arbol-problemas-pasaporte-verde.vercel.app |
| Reto del salón | https://arbol-problemas-pasaporte-verde.vercel.app/salon/ (atajos `/reto`, `/sala`, `/factibilidad`) |
| Historia | 25 commits del 25-10-2026 al 05-11-2026, todos del autor |
| Licencia | «Proyecto académico. Universidad de la Amazonia, 2026» (README) |

## 2. Contexto académico y objetivo

En Análisis de Sistemas el árbol de problemas se usa para comprender el sistema **como funciona hoy (AS-IS)** antes de proponer soluciones. Juan Pablo y Brahiam analizaron el sistema de **acreditación de origen de la producción en el Caquetá** para su proyecto Pasaporte Verde. Juan Pablo convirtió ese análisis en un juego para que sus compañeros **construyan** el árbol en vez de solo verlo.

Objetivos que se deducen del código y de las guías:
- Que el estudiante entienda de dónde salen las causas (de observar el sistema real).
- Que ordene las causas por las cuatro dimensiones del análisis.
- Que lea el árbol de abajo hacia arriba y distinga causa, problema, efecto y entorno.
- Que no confunda análisis con solución.
- Que aplique el método a otro sistema y lo complemente con factibilidad/viabilidad, DFD y DFP.
- Que todo el curso participe a la vez (Reto del salón).

## 3. El problema que se analiza (contenido del caso)

**Problema central (tronco):** «En el sistema de acreditación de origen del Caquetá, el pequeño productor no puede demostrar que su producción es legal y libre de deforestación, porque sus actores, datos, procesos y mecanismos de control no están articulados.»

**Límites:** geográfico (arco de deforestación: Cartagena del Chairá, San Vicente del Caguán, Puerto Rico, Belén de los Andaquíes); organizacional (productor, asociación, acopiador, entidades, comprador); de proceso (del predio a acreditar el origen ante el comprador; quedan fuera transporte y gestión interna del predio); temporal (situación actual, línea base 31-12-2020).

**Modelo:** 4 entradas (producto del predio, documentos de tenencia, registros sanitarios, exigencia del comprador) → 6 procesos (producir, documentar, movilizar, acopiar, acreditar origen, comercializar) → 3 salidas (producto comercializado; **evidencia de origen incompleta o inexistente** — la que falla —; acceso o exclusión del mercado). Control: normativa, indicadores, retroalimentación («existe en el papel, opera débil»). 4 subsistemas: productivo, acopio y comercialización, registro y control institucional, acreditación.

**Causas (raíces, 3 por dimensión):**
- **Actores:** la exigencia de la UE baja y recae en el productor; el productor no entiende la «debida diligencia»; ICA, IDEAM y ANT-IGAC tienen cada uno una pieza, nadie el expediente.
- **Datos:** el dato de origen no nace en el predio (papel o memoria); ubicación y superficie no existen de forma sistemática; cobertura boscosa solo agregada y tenencia sin documentos.
- **Procesos:** documentar y acreditar depende de intermediarios y no es reproducible; el acopio mezcla predios sin conservar el origen; movilizar solo registra lo sanitario.
- **Control:** no hay indicadores; el requisito del comprador no está estandarizado; no hay retroalimentación.

**Efectos:** 4 directos (uno por dimensión: depende de intermediarios; el lote no se traza; evidencia incompleta; las pérdidas no se registran), 3 indirectos (ventas perdidas o castigadas; asociado a la deforestación sin causarla; se amplía la brecha) y 1 final (el pequeño productor queda excluido de la cadena formal).

**Entorno (suelo):** conectividad rural intermitente, tenencia informal, presión económica sobre el bosque, normativa internacional (Reglamento (UE) 2023/1115).

**Frase clave:** «Existe la exigencia, existe el dato ambiental y existe el registro institucional. Lo que no existe es la capacidad de convertirlos en conocimiento útil para quien decide.» Visto como sistema: asimetría de información.

**Propuesta (solo en la misión de factibilidad):** el Pasaporte Verde no es una app sino lineamientos L-01 a L-07 (el dato nace en el predio, integración de fuentes, traducción del requisito, sin conexión permanente, trazabilidad verificable, agregación por lote, medición del sistema). Reglas R-01 a R-04 (pérdida de cobertura posterior a la línea base no se acredita; fuente identificable; certifica la autoridad competente; trazabilidad del lote = la de todos sus predios). Requisitos citados: RI-06, RI-07, RI-09; Ley 1581 de 2012.

### 3.1 Actores y qué representan en el sistema

| Actor | Papel en el juego | Dimensión / relación |
|---|---|---|
| Pequeño productor (ganadero, cacaotero, cauchero) | Donde nace el dato; último eslabón que carga la exigencia | Actor central; fuente de datos |
| Comité Departamental de Ganaderos del Caquetá | Gremio regional | Eslabón de la cadena de exigencia; posible acompañante |
| ASOHECA | Asociación de caucheros (planta en La Montañita) | Gremio/asociación; acompañante en factibilidad operativa |
| Fedegán | Gremio ganadero nacional | Actor del territorio |
| Fedecacao | Gremio cacaotero nacional | Orienta sobre requisitos UE |
| Acopiadores y queseras | Juntan producto de muchas fincas | Proceso de acopio donde se pierde el origen |
| ICA | SINIGAN y guías de movilización | Dato sanitario; proceso movilizar |
| IDEAM | Monitoreo de bosques (SMByC) y alertas | Dato ambiental (escala agregada) |
| CORPOAMAZONIA | Autoridad ambiental regional | Control ambiental |
| ANT | Formaliza la tierra | Dato de tenencia |
| IGAC | Catastro | Dato de ubicación y superficie |
| Ministerio de Ambiente | Visión Amazonía, cero deforestación | Política |
| Unión Europea | Reglamento (UE) 2023/1115 | Control externo (entorno normativo) |
| Importadores europeos | Declaración de debida diligencia | Cadena de exigencia |
| Casa Luker, Compañía Nacional de Chocolates, frigoríficos, Automundial | Compradores | Exigencia y pedido |
| Instituto SINCHI, Universidad de la Amazonia | Investigación | Apoyo |

## 4. Narrativa y personajes

- **Ceibita:** una ceiba del Caquetá que guía la Expedición, explica y celebra. Cambia de cara (feliz, asombrada, pensativa, triste).
- **Don Arley:** cacaotero ficticio de Cartagena del Chairá; narra los capítulos. Su lote 127 (400 kg) se rechaza en Europa.
- **Monstruos de las batallas:** uno por misión, con nombre del tema (Neblina, Caja Negra, El Intermediario, Papelito Perdido, Trámite Infinito, El Dato Perdido, El Cuello de Botella, Ojo Ciego, Raíz Torcida, Enredo, Motosierra, Sin Señal, El Imposible, El Gran Desarticulado). En repaso aparece «Eco del Error».

## 5. Experiencias y mecánicas

Resumen (detalle en el Mapa pedagógico):

1. **Expedición** (`index.html`): mapa para caminar con 20 estaciones (14 misiones, 5 capítulos, Ceibita dice), 27 semillas con datos, XP y 10 rangos, estrellas, 112 preguntas, voz que lee e ilumina, pausa, atrás. Minijuegos: enlazar, armar, lanzar, (lluvia, sin uso), atrapa, memoria, unir, ordenar, V/F, relámpago, construir el árbol, batalla, DFD, DFP Bizagi, matriz factible/viable, voltea y decide. Herramientas: reto del salón, modo historia, Ceibita dice, fichas, árbol completo, repaso de errores. Ocultos: entrenamiento de exposición (`#entrenamiento`) y reloj de enfoque.
2. **Capítulos de Don Arley** (`vivo/`): Descubrir, Experimentar, Observar, Comprender (+ laboratorio), Aplicar (biblioteca), Demostrar. Modo salón (votar a mano), notas del presentador, atajos.
3. **Reto del salón** (`salon/`): proyector + celulares por QR; tema árbol (10 retos, 5 capítulos) y tema factibilidad (15 retos); 4 equipos; puntos, racha, rapidez, doble final; árbol del salón que crece si ≥50 % acierta; chat, reacciones, podio, premios, confeti; modo sin celulares.

### 5.1 Reglas principales

| Regla | Valor |
|---|---|
| Estrellas por misión | 3 sin errores · 2 con ≤2 · 1 con más (cuentan batalla, diagramas, matriz, voltea) |
| XP | +2 por explicación, +3 por acierto en minijuegos, +10..+20 por acierto en batalla, +30 + 10/estrella por misión; nivel cada 120 XP |
| Batalla | 3 corazones (4 en el jefe); cada acierto quita vida al monstruo; fallo → banco de errores |
| Minijuegos de clasificar | 3 corazones; la tarjeta fallada vuelve a salir; para ganar hay que ubicarlas todas |
| Salón: puntos | 500 × acierto + hasta 500 por rapidez si perfecto + 100 × (racha − 1); ×2 en el último |
| Salón: tiempo | 20 s por reto |
| Salón: equipo | entra al que tenga menos gente; gana el mejor promedio |

## 6. Arquitectura técnica (resumen)

Sitio estático en Vercel, sin frameworks. Canvas 2D para mundo y juegos de acción, SVG para árboles y diagramas, DOM para tarjetas. Web Speech y Web Audio. Estado en `localStorage`. Capítulos en iframe con `postMessage`. Salón sobre MQTT por WebSocket a un broker público (HiveMQ) con una capa `CanalPeer` que imita PeerJS (el salón empezó con WebRTC/PeerJS y migró a MQTT el 26-10-2026 porque fallaba con datos móviles y redes que aíslan aparatos). QR con `qrcode-generator`.

### 6.1 Mapa de módulos

| Módulo | Archivos | Depende de |
|---|---|---|
| Núcleo de la expedición | `index.html` | Google Fonts |
| Diagramas | `diagramas.js/.css` | globales de `index.html` |
| Factibilidad | `factibilidad.js/.css` | `DG.JUGO`, globales |
| Capítulos | `vivo/**` | Google Fonts; se integra por iframe |
| Salón | `salon/**` | mqtt.js 5.14.1, qrcode-generator 1.4.4 (jsDelivr), broker HiveMQ |
| Despliegue | `vercel.json` | Vercel |
| Material | `docs/*` | — |

## 7. Decisiones de diseño (técnicas y pedagógicas)

- **Sin frameworks ni compilación:** cero instalación, publicación directa, apto para celulares baratos (requisito no funcional del autor).
- **Todo dibujado con código** (sin imágenes): carga liviana y nitidez en el proyector.
- **Contenido como datos** (`MISSIONS`, `Q`, `FALLAS`, `retos.js`): cambiar el tema sin tocar motores.
- **Animación con intención** (reglas del autor: animar solo `transform`/`opacity`, curvas propias, menos movimiento si el sistema lo pide).
- **De WebRTC a MQTT** para funcionar en cualquier red, aceptando depender de un broker público.
- **QR siempre a la página publicada**, aunque la sala se abra en local.
- **Historia antes que teoría** y **descubrir el árbol** en vez de mostrarlo.
- **Equipos = las cuatro dimensiones**, para que cada estudiante «sea» una raíz.

## 8. Metodología de aprendizaje identificada

No hay una metodología formal declarada. Lo que sí se observa en el diseño:
- Aprendizaje activo: el estudiante clasifica, ordena, construye y decide; casi no hay pantallas solo para leer.
- Secuencia explícita en los capítulos: Descubrir → Experimentar → Observar → Comprender → Aplicar → Demostrar.
- Gamificación: puntos, niveles, estrellas, combos, rachas, monstruos, podio, equipos.
- Retroalimentación inmediata con explicación y pistas escalonadas.
- Repetición con variación y repaso de errores.
- Multimodalidad: texto, voz, color, gesto corporal, sonido.
- Transferencia: caso de la biblioteca.
- Colaboración y competencia en el salón.

## 9. Glosario

| Término | Significado en el proyecto |
|---|---|
| AS-IS | El sistema como funciona hoy, sin cambios |
| Sistema | Conjunto de elementos relacionados que persiguen un objetivo |
| Actor | Quien participa y cumple una función |
| Dato / información / conocimiento | Variable medible / datos relacionados con contexto / lo que permite decidir y actuar |
| Proceso | Tareas que transforman entradas en salidas |
| Mecanismo de control | Evalúa el sistema con indicadores y retroalimenta |
| Entorno | Lo que condiciona al sistema y no se controla desde él |
| Árbol de problemas | Causas (raíces), problema central (tronco), efectos (copa), entorno (suelo) |
| Factibilidad | ¿Se puede hacer? (técnica, operativa, económica, legal) |
| Viabilidad | ¿Vale la pena y se sostiene? (necesidad, momento, impacto, riesgos) |
| DFD | Diagrama de flujo de datos: entidades, procesos, almacenes, flujos |
| DFP | Diagrama de flujo de procesos (aquí con BPMN como en Bizagi): inicio, tareas, compuertas, fin, carriles |
| Trazabilidad | Seguir un lote hasta sus predios |
| Línea base | 31-12-2020 |
| Debida diligencia | Declaración que exige el reglamento europeo, con geolocalización |
| Acopio | Juntar producto de muchos predios en un lote |
| Arco de deforestación | Los cuatro municipios del límite geográfico |
| Sala / código | El proyector y su código de 4 caracteres en el Reto del salón |
| Broker MQTT | Servidor de mensajes público que conecta proyector y celulares |

## 10. Evidencias y limitaciones

- Evidencia y estado de cada funcionalidad: ver `INFORME_DE_AUDITORIA_Y_PRUEBAS.md` §3 y la columna «Estado» del Mapa pedagógico.
- Lo publicado coincide con el repositorio (verificado).
- Se jugó una partida completa del Reto del salón (10 retos, 3 celulares ficticios, con recarga, chat, tema factibilidad y modo sin celulares). No se repitió la prueba histórica de 49 jugadores (48 simulados + 1 real, según el PDF del autor) ni se probó una carga grande. En la primera sesión el broker público estaba muy lento y no se pudo jugar.
- Fechas legales y cifras del caso no se contrastaron con fuente oficial.
- La documentación del repositorio (README y PDF) está atrasada respecto al código en número de misiones, número y tipo de retos y la lluvia de tarjetas.

---

# INFORME FINAL

## 1. ¿Qué desarrolló exactamente?

Un juego web educativo de tres partes, sin frameworks, publicado en Vercel: una **Expedición** individual de 14 misiones con 15 tipos de minijuego en uso (más la lluvia de tarjetas, programada pero sin usar) y 112 preguntas; **cinco capítulos narrativos** en los que el árbol de problemas nace de la historia de un lote de cacao rechazado; y un **Reto del salón** tipo concurso en el que el proyector abre una sala con QR y cada estudiante juega desde su celular en uno de cuatro equipos mientras el árbol del salón crece. Incluye además constructores de DFD y DFP estilo Bizagi, un reto de factibilidad/viabilidad, un entrenamiento oculto para la exposición oral y materiales (presentación, mapa de actores, tres guías PDF).

## 2. ¿Por qué lo desarrolló?

Porque, en sus palabras, «un árbol de problemas se entiende de verdad cuando uno lo construye». Quería que sus compañeros descubrieran el árbol de su proyecto jugando, sin proponer soluciones, y que todo el salón participara a la vez.

## 3. ¿Para qué asignatura?

Análisis de Sistemas, Ingeniería de Sistemas, Universidad de la Amazonia (2026).

## 4. ¿Qué problema educativo intentó abordar?

Que el árbol de problemas se aprende como un dibujo terminado: el estudiante memoriza las partes pero no entiende de dónde salen las causas, por qué se organizan en cuatro dimensiones, cómo se lee ni por qué no lleva soluciones. También la participación pasiva en una exposición.

## 5. ¿Qué enseña el proyecto?

Análisis AS-IS de un sistema: límites, modelo entrada-proceso-salida-control-entorno, las cuatro dimensiones (actores, datos, procesos, control), el árbol de problemas completo y su lectura, dato-información-conocimiento, factibilidad (cuatro tipos) y viabilidad, y modelado con DFD y BPMN, todo aplicado a un caso real del Caquetá.

## 6. ¿Relación entre el Pasaporte Verde y el árbol de problemas?

El Pasaporte Verde del Predio Amazónico es el proyecto académico de Juan Pablo y Brahiam: analiza por qué el pequeño productor del Caquetá no puede demostrar que su producción es legal y libre de deforestación, ahora que el Reglamento (UE) 2023/1115 lo exige. El árbol de problemas es el **diagnóstico** de ese sistema (AS-IS). La propuesta del Pasaporte Verde (lineamientos L-01 a L-07) solo aparece después, en la misión de factibilidad y viabilidad, para no mezclar análisis con solución.

## 7. ¿Qué papel tiene Don Arley?

Es un personaje inventado que convierte el análisis en una historia. Su lote de cacao, rechazado aunque él no deforestó, crea la pregunta «¿por qué?»; las paradas de su viaje revelan las 12 fallas; esas fallas se vuelven las raíces del árbol. Don Arley también narra los capítulos y da nombre a las fallas del Reto del salón.

## 8. ¿Qué hace cada dinámica?

Ver la tabla del `MAPA_PEDAGOGICO_Y_DINAMICAS.md` §5. En una frase: las explicaciones presentan; enlazar, armar, lanzar, atrapa, memoria, unir y ordenar fijan la clasificación y las secuencias de formas distintas; verdadero/falso y relámpago corrigen y aceleran el recuerdo; la batalla evalúa con explicación; DFD y DFP hacen construir modelos con reglas; la matriz y voltea separan factibilidad de viabilidad; construir el árbol sintetiza; Ceibita dice ancla el árbol en el cuerpo; el laboratorio prueba la idea de «no están articulados»; la biblioteca transfiere el método.

## 9. ¿Cómo aprende un estudiante durante el recorrido?

Primero vive el problema (el lote rechazado) y ve el sistema completo. Aprende las piezas del sistema misión a misión, cada una con explicación breve leída en voz alta, varios minijuegos y una batalla. A mitad del camino revisa el viaje de Don Arley y clasifica las fallas; luego ve cómo esas fallas se convierten en un árbol y prueba en el laboratorio que arreglar una parte no basta. Después estudia lectura, tronco, copa y entorno, aplica el método a un caso nuevo, lo demuestra, lo extiende a factibilidad y viabilidad y lo integra contra el jefe final construyendo las 20 piezas. Sus errores vuelven en el repaso.

## 10. ¿Qué diferencia la experiencia individual de la colectiva?

La individual es profunda, al ritmo de cada uno, con pausa, voz y repaso. La colectiva es corta (10 o 15 retos de 20 s), guiada por el docente desde el proyector, y añade lo social: equipos que son las cuatro dimensiones, conversación antes de responder, un árbol que solo crece si el salón acierta, podio, premios, chat y reacciones.

## 11. ¿Cómo funciona la tecnología del reto del salón?

El proyector crea un cliente MQTT con identificador `arbolvivo-salon-CÓDIGO`, publica en el broker público de HiveMQ que la sala está abierta (mensaje retenido, con «testamento» que la cierra si se cae) y muestra el QR. Cada celular abre la URL con el código, se conecta al mismo broker, comprueba que la sala existe, pide entrar a su buzón y se presenta con nombre y un identificador guardado en el teléfono. A partir de ahí los mensajes viajan como pequeños objetos JSON a los buzones de cada uno. El proyector guarda todo en memoria, calcula puntos y equipos y reenvía la última pantalla a quien se reconecta. El chat se difunde por un tema común.

## 12. ¿Qué decisiones de ingeniería tomó?

Sitio estático sin dependencias de compilación; contenido separado de la lógica; motor de pasos genérico; bucles con delta de tiempo; pausa global; contenedores nuevos por paso para limpiar temporizadores; fases con turno; iframe con `postMessage` verificado; migración de WebRTC a MQTT; capa de compatibilidad que imita PeerJS para no reescribir el juego; reconexión por identificador; equipos por promedio; límites anti-spam; QR fijo a producción; respeto a `prefers-reduced-motion`; versionado de recursos (`?v=17`).

## 13. ¿Cuáles son las funcionalidades más importantes?

La historia de Don Arley y el momento en que nace el árbol; el laboratorio de articulación; las 14 misiones con batalla y banco de errores; los constructores de DFD y DFP; la matriz factible/viable; el Reto del salón con equipos, árbol colectivo y reconexión.

## 14. ¿Qué aspectos están mejor resueltos?

La pedagogía de «descubrir antes de nombrar»; la coherencia visual (un color por dimensión en todo); la retroalimentación con porqué y pistas escalonadas; la variedad de minijuegos que enseñan lo mismo de formas distintas; la arquitectura simple y fácil de publicar; y los detalles pensados para un aula real (modo sin celulares, recuperación de jugadores, guías para el docente).

## 15. ¿Qué dificultades se encontraron en la auditoría?

En la primera sesión el broker público estaba muy lento (conexión 12,5 s, suscripción 27 s) y no se pudo jugar; en la segunda respondió bien. Las pestañas del mismo navegador comparten almacenamiento y la del proyector se frena en segundo plano, así que hubo que usar contextos aislados y el panel del proyector visible. El arrastre sintético no se registró en el enlazar. Se hallaron cinco errores menores (flecha 8 del DFD, 24 vs 27 semillas, mensaje del celular tapado, desborde móvil de «Construir tu árbol», «¡Bien!» con 0 aciertos en el Relámpago), documentación atrasada y riesgos por usar un broker público sin autenticación.

## 16. ¿Qué podría mejorarse sin perder la identidad?

Corregir los tres errores; escapar todo lo que llega por red al celular; actualizar README y guías; ampliar los tiempos de espera del celular o avisar «servidor lento»; considerar un broker con credenciales o temas menos adivinables; decidir qué hacer con los juegos del celular y la lluvia que quedaron sin uso; contrastar cifras y fechas con fuentes oficiales; una pasada de accesibilidad con lector de pantalla. Todo dentro de la misma tecnología, estética y tono.

## Tabla de módulos

| Módulo | Qué hace | Qué enseña | Archivos | Estado de verificación |
|---|---|---|---|---|
| Mapa para caminar | Mundo con estaciones, semillas y árbol que crece | Recorrido del curso; datos clave | `index.html` (`world`, `STATIONS`, `FACTS`) | VERIFICADA (carga) |
| Misiones 1-5, 8-12 | Explicación + minijuegos + batalla | Sistema, modelo, actores, datos, procesos, control, árbol, problema, efectos, entorno | `index.html` (`MISSIONS`, `RUN`, `Q`) | VERIFICADA (cada minijuego resuelto por programa y misión 1 jugada a mano; sin arrastre con dedo real) |
| DFD | Constructor de diagrama de flujo de datos | Símbolos y reglas del DFD; salida que falla | `diagramas.js` | VERIFICADA (error E1) |
| DFP Bizagi | Constructor BPMN con carriles | Quién, qué, orden, compuerta | `diagramas.js` | VERIFICADA (diagrama completo, 600 ⭐) |
| Factibilidad y viabilidad | Matriz, voltea, enlazar, memoria, atrapa, relámpago | ¿Se puede? ¿Vale la pena? | `factibilidad.js`, `index.html` | VERIFICADA (matriz y voltea; el resto por programa) |
| Jefe final | Construir 20 piezas + relámpago + batalla | Síntesis del árbol | `index.html` (`RUN.build`) | PARCIAL (20/20 por programa; desborde móvil E4) |
| Herramientas | Fichas, árbol completo, repaso, Ceibita dice | Repaso, cuerpo | `index.html` (`SCREENS`) | IMPLEMENTADA |
| Entrenamiento de exposición | 7 etapas con micrófono | Exposición oral | `index.html` (`EXPO`, `#entrenamiento`) | IMPLEMENTADA |
| Pausa / atrás / voz | Control del ritmo | Accesibilidad | `index.html` | VERIFICADA (pausa) |
| Capítulos de Don Arley | Historia en 6 fases y laboratorio | Origen de las causas, articulación, transferencia | `vivo/**` | PARCIAL (portada, camino, nace el árbol y laboratorio verificados; faltan viaje, otro sistema y demuéstralo completos) |
| Reto del salón — árbol | 10 retos en 5 capítulos | Árbol en grupo | `salon/**` | VERIFICADA (partida completa con 3 celulares ficticios) |
| Reto del salón — factibilidad | 15 retos con matriz | Factibilidad en grupo | `salon/retos.js` | PARCIAL (sala, equipos y matriz verificados; no se jugaron los 15) |
| Conexión MQTT | Mensajería proyector-celulares | — | `salon/canal.js` | VERIFICADA (3 celulares, recarga y reconexión; muy lenta en la 1.ª sesión) |
| Despliegue | Publicación y atajos | — | `vercel.json` | VERIFICADA |
| Material docente | Árbol, actores, guías | Guion de clase | `docs/*` | DOCUMENTADA (desactualizada en parte) |

## Explicación en tres niveles

### 30 segundos

«Hice un juego web para aprender el árbol de problemas de nuestro proyecto Pasaporte Verde. Un campesino del Caquetá manda su cacao a Europa y se lo rechazan; siguiendo su viaje, el estudiante encuentra dónde falla el sistema y esas fallas se convierten en las raíces del árbol. Se puede jugar solo, con misiones y minijuegos, o con todo el salón desde el celular mientras el árbol crece en el proyector.»

### 2 minutos (para un docente o evaluador)

«En Análisis de Sistemas el árbol de problemas se suele ver como una diapositiva. Yo quise que se construyera. Tomé el análisis AS-IS de nuestro proyecto —por qué el pequeño productor del Caquetá no puede demostrar que su producción es legal y libre de deforestación— y lo convertí en tres experiencias. Primero, una historia: Don Arley, un personaje inventado, envía su lote y lo rechazan; el estudiante revisa el camino con las cuatro preguntas del analista —actores, datos, procesos y control— y clasifica doce fallas que, al final, se convierten solas en las raíces de un árbol. Un laboratorio muestra que arreglar una sola columna no salva el lote: por eso el problema es que las partes no están articuladas. Segundo, una expedición de catorce misiones con explicaciones leídas en voz alta, minijuegos variados, batallas de preguntas y un banco de errores; incluye DFD, DFP como en Bizagi y factibilidad y viabilidad. Tercero, el Reto del salón: el profesor abre una sala con QR, cada estudiante entra con su celular a un equipo que es una de las cuatro dimensiones, y el árbol del salón solo crece si la mayoría acierta. Todo es HTML, CSS y JavaScript, publicado en Vercel, sin instalar nada.»

### 5 minutos (técnica y pedagógica, para presentación universitaria)

1. **Problema educativo (30 s).** El árbol de problemas se memoriza como dibujo; no se entiende de dónde salen las causas ni por qué no lleva soluciones.
2. **Caso (45 s).** Pasaporte Verde: acreditación de origen en el Caquetá ante el Reglamento (UE) 2023/1115. Tronco: el pequeño productor no puede demostrar el origen legal y libre de deforestación porque actores, datos, procesos y control no están articulados. Doce causas en cuatro columnas, efectos en tres pisos, entorno en el suelo. Actores reales: ICA, IDEAM, CORPOAMAZONIA, ANT, IGAC, gremios y la Unión Europea.
3. **Diseño pedagógico (1 min 15 s).** Descubrir antes de nombrar: los capítulos siguen Descubrir, Experimentar, Observar, Comprender, Aplicar y Demostrar. El árbol aparece a partir de lo que el estudiante encontró. Luego práctica distribuida: catorce misiones, cada una con explicación breve, minijuegos que enseñan lo mismo de formas distintas, batalla con explicación y repaso de errores. Colores fijos por dimensión, pistas escalonadas, voz que ilumina, gestos del cuerpo, transferencia a un caso nuevo y, en el salón, cooperación (árbol colectivo) y competencia (podio), con equipos que ganan por promedio.
4. **Arquitectura (1 min 30 s).** Sitio estático sin frameworks: un motor de pasos genérico (`RUN[tipo]`) recorre misiones definidas como datos; Canvas 2D con bucles por delta de tiempo para los juegos de acción; SVG para árboles y diagramas; Web Speech y Web Audio para voz y sonido sin archivos; estado en `localStorage`. Los capítulos viven en un iframe y avisan su resultado con `postMessage`. El salón usa MQTT por WebSocket a un broker público, con una capa propia que imita PeerJS: empecé con WebRTC, pero fallaba con datos móviles y redes que aíslan aparatos. El proyector calcula puntos (acierto, rapidez, racha, doble final) y recupera a quien se reconecta por un identificador guardado en el celular.
5. **Calidad y límites (45 s).** Lo publicado coincide con el repositorio; respeta `prefers-reduced-motion`; tiene plan B sin celulares. Límites honestos: el broker público no garantiza velocidad ni privacidad, hay tres errores menores identificados y la documentación necesita ponerse al día con las últimas misiones.
6. **Cierre (15 s).** «Un árbol de problemas no se inventa: sale de mirar dónde falla el sistema real.»

## Patrones reutilizables vs. identidad propia

Ver `GUIA_PARA_FUTUROS_AGENTES.md` §8. En resumen: son reutilizables el motor de pasos por datos, el banco de preguntas con repaso, la lectura iluminada, la clasificación con varias formas de juego, el constructor de diagramas en tres momentos, la matriz de dos criterios, la estructura narrativa «descubrir antes de nombrar» y la sala multijugador con QR y equipos. Son propios de este proyecto: el caso del Caquetá, Don Arley, Ceibita, los monstruos, las causas y actores reales, y los equipos que son las raíces del árbol.
