# Informe de auditoría y pruebas

**Proyecto:** Árbol de Problemas · Expedición — autor: **Juan Pablo Peláez Pino** (Ingeniería de Sistemas, Universidad de la Amazonia, Análisis de Sistemas).
**Auditoría:** 18 de noviembre de 2026, realizada por Claude (Claude Code) como colaborador técnico a pedido del autor.
**Versión auditada:** commit `dac9c20` (5 de noviembre de 2026), rama principal, 25 commits.
**Alcance:** lectura completa del código y la documentación, pruebas en la aplicación publicada. No se modificó código, no se hicieron commits ni despliegues.

---

## 1. Resumen ejecutivo

- El proyecto es un sitio estático (HTML, CSS y JavaScript sin frameworks) con tres experiencias: la **Expedición** individual (`index.html`), los **capítulos de Don Arley** (`vivo/`) y el **Reto del salón** multijugador (`salon/`).
- **Lo publicado en Vercel es idéntico al repositorio**: 13 archivos comparados por SHA-1 (normalizando finales de línea) coinciden con `HEAD`.
- La expedición y los capítulos funcionan bien en las pruebas hechas. Se encontraron **3 errores menores comprobados**, **varias diferencias entre documentación y código** y **riesgos de seguridad y disponibilidad** en el Reto del salón por depender de un broker MQTT público.
- **Reto del salón:** en la primera sesión (madrugada del 18-11-2026) el broker público de HiveMQ estaba muy lento (conexión en 12,5 s y suscripción en 27 s, frente a los 25 s que la app espera) y no se pudo jugar. En la segunda sesión (mañana, broker rápido) **se jugó una partida completa de 10 retos con 3 celulares ficticios y varias funciones más** (recarga, chat, tema factibilidad, modo sin celulares): ver 3.1. La disponibilidad del broker es el riesgo principal.

## 2. Leyenda de estados

| Estado | Significado |
|---|---|
| IMPLEMENTADA | Existe en el código. |
| DOCUMENTADA | Está descrita en README o en las guías PDF. |
| VERIFICADA | Se ejecutó y se observó funcionando en esta auditoría. |
| PARCIAL | Existe, pero no se comprobó completa o tiene limitaciones. |
| NO VERIFICADA | No fue posible comprobarla. |
| PENDIENTE | Trabajo futuro. |

## 3. Pruebas realizadas

Entorno: navegador integrado de Claude (Chromium) y Playwright (Chromium, contextos aislados, vista 390×844), Windows 11, red doméstica. Fecha: 18-11-2026, madrugada (hora de Colombia).

