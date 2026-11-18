# 🌳 Árbol de Problemas · Expedición

Juego web para entender el **árbol de problemas** del proyecto **Pasaporte Verde del Predio Amazónico**, del curso **Análisis de Sistemas** (Ingeniería de Sistemas, Universidad de la Amazonia).

**Jugar:** https://arbol-problemas-pasaporte-verde.vercel.app
**Reto del salón (todo el curso desde el celular):** https://arbol-problemas-pasaporte-verde.vercel.app/salon/

Hecho por **Juan Pablo Peláez Pino**.

---

## Qué enseña

El árbol analiza el sistema **como funciona hoy** (AS-IS), sin proponer soluciones:

- **Problema central (tronco):** en el sistema de acreditación de origen del Caquetá, el pequeño productor no puede demostrar que su producción es legal y libre de deforestación, porque sus actores, datos, procesos y mecanismos de control no están articulados.
- **Causas (raíces)**, ordenadas por las 4 preguntas del analista: **actores** (¿quién participa?), **datos** (¿qué información?), **procesos** (¿qué se hace?) y **control** (¿cómo se evalúa?).
- **Efectos (copa)** y **entorno (suelo)**.
- **Factibilidad y viabilidad** de la propuesta del Pasaporte Verde: técnica, operativa, económica y legal (¿se puede hacer?) y viabilidad (¿vale la pena y se sostiene?).
- **Diagrama de flujo** (como en clase: Inicio/Fin, Actividad, Decisión, Flujo) del proceso de hoy, dentro de la misión Procesos.
- **DFD (flujo de datos, Yourdon/DeMarco):** diagrama de contexto (nivel 0) y nivel 1 con 4 procesos numerados, 2 almacenes y 10 flujos numerados.
- **DFP (BPMN, como en Bizagi):** el mismo modelo AS-IS del proyecto: 5 carriles (comprador, asociación, productor, entidades, acopiador), 10 tareas, la compuerta «¿Evidencia completa?» y sus dos fines; con cuellos de botella.
- **UML (TO-BE):** casos de uso del Pasaporte Verde (actores, «include», «extend», descripción con la plantilla del curso) y diagrama de clases del modelo conceptual (asociación, agregación, composición, generalización y dependencia).
- **Temas del curso** dentro de las misiones: dato, información y atributo; fuentes de información; rol del analista; tipos de sistemas de información (TPS, MIS, DSS, EIS…) y niveles; síntoma vs causa raíz; 5 porqués; entrevistas y observación; tipos de problemas; requerimientos funcionales y no funcionales; resistencia al cambio. La matriz completa está en [`docs/MATRIZ_TEMAS_DEL_CURSO.md`](docs/MATRIZ_TEMAS_DEL_CURSO.md).
- **Actores reales:** ICA, IDEAM, CORPOAMAZONIA, ANT, IGAC, Comité Departamental de Ganaderos del Caquetá, ASOHECA, Fedegán, Fedecacao, Unión Europea (Reglamento (UE) 2023/1115), entre otros.

La historia de **Don Arley** (personaje ficticio) y su lote de cacao rechazado en Europa sirve para descubrir dónde falla el sistema.

## Las partes

