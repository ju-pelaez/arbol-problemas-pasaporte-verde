# 🌳 Árbol de Problemas · Expedición

Juego web para entender el **árbol de problemas** del proyecto **Pasaporte Verde del Predio Amazónico**, del curso **Análisis de Sistemas** (Ingeniería de Sistemas, Universidad de la Amazonia).

**Jugar:** https://arbol-problemas-pasaporte-verde.vercel.app
**Reto del salón (todo el curso desde el celular):** https://arbol-problemas-pasaporte-verde.vercel.app/salon/

Hecho por **Juan Pablo Peláez Pino**. Proyecto Pasaporte Verde con **Brahiam Parra Bolaños**.

---

## Qué enseña

El árbol analiza el sistema **como funciona hoy** (AS-IS), sin proponer soluciones:

- **Problema central (tronco):** en el sistema de acreditación de origen del Caquetá, el pequeño productor no puede demostrar que su producción es legal y libre de deforestación, porque sus actores, datos, procesos y mecanismos de control no están articulados.
- **Causas (raíces)**, ordenadas por las 4 preguntas del analista: **actores** (¿quién participa?), **datos** (¿qué información?), **procesos** (¿qué se hace?) y **control** (¿cómo se evalúa?).
- **Efectos (copa)** y **entorno (suelo)**.
- **Factibilidad y viabilidad** de la propuesta del Pasaporte Verde: técnica, operativa, económica y legal (¿se puede hacer?) y viabilidad (¿vale la pena y se sostiene?).
- **Actores reales:** ICA, IDEAM, CORPOAMAZONIA, ANT, IGAC, Comité Departamental de Ganaderos del Caquetá, ASOHECA, Fedegán, Fedecacao, Unión Europea (Reglamento (UE) 2023/1115), entre otros.

La historia de **Don Arley** (personaje ficticio) y su lote de cacao rechazado en Europa sirve para descubrir dónde falla el sistema.

## Las partes

| Parte | Qué es |
|---|---|
| `index.html` | La expedición: mapa para caminar, misiones con minijuegos (enlazar con hilos, armar el árbol, lanzamiento, lluvia de tarjetas, canasta, memoria, unir, ordenar, construir el árbol, batalla), voz que lee e ilumina cada explicación. En cada nivel: ↩ Atrás (paso anterior), ⏸ Pausa (congela el juego y la voz; tecla P) y ▶ Escuchar / ⏹ Parar voz. |
| `vivo/` | Los capítulos de la historia de Don Arley (el viaje del lote, revisar el camino, nace el árbol, otro sistema, demuéstralo). |
| `salon/` | **Reto del salón**: el proyector crea una sala con QR; cada estudiante entra desde el celular, queda en un equipo (Actores, Datos, Procesos o Control) y compite por puntos mientras el árbol crece en el proyector. Probado con 49 jugadores a la vez. |
| `docs/` | El árbol de problemas (PowerPoint e imagen), el mapa de actores y las guías en PDF. |

### Reto del salón

- 11 retos en 5 capítulos: **El terreno → El viaje de Don Arley → El tronco → La copa → El fruto (puntos dobles)**.
- Tipos de juego: escoger la parte del árbol, descubrir qué componente falla, **lluvia de fallas** (clasificar), **armar el problema central** (ordenar), **unir cada raíz con su efecto**, **cómo se lee el árbol** (ordenar).
- Puntos: 500 × lo que acertó + hasta 500 por rapidez + 100 por cada acierto seguido.
- Si a alguien se le cae la conexión o recarga la página, vuelve solo con su nombre y sus puntos.
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