| # | Prueba | Cómo | Resultado | Estado |
|---|---|---|---|---|
| P1 | Publicado = repositorio | `fetch` de 13 archivos en la página publicada y SHA-1 contra `git show HEAD:<archivo>` | 13/13 idénticos | VERIFICADA |
| P2 | Carga del mapa | Abrir la URL, leer consola | Sin errores; 20 estaciones; 27 semillas | VERIFICADA |
| P3 | Estructura real de misiones | Leer `MISSIONS` en vivo | 14 misiones; pasos listados en el Mapa pedagógico | VERIFICADA |
| P4 | Explicación con voz | Misión «El sistema» | Tarjetas, botones Escuchar/Parar, +2 XP por paso | VERIFICADA (voz apagada durante la prueba) |
| P5 | Enlazar | Tocar tarjeta y luego grupo | Acierto suma ⭐12; error quita corazón, resalta el grupo correcto y la tarjeta vuelve a la cola | VERIFICADA |
| P6 | Enlazar arrastrando | Arrastre sintético | No se registró | NO VERIFICADA (puede ser limitación del arrastre sintético) |
| P7 | Batalla | Responder mal a propósito | Corazón menos, correcta en verde, explicación, pregunta al banco de errores | VERIFICADA |
| P8 | DFD completo | Resolver los 3 momentos dibujando flechas en orden inverso | Diagrama completo, 600 ⭐, combo x23; ver error E1 | VERIFICADA |
| P9 | Matriz factible/viable | Responder un caso | Explicación por los dos ejes (¿se puede? ¿vale la pena?) | VERIFICADA |
| P10 | Pausa (tecla P) | Durante «Atrapa con la canasta» | Capa de pausa, canvas congelado (1 cuadro en cola), reanuda | VERIFICADA |
| P11 | Portada de capítulos | `vivo/` | Árbol que se dibuja, créditos, ajustes | VERIFICADA |
| P12 | Capítulo «Revisar el camino» | Teclado 1-4 y → | 1.er error: pista general; 2.º: la pregunta del componente; acierto: explicación y ficha a su columna | VERIFICADA (primera estación) |
| P13 | Capítulo «Nace el árbol» | Esperar el armado y tocar una raíz | Árbol completo, lectura de rama | VERIFICADA |
| P14 | Laboratorio | Solo Datos y luego las 4 columnas | 1 de 4 → RECHAZADO; 4 de 4 → ACEPTADO | VERIFICADA |
| P15 | Redirecciones de Vercel | `fetch` de `/reto` y `/factibilidad` | Responden con redirección | VERIFICADA |
| P16 | Abrir sala en el proyector | `/salon/` → Abrir la sala | Sala `7C2C` lista en >30 s; sala `PZXQ` en 20 s | VERIFICADA (lenta) |
| P17 | Celular entra a la sala | Playwright, nombre ficticio «Prueba A» | Entró en ~16 s: equipo Actores, avatar 🦜, reacciones y chat visibles; el proyector lo mostró en su equipo | VERIFICADA |
| P18 | Segundo celular | Contexto aislado «Prueba B» | Dos intentos: «No se pudo entrar» a los 25 s | NO VERIFICADA (broker lento, ver R3) |
| P19 | Medición del broker | Cliente MQTT de prueba desde el contexto del celular B | Conexión 12,5 s; SUBACK 27 s; mensaje retenido `vivo="1"` a los 28,4 s | Medido |
| P20 | Pérdida de conexión | Observar «Prueba A» después | Pantalla «📡 Reconectando…» durante >40 s; el proyector lo marcó fuera de línea sin borrarlo | PARCIAL |
| P21 | Pestaña del proyector en segundo plano | Primera prueba con proyector y celular en pestañas del mismo navegador | El celular no encontró la sala aunque el broker la tenía retenida como abierta | Observado (ver R4) |

### 3.1 Segunda sesión de pruebas (18-11-2026, mañana)

El broker respondía rápido (conexión 1,2–5,2 s, suscripción 0,3–0,5 s después). Proyector en el navegador de Claude con el panel **visible**; celulares ficticios (Ana, Beto, Caro) en contextos aislados de Playwright. Ninguno usa datos de personas reales.

| # | Prueba | Resultado | Estado |
|---|---|---|---|
| P22 | Sala `KMSQ` (tema árbol) + 3 celulares | Sala lista en 6 s; entraron en 4–12 s, cada uno a un equipo distinto (Actores, Datos, Procesos); el proyector mostró «3 conectados» | VERIFICADA |
| P23 | Reto 1 (parte del árbol) | Reveló al responder los 3; 33 % → pieza «floja»; Ana 889 pts (= 500 + 500·(1 − 4,5/20)); los celulares reciben ✔/✘, «Era: Suelo», puesto, puesto del equipo y explicación | VERIFICADA |
| P24 | Chat y reacciones | «gonorrea» → «•••» en proyector y celular; la reacción 🌳 flota con el nombre | VERIFICADA |
| P25 | Posiciones | Top, carrera de equipos por promedio y «lo que sigue» | VERIFICADA |
| P26 | **Recarga de un celular en medio de un reto** | Beto volvió en <1 s con su nombre, su equipo y el reto 2 en curso | VERIFICADA |
| P27 | Tiempo agotado | Quien no respondió ve «Se acabó el tiempo · Era: Actores». El % de aciertos cuenta solo a quienes respondieron | VERIFICADA |
| P28 | Partida completa (10 retos) | Final: «¡Ya tenemos un árbol!», 2/10 piezas firmes, podio, tres premios, pantalla final del celular («Quedaste de 1 de 3 … El salón armó 2 de 10 piezas») | VERIFICADA |
| P29 | «Otra partida» | Vuelve a la sala con los 3 jugadores y los puntos en cero | VERIFICADA |
| P30 | Tema factibilidad | Sala `Z7PV`: equipos Técnica/Operativa/Económica/Legal, 15 retos, capítulo «Dos preguntas del analista»; el celular recibe el tema | VERIFICADA |
| P31 | Matriz en proyector y celular (reto 2 de factibilidad) | 4 cuadros (🚀 🤷 🧱 🚫); acierto con racha ×2 y explicación por eje | VERIFICADA |
| P32 | Tecla C | El proyector apaga el chat y el celular lo oculta | VERIFICADA |
| P33 | «Jugar sin celulares» + tecla 4 | Revela con la opción elegida; «Respondan en voz alta» | VERIFICADA |
| P34 | Minijuegos de la expedición resueltos por programa: ordenar, unir, memoria, V/F, Voltea, BPMN completo (600 ⭐, combo ×23), armar la copa, construir el árbol (20/20), relámpago, atrapa, lanzamiento | Todos corren y terminan sin errores de consola | VERIFICADA (lógica; sin pruebas de arrastre real con dedo) |
| P35 | Vista móvil (375×812) de mapa, misiones dfd/dfp/factibilidad/jefe, matriz y armar | Sin desbordes horizontales | VERIFICADA |
| P36 | Vista móvil de «Construir tu árbol» | Desborda 30 px a la derecha; la 4.ª columna (Control) queda cortada (error E4) | VERIFICADA |

