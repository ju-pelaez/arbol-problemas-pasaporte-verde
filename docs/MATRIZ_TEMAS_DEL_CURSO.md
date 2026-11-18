# Matriz: temas del curso → dónde están en el juego

Proyecto **Árbol de Problemas · Expedición** (Juan Pablo Peláez Pino), sobre el proyecto de curso **Pasaporte Verde del Predio Amazónico** (Juan Pablo Peláez y Brahiam Parra Bolaños). Análisis de Sistemas, Universidad de la Amazonia. Revisión del 18-11-2026.

Fuentes de los temas: carpeta del curso (`Clase 1 analisis.pptx`, `Clase 2 unidad Sistemas de informacion.pptx`, `Clase 3. Unidad PROBLEMA-SOLUCION.pptx`, `Casos de UsoUML.ppt` —diapositivas en imagen, leídas una por una—, `CLASE UML-Diagrama de Clases.pptx`, `EXP..formatos.pptx`).

Orden de las misiones: 1 El sistema · 2 Entrada, proceso, salida y control · 3 Actores · 4 Datos · 5 Procesos · 6 DFD · 7 DFP · 8 Control · 9 Cómo se lee el árbol · 10 El problema central · 11 Efectos · 12 Entorno · 13 Factibilidad · 14 UML · 15 Jefe final. Los capítulos de Don Arley (`vivo/`) y el Reto del salón (`salon/`) van aparte.

**Estado**: ✅ ya estaba y está bien · ➕ se agregó en esta revisión · 🔧 se corrigió · ⏸ no aplica / fuera de alcance (con la razón).

Cada tema se revisó con 6 criterios: (1) explicación comprensible, (2) relación con Pasaporte Verde, (3) aplicación práctica, (4) se entiende jugando, (5) sin contradicciones, (6) representación académica correcta. La columna «Cómo se juega» muestra (3) y (4); la columna «Relación con el caso», (2).

## Clase 1 · Generalidades del análisis de sistemas

| Tema | Estado | Dónde | Relación con el caso | Cómo se juega |
|---|---|---|---|---|
| Qué es un sistema; límites y objetivo | ✅ | M1 El sistema | Sistema de acreditación de origen del Caquetá, límites geográfico/organizacional/proceso/temporal | Explicaciones + clasificar mundo real/solución + batalla |
| Qué es el análisis (entender antes de programar) | ✅➕ | M1 (dos mundos), M10 (errores comunes) | «El problema no es falta una app» | Clasificar mundo real/solución; tarjeta de errores comunes |
| Dato, información, atributo | ➕ | M1 | Coordenada/fecha/superficie (dato) → «el predio perdió bosque» (información); atributos del predio (§5.5) | Lluvia de tarjetas «¿Dato o información?» + 2 preguntas |
| Fuentes de información | ➕ | M1 | Registro del productor, ICA-SINIGAN, IDEAM, ANT-IGAC, comprador (§5.3 de la propuesta) | Tarjeta + pregunta de batalla |
| Rol del analista (investigador, comunicador, traductor, modelador, evaluador) | ➕ | M1 | Entrevistas de campo, árbol/DFD/DFP/UML, factibilidad | Tarjeta + pregunta de batalla |
| Levantamiento: entrevistas y observación | ➕ | M10 | Preguntas reales del guion de entrevista (Anexo B de la propuesta) | Tarjeta + pregunta de batalla |
| Requerimientos funcionales y no funcionales | ➕ | M14 UML | RI-01..RI-05 (funcionales); RI-06, RI-07, RI-09 (no funcionales) | Enlazar «¿funcional o no funcional?» + 2 preguntas |
| Viabilidad técnica, económica, operativa (y legal) | ✅ | M13 Factibilidad, Reto del salón de factibilidad | Propuesta del Pasaporte Verde | Matriz factible/viable, voltea, canasta, relámpago, salón |
| Modelado (procesos, entidad-relación, casos de uso) | ✅➕ | M5, M6, M7, M14 | Ver Clase 3 y UML | Constructores de diagramas |

## Clase 2 · Sistemas de información

| Tema | Estado | Dónde | Relación con el caso | Cómo se juega |
|---|---|---|---|---|
| Componentes: entrada, procesamiento, almacenamiento, salida, retroalimentación | ✅ | M2 (E-P-S con control), M6 (almacenes), M8 (retroalimentación) | Modelo sistémico de la propuesta (§5.1) | Enlazar E/P/S/control/entorno; DFD |
| Tipos de SI: TPS, MIS, DSS, EIS, OAS, KMS | ➕ | M2 | Guías de movilización del ICA = TPS | Lanzamiento «¿Qué tipo de sistema es?» + 3 preguntas |
| Niveles: operativo, táctico, estratégico | ➕ | M2 | Tarjeta que liga cada tipo con su nivel | Tarjeta + preguntas |
| Alcance: departamental, empresarial (ERP, CRM, SCM), interorganizacional | ➕ | M2 | El sistema de acreditación es interorganizacional | Tarjeta + pregunta |
| Procesos organizacionales que apoya el SI | ✅ | M5 Procesos | 6 procesos con responsables (§5.2) | Ordenar, unir, diagrama de flujo |
| Dato → información → conocimiento | ✅ | M4 Datos, M10 | «El dato existe pero no se vuelve conocimiento» | Juegos y batalla |
| Modelo conceptual (procesos BPMN o flujo, casos de uso, E-R básico) | ➕🔧 | M5, M7, M14 | Diagrama de flujo, BPMN, casos de uso, clases (modelo conceptual §8.4) | Constructores de diagramas |
| Factibilidad y viabilidad | ✅ | M13 | — | — |

