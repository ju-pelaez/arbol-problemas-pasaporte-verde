# Guía para futuros agentes y desarrolladores

Manual de incorporación al proyecto **Árbol de Problemas · Expedición**, creado por **Juan Pablo Peláez Pino** (Ingeniería de Sistemas, Universidad de la Amazonia). Escrita por Claude en la auditoría del 18-11-2026. Si eres una IA o una persona que va a trabajar aquí, lee esto primero.

> No existían instrucciones previas para agentes en el repositorio (no hay `CLAUDE.md`, `AGENTS.md` ni similares). Esta guía es la primera.

## 1. Reglas que no se negocian

1. **El autor es Juan Pablo Peláez Pino.** Nunca te atribuyas el proyecto. El análisis académico Pasaporte Verde es de Juan Pablo Peláez y **Brahiam Parra Bolaños**; el juego es de Juan Pablo.
2. **No hagas commits, push ni despliegues** sin que el autor lo pida. Vercel publica lo que hay en la rama.
3. **No reemplaces la tecnología** (sin frameworks, sin compilación) solo porque existan opciones más populares. Es una decisión deliberada: se publica tal cual y cualquiera lo puede abrir.
4. **No rompas la identidad:** Ceibita, Don Arley (ficticio), el bosque nocturno, la letra Nunito, los colores por dimensión, el tono cercano en español de Colombia, el enfoque AS-IS (sin soluciones en el árbol).
5. **Escribe como el autor:** español sencillo, segunda persona («tú»), frases cortas, comentarios de código en primera persona y en español («Aquí guardo…»).
6. No uses datos reales de estudiantes en pruebas; usa nombres ficticios.

## 2. Qué leer, en orden

1. `docs/auditoria/CONTEXTO_MAESTRO_ARBOL_DE_PROBLEMAS.md` — el todo.
2. `docs/auditoria/MAPA_TECNICO_Y_ARQUITECTURA.md` — cómo está hecho.
3. `docs/auditoria/MAPA_PEDAGOGICO_Y_DINAMICAS.md` — qué enseña cada cosa.
4. `docs/auditoria/INFORME_DE_AUDITORIA_Y_PRUEBAS.md` — errores conocidos y riesgos.
5. `README.md` (atención: tiene datos desactualizados, ver informe D1-D5).
6. El código de la parte que vas a tocar.

## 3. Constantes de diseño

| Elemento | Valor |
|---|---|
| Actores | `#1E8C4E` (verde) · ícono 👥 |
| Datos | `#2B7BB9` (azul) · ícono 📊 |
| Procesos | `#D0661C` (naranja) · ícono 🔁 |
| Control | `#C99300` / `#B88600` (dorado) · ícono 🎯 |
| Fondo selva | `#0E3424` · tinta `#14231B` · crema `#FFF7E8` · amarillo `#FFC23D` |
| Letra | Nunito (Google Fonts) |
| Estilo | Bordes gruesos de tinta, sombras sólidas («cartón»), emojis como íconos, animaciones solo de `transform`/`opacity`, respetar `prefers-reduced-motion` |

## 4. Dónde intervenir según la tarea

| Quiero… | Archivo | Qué tocar | Qué puede romperse |
|---|---|---|---|
| Cambiar un texto de una explicación | `index.html` | `MISSIONS[...].steps` (tipo `talk`, campos `say` y `card`) | Nada, si mantienes `**negritas**` y HTML válido |
| Agregar o cambiar preguntas de batalla | `index.html` | `Q.<banco>`: `[pregunta, correcta, mala1, mala2, mala3, porqué]` | El banco de errores usa ids `banco-índice`: si reordenas, los errores guardados apuntan a otra pregunta |
| Agregar un paso a una misión | `index.html` | `MISSIONS` o con `addBefore('misión', paso)` | Las estrellas solo cuentan errores de battle, dfd/bpmn, matriz y voltea |
| Cambiar cómo se juega una clasificación | `index.html` | el bloque que asigna `modo` (`enlazar`, `armar`, `lanzar`; sin modo = `lluvia`) | `armar` necesita `capas` |
| Crear un minijuego nuevo | `index.html` (o archivo aparte cargado antes del script principal) | `RUN.nuevo=(host,st,ctx,done)=>{…}`; llamar `done()` al terminar; sumar a `ctx.errors` si quieres que afecte estrellas | Apagar listeners de teclado al salir; revisar `host.isConnected` en bucles |
| Agregar una misión | `index.html` | objeto en `MISSIONS`, id en `ORDEN_MISIONES`, estación en `STATIONS`, banco en `Q` | `W_END` y semillas se recalculan solos; las guías PDF quedarán desactualizadas |
| Mejorar el minijuego de factibilidad | `factibilidad.js` (`MATRIZ`: `CUADROS`, `DIARIOS`, `CASO`; `VOLTEA`: `CARTAS`) y `factibilidad.css` | Usa `DG.JUGO` y globales de `index.html` (`$`, `tone`, `addXP`, `shuffle`, `pick`) | La misión `factibilidad` en `index.html` y `Q.factibilidad`; el reto del salón de factibilidad está aparte en `salon/retos.js` |
| Cambiar el DFD o el DFP | `diagramas.js` (`DFD`, `DFD_CFG`, `BP`, `BP_CFG`) | Nodos con coordenadas fijas; flujos `{de, a, d, por}` | Ojo con el error E1 (número de flecha en el cierre) |
| Cambiar la historia de Don Arley | `vivo/js/datos.js` | `FALLAS`, `ESTACIONES`, `EFECTOS`, `BIBLIOTECA`, `RETO`, `NOTAS` | Las 12 fallas deben coincidir con las 12 `CAUSAS` de `index.html` y con `FALLAS_SALON` de `salon/retos.js` |
| Cambiar una fase de los capítulos | `vivo/js/fases/N-*.js` | `Fases.nombre.entrar(lienzo, turno)` | Revisar `sigue(turno)` después de cada `await`; el mapa de capítulos está en `CAPITULOS` de `vivo/js/juego.js` |
| Cambiar retos del salón | `salon/retos.js` | `armarRetosArbol()`, `armarRetosFactibilidad()`, `CAPITULOS_*` (campo `desde` = índice del primer reto del capítulo) | Las piezas (`pieza`) deben ser ids del SVG: `suelo`, `r-act`, `r-dat`, `r-pro`, `r-con`, `tronco`, `h1`, `h2`, `h3`, `fruto`; el último reto vale doble |
| Cambiar puntos, tiempos o equipos del salón | `salon/salon.js` | `TIEMPO`, `revelar()`, `equipos()`, `equipoMenor()` | Los textos de las guías y del README describen la fórmula |
| Cambiar la conexión del salón | `salon/canal.js` | `CANAL_SERVIDOR`, `CANAL_RAIZ`, `CanalPeer` | **Todo el salón**. Mantén la API (`on`, `connect`, `send`, `close`, `reconnect`, `destroy`, `difundir`) |
| Cambiar enlaces cortos | `vercel.json` | `redirects` | El QR apunta a `PUBLICO` en `salon.js` |