**Sigue sin probarse:** el doble de puntos del último reto con respuestas, el confeti (dura 5 s y se miró tarde), un premio de «más rápido» con varios jugadores y ≥3 aciertos, Ceibita dice, fichas, repaso de errores, entrenamiento `#entrenamiento` y micrófono, capítulos «El viaje del lote», «Otro sistema» y «Demuéstralo» completos, Lighthouse, lector de pantalla, arrastre con dedo real, una prueba de carga con decenas de celulares. Todo esto está **IMPLEMENTADO** según el código, pero queda **NO VERIFICADO** por pruebas propias.

**Hallazgo de entorno (no es un error del juego):** con el panel del navegador **oculto**, la View Transition nunca termina y `enTransicion` queda en `true`; el proyector no avanza hasta que el panel vuelve a verse. En clase, con el proyector visible, no ocurre. Solo habría riesgo si se minimiza el navegador justo al pulsar «Seguir».

**No probado en la primera sesión** (ahora cubierto por P22–P36 salvo lo indicado arriba): lanzamiento, armar, memoria, relámpago, V/F, ordenar, unir, BPMN, Voltea, construir el árbol, vista móvil y rondas del salón.

## 4. Errores comprobados

| ID | Error | Dónde | Evidencia | Efecto |
|---|---|---|---|---|
| E1 | El cierre del DFD dice «La flecha **8** lleva la evidencia de origen incompleta», pero el número de cada flecha es el orden en que el estudiante la dibujó. | `diagramas.js`, `dfdSvg` (badge `k+1`) y `DFD_CFG.cierre` | Dibujando en orden inverso: la evidencia quedó como flecha 3 y la 8 fue «Carpeta del predio». | Confunde justo en la conclusión pedagógica del DFD. |
| E2 | El aviso al recoger todas las semillas dice «¡Recogiste las 24 semillas!», pero hay 27. | `index.html`, `world()` → `update()` | `FACTS.length` = 27 en vivo. | Menor, de texto. |
| E3 | En el celular, el mensaje «No se pudo entrar…» queda reemplazado por «Buscando otro camino para conectar…». | `salon/salon.js`, `abrirConexion()` (temporizador de 8 s) y `pedirNombre()` (mismo `#msj`) | Observado en vivo en la primera prueba. | El estudiante no ve la instrucción correcta (revisar código o usar datos móviles). |
| E4 | En «Construir tu árbol» (jefe final), a 375 px de ancho la fila de las 4 zonas de raíces y de efectos directos se sale de la pantalla (30 px) y la columna **Control** queda cortada. | `index.html`, `RUN.build` y CSS `.zrow`/`.zone` | `scrollWidth` 405 > `clientWidth` 375 y captura de pantalla (P36). | Afecta justo el minijuego final en el celular. |
| E5 | La tarjeta final del Relámpago dice «¡Bien!» aunque haya 0 aciertos. | `index.html`, `RUN.speed` → `end()` | Prueba P34: «¡Bien! 0 correctas de 2». | Menor, de texto. |

