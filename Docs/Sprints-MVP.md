# Roadmap MVP por Sprints - Inventory YGO

## Contexto

Este roadmap esta enfocado en construir el **frontend** de InvYgo consumiendo la API externa:

- Docs: `https://ygo-api-wrapper-177404616225.us-central1.run.app/api/docs`
- OpenAPI JSON: `https://ygo-api-wrapper-177404616225.us-central1.run.app/api/docs-json`
- Endpoint principal cards: `https://ygo-api-wrapper-177404616225.us-central1.run.app/api/v1/cards`

Base de planificacion:

- Inicio propuesto: semana del **2026-02-23**
- Duracion: **8 sprints** (1 semana cada uno)
- Cadencia: lunes a viernes
- Demo/review: viernes

---

## Sprint 1 (2026-02-23 al 2026-02-27) - Fundacion frontend ✓ COMPLETADO

Objetivo: dejar base tecnica del frontend lista para iterar rapido.

Checklist:

- [x] Crear proyecto React + TypeScript + Vite.
- [x] Configurar estructura de carpetas por features.
- [x] Configurar lint/format/typecheck.
- [x] Integrar TanStack Query y cliente HTTP base.
- [x] Definir variables de entorno para API base URL.
- [x] Implementar layout base y navegacion principal.

Entregables:

- App frontend corriendo con entorno dev estable. ✓
- Estructura inicial lista para modulo catalogo. ✓

Definition of Done:

- Build local sin errores. ✓
- Lint y typecheck en verde. ✓

---

## Sprint 2 (2026-03-02 al 2026-03-06) - Catalogo de cartas v1 ✓ COMPLETADO

Objetivo: busqueda y listado funcional consumiendo `/api/v1/cards`.

Checklist:

- [x] Implementar buscador por `name` y `fuzzyName`.
- [x] Renderizar cards con imagen (`imageUrlSmall`), nombre y tipo.
- [x] Implementar paginacion con `page` y `limit`.
- [x] Integrar estados loading/empty/error.
- [x] Manejar errores API (`400`, `503`) con mensajes claros.
- [x] Resolver CORS con proxy de Vite (extra, no estaba en el plan original).

Entregables:

- Pantalla de catalogo navegable con resultados reales. ✓

Definition of Done:

- Se puede buscar "Dark Magician" y navegar paginas. ✓

---

## Sprint 3 (2026-03-09 al 2026-03-13) - Filtros avanzados y UX gamer ✓ COMPLETADO

Objetivo: mejorar precision de busqueda y experiencia visual.

Checklist:

- [x] Agregar filtros: `attribute`, `level`, `atk`, `def`, `race`, `archetype`.
- [x] Persistir filtros en URL (useSearchParams — surviven refresh y son compartibles).
- [x] Implementar debounce y cancelacion de requests (AbortSignal via TanStack Query).
- [x] Aplicar sistema visual gamer (tokens, paleta, estados) — FilterBar HUD style.
- [x] Crear vista alterna lista/galeria (ViewToggle + CardListView).
- [x] Filtro de arquetipo como dropdown usando `/api/v1/archetypes` (useArchetypes hook).
- [x] Internacionalizacion (i18n): react-i18next, ES/EN, LanguageToggle en Navbar.
- [x] Todo el texto hardcodeado en el codigo migrado a claves de traduccion.
- [x] Tooltip de carta al hover: CardTooltip con createPortal, delay 300ms, posicionamiento inteligente.
- [x] Fix posicionamiento tooltip en vista lista: prop `preferRight` → siempre aparece a la derecha.

Entregables:

- Busqueda avanzada utilizable para construccion de inventario/deck. ✓
- UI consistente con estilo moderno gamer. ✓
- App bilingue ES/EN con selector de idioma en navbar. ✓
- Hover sobre carta muestra panel con descripcion, stats y precio. ✓
- Tooltip en lista siempre a la derecha sin tapar el contenido de la fila. ✓

Definition of Done:

- Filtros combinados devuelven resultados correctos y UX fluida. ✓
- Archetype select poblado desde API. ✓
- Cambio de idioma en runtime sin recarga. ✓
- Tooltip en galeria: derecha del card (o izquierda si no cabe). ✓
- Tooltip en lista: siempre borde derecho del viewport, alineado a la fila hover. ✓

