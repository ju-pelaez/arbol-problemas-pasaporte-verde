# Diseño: laboratorio de diagramas y UML (Árbol de Problemas · Expedición)

Proyecto de Juan Pablo Peláez Pino. Diseño propuesto por Claude (colaborador) el 18-11-2026.

## Por qué
La profesora pidió: completar los temas del curso, mejorar el diagrama de flujo, mejorar el diagrama de procesos y hacer el UML. Que el juego quede terminado como producto académico, sin inventar funciones ni cambiar su propósito.

## Fuentes de verdad
- Curso (`info curso analisis`): Clase 3 (AS-IS, diagrama de flujo con Inicio/Fin, Actividad, Decisión, Flujo; BPMN/Bizagi; cuellos de botella), Casos de uso UML (actor, caso de uso, límite del sistema, asociación, «include», «extend», generalización; plantilla de descripción), Diagrama de clases (nombre/atributos/métodos; asociación, agregación, composición, generalización, dependencia).
- Propuesta Pasaporte Verde (PDF): 6 procesos con responsables (§5.2), variables (§5.5), RI-01..RI-10, R-01..R-04, L-01..L-07, §8.4 «modelo conceptual: predio, productor, lote, evidencia».
- BPMN del autor: `pasaporte-verde-asis.bpmn` (5 carriles, 10 tareas) y `pasaporte-verde-tobe.bpmn` (carril «Pasaporte Verde (sistema)»).

## Decisiones del autor (18-11)
Ambos diagramas de flujo; misión UML nueva entre Factibilidad y el Jefe; docs/auditoria en commit.

## Enfoques considerados
1. **Extender el motor `DG.motor` (elegido):** mismos 3 momentos (símbolos → piezas → flechas), nuevas configuraciones. Coherente, poco código, misma experiencia.
2. Constructor nuevo de arrastrar y soltar libre: más «real» pero mucho código, difícil en celular y redundante.
3. Solo imágenes estáticas: no hay interacción; no cumple «el jugador lo entiende interactuando».

## Qué se construye
1. **Diagrama de flujo clásico** (misión «Procesos»): 4 símbolos del curso (óvalo Inicio/Fin, rectángulo Actividad, rombo Decisión, flecha Flujo). Proceso AS-IS de la propuesta: Inicio → Producir → Documentar → Movilizar → Acopiar → Acreditar el origen → ¿Evidencia completa? → Sí: Vender a precio pleno / No: Castigar el precio o rechazar → Fin. Una sola columna, cabe a 375 px.
2. **DFD** (misión DFD): mantener Yourdon/DeMarco (4 símbolos). Numerar procesos 1–4, dibujar el diagrama de contexto (nivel 0) en la explicación, numerar flechas por el orden del diagrama y no por el orden del jugador (arregla E1 de raíz), y aclarar en el texto que el DFD no está en el material del curso pero complementa la columna de Datos.
3. **DFP BPMN** (misión DFP): alinear con el BPMN AS-IS del autor: inicio «Exigencia UE 2023/1115», 5 carriles (Comprador, Asociación/intermediario, Productor, Entidades ICA·IDEAM·ANT-IGAC, Acopiador), 10 tareas, compuerta, fines «Venta con precio pleno» y «Productor excluido». Las notas del BPMN (causas) salen al final como hallazgos, con los cuellos de botella del curso.
4. **Misión UML** (nueva, `uml`, después de Factibilidad): mundo de la solución (TO-BE), derivado del carril «Pasaporte Verde (sistema)» y los RI.
   - Casos de uso: actores Productor, Asociación/gremio, Acopiador, Comprador y Entidades públicas (secundario). Casos: Registrar predio y producción, Autorizar el uso de datos («include»), Consultar el requisito en su lenguaje, Registrar el requisito del comprador, Evaluar el predio contra la línea base («include» Consultar fuentes públicas; «extend» Orientar la subsanación), Emitir el pasaporte del predio, Consolidar el lote, Consultar indicadores. Momentos: símbolos → ¿quién inicia cada caso? → conectar.
   - Diagrama de clases del modelo conceptual: Productor, Predio, Lote, Evidencia, Requisito, FuenteDeDatos y sus hijas (RegistroSanitario, MonitoreoForestal, RegistroPredial). Las 5 relaciones del curso. Momentos: símbolos → ¿qué relación es cada frase? → conectar.
   - Más: descripción de un caso de uso con la plantilla del curso (talk + ordenar el curso básico), match, verdadero/falso y batalla con banco `Q.uml`.
5. **docs/uml/**: los mismos diagramas en SVG + Mermaid, más actividades (AS-IS), componentes y despliegue del software del juego.

## No-objetivos / anti-objetivos
- No reemplazar el DFD de datos ni el BPMN; no inventar procesos fuera de la propuesta o del BPMN del autor.
- No mezclar notaciones dentro de un mismo diagrama.
- No textos menores de ~11 px reales a 375 px; nada de frameworks.

## A criterio del constructor
Coordenadas, textos cortos de cada pieza, preguntas del banco, estilos (paleta y cartón existentes).