## Clase 3 · El problema y la resolución

| Tema | Estado | Dónde | Relación con el caso | Cómo se juega |
|---|---|---|---|---|
| Problema real vs síntoma | ➕ | M10 | «Rechazaron el lote» (síntoma) vs causa raíz | Tarjeta + pregunta |
| Técnica de los 5 porqués | ➕ | M10 | Del lote rechazado a las 4 columnas no articuladas (cadena hecha con las 12 causas del árbol) | Ordenar los 5 porqués + pregunta |
| Tipos de problemas (organizacional, información, proceso, humano, tecnológico) | ➕ | M10 | 8 causas del árbol clasificadas por su cara principal | Lluvia de tarjetas + pregunta. El tecnológico (conectividad) ya está como **entorno** en M12; no se repite para no contradecir el árbol |
| Cómo identificar: observación, entrevistas, usuarios finales ≠ directivos | ➕ | M10 | Guion de entrevista de la propuesta | Tarjeta + pregunta |
| Resistencia al cambio | ➕ | M13 (factibilidad operativa) | Cambiar la forma de acreditar cambia hábitos | Fila en la tarjeta + pregunta |
| AS-IS | ✅ | M1, M6, M7, M9… | Todo el árbol, el DFD y el DFP son del sistema de hoy | En todo el juego |
| Diagrama de flujo (Inicio/Fin, Actividad, Decisión, Flujo) | ➕ | M5 Procesos | Los 6 procesos + decisión «¿Evidencia completa?» | Constructor: símbolos → piezas → flechas |
| BPMN / Bizagi | 🔧 | M7 DFP | Ahora igual al BPMN AS-IS del proyecto: 5 carriles, 10 tareas, inicio «Exigencia UE», fines «Venta con precio pleno» / «Productor excluido» | Constructor con carriles |
| Cuellos de botella | ➕ | M7 | «Acreditar el origen» depende de la asociación y de papeles | Cierre del DFP + 2 preguntas |
| Tipos de soluciones; error «todo se arregla con software» | ✅➕ | M13 (lineamientos, «no es una app»), M10 (errores comunes) | La propuesta son lineamientos, no una app | Tarjetas + pregunta |
| Necesidades tecnológicas (persistencia, aplicación, presentación) | ⏸ | — | Es diseño de la solución; el juego se queda en el análisis | Se menciona en el diagrama de componentes de `docs/uml` (del software del juego) |

## UML (Casos de uso y Diagrama de clases) y formatos de documentación

| Tema | Estado | Dónde | Relación con el caso | Cómo se juega |
|---|---|---|---|---|
| Actor, caso de uso, límite del sistema, asociación | ➕ | M14 | 5 actores y 9 casos de uso sacados del BPMN TO-BE y de los RI | Constructor de casos de uso |
| «include», «extend» | ➕ | M14 | Registrar → «include» Autorizar datos; Orientar subsanación → «extend» Evaluar | Constructor (la dirección de la flecha se valida) |
| Generalización entre casos de uso | ⏸ | Tarjeta de símbolos | El caso no tiene una generalización real; no se inventó una | — |
| Descripción del caso de uso (plantilla de los formatos) | ➕ | M14, `docs/uml/README.md` | CU05 completo: actores, precondición, curso básico, alternativo, excepción, postcondición | Ordenar el curso básico |
| Listado de actores y de casos de uso (formatos) | ➕ | `docs/uml/README.md` | Con trazabilidad a RI/R/L | — |
| Clase: nombre, atributos, métodos | ➕ | M14 | Productor, Predio, Lote, Evidencia, Requisito, FuenteDeDatos (+3 hijas) | Constructor de clases |
| Relaciones: asociación, agregación, composición, generalización, dependencia | ➕ | M14 | Las 5 aparecen en el modelo | Clasificar frases + conectar clases + unir + V/F |
| Diagrama de actividades, componentes, despliegue | ➕ | `docs/uml/README.md` | Actividades = proceso AS-IS; componentes y despliegue = software del juego | Documento (Mermaid) |

## Contradicciones revisadas y corregidas

- El DFP del juego tenía 3 carriles y tareas («Entregar evidencia», inicio «Cosecha lista») que no coincidían con el BPMN AS-IS del propio proyecto. Ahora coincide.
- El cierre del DFD hablaba de «la flecha 8», pero el número dependía del orden en que se dibujaba (E1). Ahora el número es fijo y la flecha 8 siempre es «Acreditar el origen → Comercializar».
- Los procesos del DFD no tenían número; ahora 1 a 4, y el nivel 0 se dibuja y se balancea con el nivel 1.
- Cada diagrama usa una sola notación: flujo (curso), DFD (Yourdon/DeMarco, aclarado en el juego), BPMN (Bizagi), UML.
- Los diagramas AS-IS (árbol, flujo, DFD, DFP) no proponen soluciones; los de UML se presentan explícitamente como TO-BE.