---

## Sprint 4 (2026-03-16 al 2026-03-20) - Inventario por usuario v1

Objetivo: registrar cartas fisicas del usuario.

Checklist:

- [ ] Implementar flujo "Agregar a inventario" desde card tile.
- [ ] Crear vista "Mi inventario" en modo galeria.
- [ ] Editar cantidad por carta.
- [ ] Guardar metadatos minimos (condicion/edicion).
- [ ] Validaciones de negocio (cantidad positiva).

Entregables:

- Inventario personal funcional en frontend.

Definition of Done:

- Usuario puede agregar, ver y editar cartas en inventario.

---

## Sprint 5 (2026-03-23 al 2026-03-27) - Deck Builder v1 + faltantes integrados

Objetivo: crear decks, poblarlos con cartas y visualizar faltantes sin salir del builder.

Checklist:

- [ ] Crear/eliminar/renombrar deck.
- [ ] Agregar cartas al deck por seccion (`main`, `extra`, `side`).
- [ ] Editar cantidades dentro del deck.
- [ ] Mostrar resumen por seccion + panel integrado de faltantes.
- [ ] Persistir estado del deck.

Entregables:

- Deck builder usable end-to-end para un deck, con faltantes visibles en el mismo flujo.

Definition of Done:

- Usuario arma un deck completo, ve faltantes en tiempo real y lo guarda.

---

## Sprint 6 (2026-03-30 al 2026-04-03) - Refinamiento de Deck Builder y cobertura

Objetivo: mejorar la experiencia del panel de cobertura/faltantes integrado en Deck Builder.

Checklist:

- [ ] Mejorar calculo y presentacion de faltantes por carta dentro del builder.
- [ ] Mejorar orden/prioridades y densidad visual del panel integrado.
- [ ] Ajustar indicador de porcentaje de completitud del deck.
- [ ] Mensajes de estado (completo/parcial/incompleto) en contexto de armado.
- [ ] Ajustes UX de lectura rapida y acciones rapidas de edicion.

Entregables:

- Deck Builder refinado con cobertura/faltantes integrada y conectado a inventario.

Definition of Done:

- Se visualiza correctamente que cartas faltan y cuantas copias sin usar una seccion aparte.

---

## Sprint 7 (2026-04-06 al 2026-04-10) - Marketplaces y accion de compra

Objetivo: convertir faltantes en accion.

Checklist:

- [ ] Mostrar `prices[]` por marketplace en carta faltante.
- [ ] Botones "Buscar en tienda" por marketplace.
- [ ] Construir links de redireccion por nombre de carta.
- [ ] Manejar casos sin precio disponible.
- [ ] Instrumentar tracking de clicks salientes.

Entregables:

- Flujo faltante -> ver precio -> ir a tienda.

Definition of Done:

- Usuario puede salir a marketplace desde faltantes.

---

## Sprint 8 (2026-04-13 al 2026-04-17) - Hardening y beta

Objetivo: estabilidad para usuarios reales.

Checklist:

- [ ] Tests E2E de flujo critico completo.
- [ ] Optimizacion de performance (imagenes, cache, render).
- [ ] Fortalecer manejo de errores y reintentos.
- [ ] Revisar seguridad de API consumption y sesiones.
- [ ] Checklist de release y documentacion final.

Entregables:

- Version beta del frontend lista para validacion con usuarios.

Definition of Done:

- Flujo completo estable y demo funcional de punta a punta.

---

## Flujo critico de referencia (debe funcionar en beta)

1. Buscar carta desde API externa.
2. Agregar carta al inventario personal.
3. Crear deck y cargar cartas.
4. Ver faltantes exactos dentro del Deck Builder.
5. Abrir marketplace para comprar faltantes.

---

## Riesgos operativos por sprint

- Dependencia API externa: usar retries y estados de fallback en UI.
- Volumen de imagenes: lazy loading y placeholders.
- Cambios en schema externo: validar respuestas y normalizar mapping.

---

## Metricas por sprint

- Tiempo promedio de busqueda < 1.5 s (con cache caliente).
- Error rate de requests visualmente bloqueantes < 5%.
- Tiempo para agregar carta al inventario < 10 s.
- Tiempo para crear deck base (40 cartas) < 8 min.