| Parte | Qué es |
|---|---|
| `index.html` | La expedición: mapa para caminar, **15 misiones** con minijuegos (enlazar con hilos, armar el árbol, lanzamiento, lluvia de tarjetas, canasta, memoria, unir, ordenar, construir el árbol, batalla), voz que lee e ilumina cada explicación. En cada nivel: ↩ Atrás (paso anterior), ⏸ Pausa (congela el juego y la voz; tecla P) y ▶ Escuchar / ⏹ Parar voz. |
| `diagramas.js` y `diagramas.css` | El laboratorio de diagramas: **diagrama de flujo**, **DFD**, **DFP (BPMN)**, **casos de uso** y **diagrama de clases**. En todos se reconocen los símbolos, se clasifica cada pieza y se conectan las flechas, con validación de reglas, combos, puntos y pistas. |
| `factibilidad.js` y `factibilidad.css` | Reto **Matriz factible / viable**: cada caso va a uno de 4 cuadros (¿se puede? ¿vale la pena?), primero con casos de la vida diaria y después con el Pasaporte Verde. También **Voltea y decide** (cartas: ¿factibilidad o viabilidad?). Al terminar la misión, el estudiante escribe el código del proyector y entra ahí mismo al Reto del salón de factibilidad. |
| `vivo/` | Los capítulos de la historia de Don Arley (el viaje del lote, revisar el camino, nace el árbol, otro sistema, demuéstralo). |
| `salon/` | **Reto del salón**: el proyector crea una sala con QR; cada estudiante entra desde el celular, queda en un equipo (Actores, Datos, Procesos o Control) y compite por puntos mientras el árbol crece en el proyector. Probado con 49 jugadores a la vez (48 celulares simulados y 1 real, con la versión anterior de 11 retos). |
| `docs/` | El árbol de problemas (PowerPoint e imagen), el mapa de actores, las guías en PDF (escritas para la versión de 11 misiones), los diagramas en [`docs/uml/`](docs/uml/README.md), la [matriz de temas del curso](docs/MATRIZ_TEMAS_DEL_CURSO.md) y la auditoría en `docs/auditoria/`. |

### Reto del salón

- 10 retos en 5 capítulos: **El terreno → El viaje de Don Arley → El tronco → La copa → El fruto (puntos dobles)**.
- Todos los retos son de **escoger** entre 4 opciones (con figura y color): en qué parte del árbol va algo, qué componente falla en una escena y preguntas del árbol.
- **Sala de factibilidad y viabilidad** (`/factibilidad`): 15 retos en 5 capítulos, en equipos Técnica, Operativa, Económica y Legal. Incluye la **matriz** (4 cuadros: ¿se puede? ¿vale la pena?) en el proyector y en el celular.
- Puntos: 500 × lo que acertó + hasta 500 por rapidez + 100 por cada acierto seguido.
- Si a alguien se le cae la conexión o recarga la página, vuelve solo con su nombre y sus puntos.
- La sala viaja por un servidor MQTT público: por eso se pide usar solo el primer nombre o un apodo, y el celular revisa todo lo que llega antes de mostrarlo.
- Reacciones (🔥 👏 🌳 😮 😂 💚 🤯 🙌) que suben por el proyector, muro de jugadores, carrera de equipos, podio, premios y confeti.
- **Chat del salón:** frases rápidas o mensajes cortos que salen en el proyector y en todos los celulares (se esconde durante cada reto, tapa groserías y se apaga con la tecla C).
- Sin internet: botón **"Jugar sin celulares"** (el salón responde en voz alta).

## Cómo está hecho

HTML, CSS y JavaScript sin frameworks.

- **Canvas 2D** para el mundo y los minijuegos de movimiento (ciclo con `requestAnimationFrame`).
- **SVG** para los árboles, las raíces que se dibujan y las chispas.
- **Web Speech API** para la voz que lee; **Web Audio API** para los sonidos (sin archivos de audio).
- **MQTT por WebSocket seguro** (mqtt.js y el servidor público de HiveMQ) para conectar los celulares con el proyector en cualquier red, y **qrcode-generator** para el QR. La conexión está en `salon/canal.js`.
- **View Transitions API** para los cambios de pantalla del proyector.
- Publicado en **Vercel** como sitio estático.

## Jugar

No hay que instalar nada, se juega desde el navegador:

| | Enlace |
|---|---|
| 🌳 **La expedición** (jugar solo) | https://arbol-problemas-pasaporte-verde.vercel.app |
| 🎉 **Reto del salón** (proyector + celulares) | https://arbol-problemas-pasaporte-verde.vercel.app/salon/ |

Para el Reto del salón: en el computador del proyector se abre el segundo enlace y se toca **"Abrir la sala"**; los compañeros escanean el QR con el celular.

### Para modificar el código

Si se descarga el código para cambiarlo, se puede probar en el propio computador con un servidor local (`python -m http.server 5174` dentro de la carpeta y luego abrir `localhost:5174`).

## Licencia

Proyecto académico. Universidad de la Amazonia, 2026.