## 5. Diferencias entre documentación y código

| ID | Documentación dice | El código hace | Fuente |
|---|---|---|---|
| D1 | README: «11 retos en 5 capítulos», con lluvia de fallas, armar el problema, unir raíz-efecto, ordenar la lectura. | Desde el commit `2ad084c` (26-10-2026) son **10 retos**, todos de escoger una opción. | `salon/retos.js` → `armarRetosArbol()` |
| D2 | — | Las funciones del celular `jugarClasifica`, `jugarOrdena`, `jugarUne` y los tipos `clasifica/ordena/une` del proyector siguen en el código, pero ningún reto los usa. `ordena()`, `ORDEN_PROBLEMA`, `ORDEN_LECTURA` y `EFECTOS_DIRECTOS` quedaron sin uso. Los comentarios de `retos.js` dicen 10 y 11 retos. | `salon/salon.js`, `salon/retos.js` |
| D3 | Guías PDF (25-26 oct): 11 misiones y 11 retos con lluvia, ordenar y unir. | 14 misiones (se agregaron DFD, DFP y Factibilidad) y 10 retos. | `docs/*.pdf` vs `index.html` |
| D4 | README: la expedición incluye «lluvia de tarjetas». | `RUN.lluvia` existe, pero ninguna misión la usa: el jefe final la reemplazó por `build`. | `MISSIONS` en vivo |
| D5 | README: «Probado con 49 jugadores a la vez». | El PDF «Cómo desarrollé el juego» precisa: 48 celulares **simulados** + 1 real, en la versión de **11 retos**. Con MQTT el mismo PDF habla de 30 celulares desde la misma red. No se sabe si la prueba de 49 fue antes o después de pasar a MQTT. | `docs/Como_desarrolle_el_juego.pdf` |
| D6 | Guías: «el juego no guarda datos de los compañeros». | Es cierto que no se almacenan, pero nombres, chat y respuestas **pasan por un broker público** legible por terceros (ver R1). | `salon/canal.js` |
| D7 | Guía del juego completo: Ceibita pasa «de Semilla a Brote, Arbusto y Árbol». | 10 rangos: Semilla … Analista experto (cada 120 XP). | `RANKS` en `index.html` |

## 6. Riesgos

| ID | Riesgo | Tipo | Evidencia | Severidad estimada |
|---|---|---|---|---|
| R1 | **Broker MQTT público sin autenticación.** Cualquiera que conozca el prefijo `arbolvivo/v2/` puede suscribirse con comodín y leer nombres, chat y respuestas, o publicar mensajes falsos. El campo `de` lo escribe el propio cliente, así que se puede suplantar a la sala o a un jugador (su `pid` viaja en claro). | Seguridad / privacidad | Código de `canal.js` (no explotado) | Media en un aula; alta si se usa con datos sensibles |
| R2 | **Posible inyección de HTML en los celulares.** El celular inserta sin escapar `m.avatar` (chat), `d.ic`, `o.ic`, `o.color`, `o.forma` y `yo.avatar`. Normalmente vienen de listas fijas del proyector, pero un mensaje falso al tema `/todos` podría inyectar HTML en todos los celulares de una sala. El proyector sí escapa nombres y textos. | Seguridad | Código de `salon.js` (`feedHTML`, `recibir`, `pantalla`) | Media (requiere R1) |
| R3 | **Dependencia de un servicio gratuito sin garantía.** Medido el 18-11: conexión 12,5 s, suscripción 27 s, un intento con «connack timeout» a los 10 s. El celular espera 5 s por la sala y 25 s en total. | Disponibilidad | P16-P20 | Alta el día que falle; existe el plan B «Jugar sin celulares» |
| R4 | Si la pestaña del proyector queda en segundo plano, el navegador frena sus temporizadores; con `keepalive: 15` el broker puede darla por caída y publicar la «despedida» (sala cerrada). | Disponibilidad | P21 | Baja en clase (el proyector está al frente) |
| R5 | Recargar el proyector pierde la sala y los puntos (todo vive en memoria). | Diseño conocido | Guías PDF lo advierten | Baja (documentado) |
| R6 | Un cliente puede enviar `hola` con muchos `pid` distintos y llenar la sala de jugadores falsos; no hay tope de jugadores. | Abuso | Código de `recibir` | Baja |
| R7 | Datos de contenido con fecha o cifra (fechas del Reglamento (UE) 2023/1115, 37.660 ha, 20.512 predios, 90 % del cacao) no fueron contrastados con fuente oficial en esta auditoría. | Exactitud académica | `index.html`, `vivo/js/datos.js`, PPTX | Revisar antes de exponer |
| R8 | Pequeña inconsistencia de contenido: una semilla dice «importador → exportador → acopiador → asociación → productor»; el resto del juego dice «UE → importador → comprador → gremio/asociación → productor». | Coherencia | `FACTS` en `index.html` | Baja |