## 5. Contenido duplicado que hay que mantener sincronizado

El mismo análisis vive en varios lugares:

- Problema central: `PROBLEMA` en `index.html` y en `vivo/js/datos.js` (redacción algo distinta), `ORDEN_PROBLEMA` en `salon/retos.js`, el PPTX/PNG de `docs/`.
- 12 causas: `CAUSAS` (`index.html`), `FALLAS` (`vivo/js/datos.js`), `FALLAS_SALON` (`salon/retos.js`, redactadas como escenas), PPTX.
- Efectos: `EFD`, `EFI`, `EFF` (`index.html`), `EFECTOS` (`vivo`), `EFECTOS_DIRECTOS` (`salon`, hoy sin uso).
- Fechas del reglamento: `Q.actores`, `Q.control`, `Q.factibilidad`, `FACTS`, `GLOSARIO` de `vivo`, `factibilidad.js`, fase «descubrir».

Si cambias uno, busca los demás (`grep` por una frase).

## 6. Cómo probar

- Local: `python -m http.server 5174` en la raíz y abrir `http://localhost:5174`.
- El salón abierto en local muestra un aviso y el QR apunta siempre a la página publicada (diseño intencional).
- Para probar el salón: proyector en una ventana **al frente**; celulares en otro navegador, en un contexto aislado o en un teléfono. Las pestañas del mismo navegador comparten `localStorage` (mismo `pid`) y la pestaña oculta del proyector puede perder la conexión.
- El broker público puede estar lento; mide antes de concluir que algo está roto (ver informe P19).
- Revisa la consola: el proyecto hoy carga sin errores.

## 7. Errores y deudas conocidas (no los «arregles» sin permiso del autor)

Ver `INFORME_DE_AUDITORIA_Y_PRUEBAS.md`: E1 (flecha 8 del DFD), E2 (24 vs 27 semillas), E3 (mensaje del celular tapado), D1-D7 (documentación), R1-R8 (riesgos). Propón los cambios y deja que Juan Pablo decida.

## 8. Patrones reutilizables (para otros proyectos del autor)

| Patrón | Dónde está | Cómo reutilizarlo |
|---|---|---|
| Motor de pasos por datos (`RUN[tipo](host, st, ctx, done)`) | `index.html` | Cualquier curso: definir misiones como listas de pasos |
| Explicación leída e iluminada por bloques | `leerBloques`, `bloquesDe` | Contenidos con voz para accesibilidad |
| Banco de preguntas compacto `[q, correcta, 3 malas, porqué]` + banco de errores | `Q`, `QBYID`, `errAdd` | Evaluación con repaso automático |
| Clasificar con 4 formas de juego distintas | `RUN.sort` con `modo` | Cualquier taxonomía (tipos de requisitos, capas OSI, etc.) |
| Pausa global envolviendo `rAF` y `setInterval` | inicio del script | Juegos web sin motor |
| Fases con «turno» para cancelar animaciones | `vivo/js/util.js` `sigue()` | Presentaciones interactivas |
| Historia → hallazgos → modelo («descubrir antes de nombrar») | `vivo/` | Enseñar cualquier modelo (DFD, casos de uso, árbol de objetivos) |
| Constructor de diagramas en 3 momentos (símbolos → piezas → flechas) con validación de reglas | `diagramas.js` | Diagramas de clases, casos de uso, ER |
| Matriz de dos criterios | `factibilidad.js` | Urgente/importante, impacto/esfuerzo, riesgo |
| Sala multijugador «Kahoot» con MQTT, QR, equipos por promedio, reconexión por id | `salon/` | Cualquier clase; para uso serio, broker con credenciales |
| Contenido separado de la lógica | `vivo/js/datos.js`, `salon/retos.js` | Cambiar de tema sin tocar motores |

**Lo exclusivo de este proyecto** (no copiar como si fuera genérico): el caso del Caquetá y el Reglamento (UE) 2023/1115, Don Arley, Ceibita, los nombres de los monstruos, las 12 causas y los actores reales, los equipos Actores/Datos/Procesos/Control como raíces del árbol.
