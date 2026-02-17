# Backlog MVP - Inventory YGO

## Objetivo del backlog

Definir historias de usuario priorizadas para construir el frontend de InvYgo consumiendo:

- Docs API: `https://ygo-api-wrapper-177404616225.us-central1.run.app/api/docs`
- Cards API: `https://ygo-api-wrapper-177404616225.us-central1.run.app/api/v1/cards`

## Convenciones

- Prioridad: `P0` (critico), `P1` (alto), `P2` (mejora)
- Esfuerzo: `S`, `M`, `L`
- Estado inicial: `Todo`

---

## EPIC A - Integracion de catalogo (API externa)

### A1. Buscador de cartas por nombre
- Prioridad: `P0`
- Esfuerzo: `M`
- Historia: Como usuario quiero buscar cartas por nombre para encontrarlas rapido.
- Criterios de aceptacion:
  - Consulta `GET /api/v1/cards?name=...` y `fuzzyName` con debounce.
  - Muestra loading, vacio y error.
  - Renderiza nombre, tipo, atributo e imagen.

### A2. Filtros avanzados de catalogo
- Prioridad: `P0`
- Esfuerzo: `L`
- Historia: Como usuario quiero filtrar por atributo, nivel, atk/def, race y archetype.
- Criterios de aceptacion:
  - Soporta query params combinados.
  - Mantiene filtros en URL.
  - Permite limpiar filtros con una accion.

### A3. Paginacion del catalogo
- Prioridad: `P0`
- Esfuerzo: `S`
- Historia: Como usuario quiero paginar resultados para navegar miles de cartas.
- Criterios de aceptacion:
  - Usa `page` y `limit` (<=100).
  - Lee `meta.totalPages` y `meta.currentPage`.

### A4. Pantalla de detalle de carta
- Prioridad: `P1`
- Esfuerzo: `M`
- Historia: Como usuario quiero ver detalle completo de una carta antes de agregarla.
- Criterios de aceptacion:
  - Usa `GET /api/v1/cards/{id}`.
  - Muestra imagen grande, stats y precios.

---

## EPIC B - Inventario por usuario

### B1. Agregar carta a inventario
- Prioridad: `P0`
- Esfuerzo: `M`
- Historia: Como usuario quiero agregar una carta y cantidad a mi inventario.
- Criterios de aceptacion:
  - Desde resultado de busqueda se puede agregar en 1-2 clics.
  - Valida cantidad > 0.

### B2. Editar cantidad y metadatos
- Prioridad: `P0`
- Esfuerzo: `M`
- Historia: Como usuario quiero editar cantidad, condicion y edicion.
- Criterios de aceptacion:
  - Edicion inline o modal rapido.
  - Confirmacion visual de guardado.

### B3. Vista galeria de inventario
- Prioridad: `P0`
- Esfuerzo: `M`
- Historia: Como usuario quiero ver mis cartas en formato visual.
- Criterios de aceptacion:
  - Card tiles con imagen y badge de cantidad.
  - Responsive desktop/movil.

### B4. Vista lista de inventario
- Prioridad: `P1`
- Esfuerzo: `M`
- Historia: Como usuario quiero una vista tabular para gestionar mas rapido.
- Criterios de aceptacion:
  - Orden por nombre, cantidad y tipo.
  - Filtros y busqueda local.

---

## EPIC C - Deck Builder

### C1. Crear deck
- Prioridad: `P0`
- Esfuerzo: `S`
- Historia: Como usuario quiero crear un deck con nombre y formato.
- Criterios de aceptacion:
  - Crear, renombrar y eliminar deck.

### C2. Gestion de cartas en deck
- Prioridad: `P0`
- Esfuerzo: `L`
- Historia: Como usuario quiero agregar cartas al main/extra/side deck.
- Criterios de aceptacion:
  - Seleccion de seccion por carta.
  - Ajuste de cantidad por carta.

### C3. Validaciones basicas de deck
- Prioridad: `P1`
- Esfuerzo: `M`
- Historia: Como usuario quiero recibir feedback cuando mi deck no cumple reglas base.
- Criterios de aceptacion:
  - Contadores por seccion.
  - Alertas de limites configurados.

---

## EPIC D - Faltantes y compra

### D1. Calculo de faltantes
- Prioridad: `P0`
- Esfuerzo: `M`
- Historia: Como usuario quiero saber exactamente que cartas me faltan para completar mi deck.
- Criterios de aceptacion:
  - Formula: `faltante = max(0, cantidad_deck - cantidad_inventario)`.
  - Vista de faltantes ordenada por prioridad.

### D2. Mostrar precios por marketplace
- Prioridad: `P1`
- Esfuerzo: `S`
- Historia: Como usuario quiero ver referencia de precios para decidir compra.
- Criterios de aceptacion:
  - Usa `prices[]` de la API.
  - Maneja ausencia de precio.

### D3. Redireccion a tienda
- Prioridad: `P1`
- Esfuerzo: `M`
- Historia: Como usuario quiero abrir una tienda para comprar carta faltante.
- Criterios de aceptacion:
  - Botones por marketplace con query por nombre.
  - Registra click de salida.

---

## EPIC E - Calidad, seguridad y operacion

### E1. Manejo robusto de errores API
- Prioridad: `P0`
- Esfuerzo: `M`
- Historia: Como usuario quiero que la app no se rompa cuando falle la API.
- Criterios de aceptacion:
  - Manejo `400`, `404`, `503`.
  - Reintento manual y mensaje claro.

### E2. Performance frontend
- Prioridad: `P1`
- Esfuerzo: `M`
- Historia: Como usuario quiero que la app sea fluida incluso con muchos resultados.
- Criterios de aceptacion:
  - Lazy loading de imagenes.
  - Cache de queries y memoizacion de listas.

### E3. Pruebas de flujos criticos
- Prioridad: `P0`
- Esfuerzo: `M`
- Historia: Como equipo quiero asegurar estabilidad en los flujos principales.
- Criterios de aceptacion:
  - Test E2E: buscar carta -> agregar inventario -> crear deck -> ver faltantes.

---

## Sugerencia de orden de ejecucion

1. A1 -> A2 -> A3
2. B1 -> B2 -> B3
3. C1 -> C2 -> D1
4. B4 -> C3 -> D2 -> D3
5. E1 -> E2 -> E3