## 7. Fortalezas técnicas comprobadas

- **Cero dependencias de compilación**: se publica tal cual, y lo publicado coincide con el repositorio.
- **Motor de misiones por datos**: cada misión es una lista de pasos y `RUN[tipo]` decide cómo se juega. Agregar contenido no exige tocar los motores.
- **Bucles de animación con delta de tiempo** (`dt = min(.05, …)`), así el juego se mueve igual en equipos rápidos o lentos.
- **Pausa global** limpia: envuelve `requestAnimationFrame` y `setInterval`.
- **Cada paso usa un contenedor nuevo** (`cloneNode`), así los temporizadores del paso anterior se apagan solos (revisan `isConnected`).
- **Fases con «turno»** en `vivo/` (`sigue(turno)`): las animaciones viejas se detienen si el jugador salta de fase.
- **`postMessage` con verificación de origen** (`e.source === iframe.contentWindow`) entre la expedición y los capítulos.
- **Respeto de `prefers-reduced-motion`** en las tres experiencias, controles de teclado y regiones `aria-live`.
- **Reto del salón pensado para el aula real**: equipos por promedio, reconexión por `pid`, límites anti-spam, filtro de groserías, modo sin celulares, Wake Lock, QR que siempre apunta a la página publicada.

## 8. Oportunidades de mejora (sin cambiar la identidad del proyecto)

Ordenadas por valor/esfuerzo. Ninguna se aplicó.

1. Corregir E1: en el cierre del DFD, nombrar la flecha por su contenido («la flecha que va de Acreditar el origen a Comercializar») o numerar las flechas según el orden de `DFD.flujos`.
2. Corregir E2: usar `FACTS.length` en el aviso.
3. Corregir E3: cancelar el temporizador de 8 s al volver a `pedirNombre()`.
4. Escapar en el celular todo texto que venga por la red (`esc()` ya existe) y validar `color`/`forma` contra las listas fijas.
5. Actualizar README y, cuando se pueda, las guías PDF: 10 retos de escoger, 14 misiones, la prueba de 49 jugadores con sus condiciones.
6. Ampliar los tiempos de espera del celular (5 s y 25 s) o mostrar un mensaje de «el servidor está lento» antes de rendirse.
7. Para uso con más garantía: un broker con credenciales (o un tema con sufijo aleatorio largo además del código de 4 letras) y firmar o validar los mensajes de la sala. Es una decisión de diseño que el autor debe valorar frente a la simplicidad actual.
8. Decidir si se eliminan o se reactivan los juegos del celular que hoy no se usan (D2) y la lluvia de tarjetas (D4).

## 9. Lo que haría falta para verificar lo pendiente

- **Reto del salón completo:** repetir con el broker en buen estado (o en otra hora), con el proyector en primer plano y al menos 3 celulares en aparatos o contextos aislados. Recorrer los 10 retos del árbol y los 15 de factibilidad, recargar un celular a mitad de reto, probar chat, reacciones, tecla C y «Jugar sin celulares».
- **Capacidad:** reproducir una prueba de carga con clientes simulados contra el broker actual; no se repitió la de 49 jugadores.
- **Accesibilidad:** pasada con lector de pantalla y Lighthouse en móvil.
- **Contenido legal y cifras:** contrastar con fuentes oficiales (Comisión Europea, IDEAM).

## 10. Registro de archivos creados por esta auditoría

- `docs/auditoria/CONTEXTO_MAESTRO_ARBOL_DE_PROBLEMAS.md`
- `docs/auditoria/MAPA_TECNICO_Y_ARQUITECTURA.md`
- `docs/auditoria/MAPA_PEDAGOGICO_Y_DINAMICAS.md`
- `docs/auditoria/INFORME_DE_AUDITORIA_Y_PRUEBAS.md`
- `docs/auditoria/GUIA_PARA_FUTUROS_AGENTES.md`

No se modificó ni borró ningún archivo existente. No hay commits nuevos.

---

## Actualización del 18-11-2026 (rama local `mejoras-curso`, sin publicar)

Trabajo pedido por Juan Pablo para cerrar el juego como producto académico. Commits locales: `b8ffa58` (auditoría), `99fb668` (errores), `1a71040` (laboratorio de diagramas), `b2b4472` (docs/uml), `d8cabff` (temas del curso) y el de documentación.

### Errores y riesgos

| ID | Estado | Qué se hizo | Verificación |
|---|---|---|---|
| E1 | ✅ Corregido | El número de cada flecha del DFD es fijo (orden del diagrama), la leyenda se ordena por número y el cierre dice «flecha 8 (3 Acreditar el origen → 4 Comercializar)» | Jugado completo en local |
| E2 | ✅ Corregido | El aviso usa `FACTS.length` (27) | Revisión de código |
| E3 | ✅ Corregido | Temporizador `camino` guardado y apagado en `pedirNombre()` | Probado en local con una sala inexistente: el aviso «No encontramos la sala» se queda (antes lo tapaba «Buscando otro camino») |
| E4 | ✅ Corregido | `minmax(0,1fr)` en `.build`/`.zrow` y `min-width:0` en las zonas | A 375 px: sin desborde, columna Control completa |
| E5 | ✅ Corregido | Con 0 aciertos dice «¡Casi! Inténtalo otra vez» | Revisión de código |
| R1 | 🟡 Mitigado | Aviso en la sala y en el celular: usar solo el primer nombre o un apodo. Se descartó el «tema secreto» porque un suscriptor a `arbolvivo/#` igual ve los temas. Mejora futura: cifrar con una clave que vaya en el QR | Revisión de código |
| R2 | ✅ Corregido | `esc()` en avatar, forma, ícono y textos; `colorSeguro()` para colores; `num()` para números que llegan por la red | Revisión de código |
| R3 | ✅ Corregido | Espera de sala 5 s → 12 s (`canal.js`); espera total 25 s → 45 s; aviso «Está tardando: revisa el código…» a los 12 s; espera de sala 5 s → 12 s | Revisión de código; sin prueba con broker lento |
| D1-D7 | ✅ README al día | 15 misiones, 10 retos de escoger, prueba de 49 = 48 simulados + 1 real con 11 retos. Las guías PDF quedan como de la versión anterior | — |

### Diagramas y temas

- Diagrama de flujo clásico (M5), DFD con nivel 0 y numeración (M6), DFP igual al BPMN AS-IS del proyecto con 5 carriles (M7), misión 14 UML con casos de uso y clases. Jugados completos en local con un solucionador automático: sin errores de consola.
- `docs/uml/`: 6 SVG exportados del mismo código del juego + Mermaid de clases, actividades, componentes y despliegue (los 4 bloques Mermaid se validaron con mermaid 10.9.1).
- `docs/MATRIZ_TEMAS_DEL_CURSO.md`: tema → misión → cómo se juega, con lo agregado en esta revisión.
- Vista móvil (375 × 812): sin desborde horizontal de la página; el BPMN de 5 carriles se desliza de lado dentro de su lienzo para que la letra siga legible.

### No verificado en esta revisión

- Partida real del Reto del salón con celulares después de E3/R2/R3 (solo revisión de código y sintaxis).
- Las 15 misiones jugadas de principio a fin por una persona (se probaron los pasos nuevos uno por uno y los diagramas completos).
- Lector de pantalla y Lighthouse.
