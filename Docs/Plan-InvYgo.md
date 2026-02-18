# Plan de Desarrollo por Fases - Inventory YGO (InvYgo)

## 0. Alcance e integracion API externa (obligatorio)

Esta planificacion esta orientada a **construir el frontend de InvYgo** para consumir la API externa indicada y usarla como fuente oficial del catalogo de cartas.

API y documentacion oficiales del proyecto:

- Documentacion Swagger: `https://ygo-api-wrapper-177404616225.us-central1.run.app/api/docs`
- Especificacion OpenAPI JSON: `https://ygo-api-wrapper-177404616225.us-central1.run.app/api/docs-json`
- Endpoint principal de catalogo (cards): `https://ygo-api-wrapper-177404616225.us-central1.run.app/api/v1/cards`

Regla funcional base:

- El frontend debe consultar esta API para buscar/listar cartas y mostrar ilustraciones, filtros, metadatos y precios.
- La logica de inventario por usuario, decks y faltantes se construye alrededor de esos datos consumidos desde esta API.

---

## 1. Vision del producto

Construir una aplicacion web para coleccionistas y jugadores de Yu-Gi-Oh! que permita:

- Gestionar inventario personal por usuario (cartas fisicas, cantidad y estado).
- Buscar y explorar cartas consumiendo la API `GET /api/v1/cards` del wrapper provisto.
- Visualizar coleccion en modo galeria (ilustraciones) y modo lista.
- Crear decks desde catalogo global y comparar automaticamente contra inventario propio.
- Ver faltantes mientras se arma el deck (integrado en Deck Builder) y facilitar adquisicion mediante enlaces a tiendas/marketplaces.

Objetivo MVP: que cualquier usuario pueda pasar de "tengo cartas sueltas" a "tengo inventario estructurado y se exactamente que me falta para mi deck".

---

## 2. Segunda investigacion tecnica de la API (repaso real)

Fuentes revisadas:

- Swagger UI: `https://ygo-api-wrapper-177404616225.us-central1.run.app/api/docs`
- OpenAPI JSON: `https://ygo-api-wrapper-177404616225.us-central1.run.app/api/docs-json`
- Endpoint principal cards: `https://ygo-api-wrapper-177404616225.us-central1.run.app/api/v1/cards`

Pruebas ejecutadas en endpoints reales durante esta planificacion.

### 2.1 Endpoints utiles para InvYgo

- `GET /api/v1/cards`
  - Busqueda paginada con filtros dinamicos.
- `GET /api/v1/cards/{id}`
  - Carta por ID.
- `GET /api/v1/cards/name/{name}`
  - Carta por nombre exacto.
- `GET /api/v1/cards/random`
  - Carta aleatoria (util para home o discovery).
- `GET /api/v1/sets`
  - Catalogo de sets.
- `GET /api/v1/archetypes`
  - Catalogo de archetypes.
- `GET /api/v1/health` y `GET /api/v1/health/version`
  - Salud del wrapper y version de base externa.

### 2.2 Parametros de busqueda validados

En `GET /api/v1/cards`:

- `name` (exacto o muy cercano, segun backend)
- `fuzzyName`
- `attribute`
- `level`
- `atk` (ejemplo: `gte2500`)
- `def` (ejemplo: `lte2100`)
- `race`
- `archetype`
- `format`
- `banlist`
- `linkMarkers` (array)
- `page` (default 1)
- `limit` (default 20, max 100)

### 2.3 Estructura de respuesta observada

El API sigue estilo JSON:API:

- `jsonapi.version`
- `links` (`self`, `first`, `prev`, `next`, `last`)
- `data[]` o `data{}`
- `meta` (`totalItems`, `totalPages`, `currentPage`, `itemsPerPage`)

Campos de carta relevantes:

- Identidad: `id`, `name`, `type`, `frameType`, `description`
- Stats: `attack`, `defense`, `level`, `race`, `attribute`, `archetype`
- Imagenes: `images[]` (`imageUrl`, `imageUrlSmall`, `imageUrlCropped`)
- Precios: `prices[]` (`cardmarketPrice`, `tcgplayerPrice`, `ebayPrice`, `amazonPrice`, `coolstuffincPrice`)

### 2.4 Hallazgos importantes para arquitectura

1. `limit > 100` retorna `400` (esperable por schema).
2. Algunos requests pueden devolver `503` (inestabilidad puntual o dependencia upstream).
3. `cards/name/{name}` puede devolver multiples imagenes para una carta, mientras `cards/{id}` puede traer una sola imagen principal.
4. En `archetypes`, el nombre viene en `id` y `attributes` puede venir vacio.
5. No se observa URL de checkout directa por tienda en el wrapper; hay precios por marketplace.

### 2.5 Implicaciones para el sistema InvYgo

- Implementar resiliencia (retry con backoff + timeout + cache).
- Guardar snapshot local de catalogo minimo para no romper UX ante `503`.
- Normalizar imagenes y precios en tablas separadas.
- Resolver compra por estrategia de redireccion (query por nombre + marketplace), no por deeplink garantizado.

---

## 3. Stack tecnologico recomendado (MVP productivo, frontend-first)

### 3.1 Frontend (objetivo principal)

**TypeScript + React + Vite + TanStack Query + Zustand/Redux Toolkit**

Motivo:

- El producto se centra en frontend con consumo directo del catalogo de cartas desde la API externa.
- Manejo de estado y cache cliente maduros para filtros, paginacion, galeria y deck builder.
- Excelente performance percibida con listados grandes e imagenes.

### 3.2 Backend (soporte para usuarios/inventario)

**TypeScript + NestJS + PostgreSQL + Redis opcional**

Motivo:

- Excelente productividad para API robusta.
- Tipado fuerte compartible con frontend.
- Inyeccion de dependencias, modulos y testing bien soportados.
- Facil aplicar arquitectura por capas/clean.

### 3.3 Infra y calidad

- DB: PostgreSQL.
- Cache: Redis (fase 2-3).
- ORM: Prisma o TypeORM (preferencia: Prisma por DX).
- Tests: Vitest/Jest + Supertest + Playwright (E2E).
- CI: lint + typecheck + test + build.

---

## 4. Arquitectura por capas (obligatoria)

## 4.1 Capas

1. **Presentation Layer**
   - Frontend React (consumidor principal de `https://ygo-api-wrapper-177404616225.us-central1.run.app/api/v1/cards`) y vistas de inventario/deck.
2. **Application Layer**
   - Casos de uso (AddCardToInventory, BuildDeck, ComputeMissingCards).
3. **Domain Layer**
   - Entidades, VOs, reglas de negocio e interfaces.
4. **Infrastructure Layer**
   - Repositorios SQL, cliente HTTP hacia la API YGO wrapper, cache, logging, auth providers.

## 4.4 Estrategia de consumo de API en frontend

- Consumir directamente en frontend los endpoints de consulta de cartas (`/cards`, `/cards/{id}`, `/cards/name/{name}`, `/sets`, `/archetypes`).
- Usar `TanStack Query` para cache, deduplicacion de requests, retry y manejo de estado remoto.
- Aplicar `debounce` en buscador y cancelar requests anteriores al escribir.
- Usar paginacion con `page` y `limit` respetando maximo `limit=100`.
- Mostrar fallback de UI para `503` y reintento manual.

## 4.2 Reglas de dependencia

- `Presentation -> Application -> Domain`
- `Infrastructure -> Domain/Application (via interfaces)`
- Domain no conoce frameworks ni DB.

## 4.3 Modulos de negocio iniciales

- Auth
- Users
- CardsCatalog
- Inventory
- Decks
- DeckCoverage (faltantes integrados en Deck Builder)
- MarketplaceRedirect

---

## 5. Diseno funcional del producto

### 5.1 Modulo inventario

- Agregar carta desde buscador.
- Editar cantidad por carta.
- Metadatos por item (condicion, edicion, notas).
- Vista galeria y vista lista.

### 5.2 Modulo deck builder

- Crear deck por usuario.
- Secciones: Main, Extra, Side.
- Agregar/remover carta y cantidad.
- Reglas base de validacion por seccion.

### 5.3 Faltantes integrados en deck builder

- Comparar deck vs inventario en tiempo real dentro del deck builder.
- Mostrar faltante por carta: `max(0, cantidad_deck - cantidad_inventario)`.
- Agrupar por prioridad (faltan mas copias primero).
- No crear una pantalla separada de faltantes para el MVP.

### 5.4 Modulo compra

- Mostrar precios de marketplaces disponibles.
- Proveer botones de "Buscar en tienda" (redireccion por nombre de carta).
- Guardar click analytics para mejorar recomendaciones.

---

## 6. Direccion de UI (estilo moderno gamer, no generico)

Aplicando principios de `interface-design`.

### 6.1 Exploracion de dominio

- Duel terminal
- Tactical grid
- Card command center
- Build phase / sideboard phase
- Collection vault
- Trade intel

### 6.2 Color world (contexto Yu-Gi-Oh + sci-fi táctico)

- Navy profundo (`#061a2b`)
- Azul electrico (`#0b3a5c`)
- Cian HUD (`#13b8ff`)
- Acero oscuro (`#1f2c3a`)
- Ambar alerta (`#ffb020`)
- Rojo warning (`#ff5d5d`)

### 6.3 Signature de interfaz

**"Deck Command Panel"**: panel dual con grid de cartas a la izquierda y panel tactico de estado (inventario/deck/faltantes) a la derecha con feedback en tiempo real.

### 6.4 Defaults que se evitan

- Default 1: dashboard SaaS blanco generico -> reemplazo: atmosfera HUD competitiva.
- Default 2: cards uniformes sin narrativa -> reemplazo: foco en ilustracion + metadata util.
- Default 3: filtros escondidos en modales -> reemplazo: filter bar persistente tipo consola.

---

## 7. Modelo de datos propuesto (MVP)

### 7.1 Entidades principales

- `users`
- `cards_catalog`
- `card_images`
- `card_prices`
- `user_inventory`
- `decks`
- `deck_cards`
- `missing_cards_cache` (opcional)

### 7.2 Campos clave sugeridos

`user_inventory`

- `id`, `user_id`, `card_id`, `quantity`
- `condition` (NM/LP/MP/HP/DMG)
- `edition` (1st/Unlimited/Custom)
- `created_at`, `updated_at`

`deck_cards`

- `id`, `deck_id`, `card_id`, `quantity`
- `section` (`main|extra|side`)

### 7.3 Indices

- `cards_catalog(name)`
- `cards_catalog(archetype)`
- `user_inventory(user_id, card_id, condition, edition)` unique compuesto
- `deck_cards(deck_id, card_id, section)` unique compuesto

---

## 8. Plan por fases con checklist detallado

## Fase 0 - Descubrimiento y contratos (1 semana)

Objetivo: cerrar alcance MVP, contratos API internos y decisiones de negocio.

Checklist:

- [ ] Definir reglas de deck por formato inicial (TCG/OCG o custom MVP).
- [ ] Confirmar URLs oficiales de integracion: docs y endpoint cards del wrapper.
- [ ] Definir granularidad de inventario (solo cantidad vs cantidad+condicion+edicion).
- [ ] Definir privacidad de inventario y decks (privado por defecto).
- [ ] Definir taxonomia de errores de dominio.
- [ ] Definir versionado de API interna (`/api/v1`).
- [ ] Crear ADRs (Architecture Decision Records) de stack y arquitectura por capas.

Entregable:

- Documento de alcance + contratos + ADRs.

## Fase 1 - Fundacion tecnica (1-2 semanas)

Objetivo: base del proyecto lista para crecer sin deuda temprana.

Checklist:

- [ ] Crear monorepo (`apps/web`, `apps/api`, `packages/shared`).
- [ ] Configurar ESLint, Prettier, TypeScript strict.
- [ ] Configurar CI (lint + typecheck + tests).
- [ ] Configurar Docker local (Postgres, Redis).
- [ ] Configurar manejo de env vars y secretos.
- [ ] Estructurar backend por capas y modulos.

Entregable:

- Skeleton funcional con health checks.

## Fase 2 - Catalogo y autenticacion (1-2 semanas)

Objetivo: usuario autenticado + catalogo externo integrado con resiliencia.

Checklist:

- [ ] Auth JWT (access/refresh) + middleware de autorizacion.
- [ ] Integrar consumo del endpoint `https://ygo-api-wrapper-177404616225.us-central1.run.app/api/v1/cards` con timeout, retry y fallback.
- [ ] Endpoint interno `/cards/search` con filtros mapeados.
- [ ] Endpoint interno `/cards/:id` y `/cards/name/:name`.
- [ ] Cache de respuestas frecuentes (query+page+limit).
- [ ] Manejo de errores uniforme (JSON API error shape interno).

Entregable:

- API de catalogo lista para consumo frontend.

## Fase 3 - Inventario de usuario (1-2 semanas)

Objetivo: flujo completo buscar -> agregar -> editar -> listar inventario.

Checklist:

- [ ] CRUD de inventario por usuario.
- [ ] Reglas de no negativos y limites coherentes.
- [ ] Vista galeria de inventario con imagen (obtenida desde API de cards) y quick-actions.
- [ ] Vista lista con filtros y orden.
- [ ] Paginacion y busqueda local en inventario.
- [ ] Tests unitarios/integracion del modulo inventory.

Entregable:

- Inventario personal estable en UI y backend.

## Fase 4 - Deck builder y comparador (2 semanas)

Objetivo: construir deck y detectar faltantes automaticamente.

Checklist:

- [ ] CRUD de decks por usuario.
- [ ] Gestion de cartas por seccion (main/extra/side).
- [ ] Calculo server-side de faltantes por deck.
- [ ] UI de faltantes con prioridad y resumen integrada en Deck Builder (sin seccion aparte).
- [ ] Indicador de cobertura del deck (porcentaje completado).
- [ ] Tests de casos de uso de comparacion.

Entregable:

- Deck builder funcional conectado a inventario.

## Fase 5 - Compra y marketplace links (1 semana)

Objetivo: convertir faltantes en acciones de compra.

Checklist:

- [ ] Mostrar precios por marketplace desde API.
- [ ] Implementar redireccion por plantilla de busqueda por carta.
- [ ] Tracking de clicks de salida por tienda.
- [ ] Mensajes claros cuando no haya precio disponible.
- [ ] Fallback de UX ante datos incompletos.

Entregable:

- Flujo faltante -> ir a tienda funcionando.

## Fase 6 - Hardening y release beta (1-2 semanas)

Objetivo: calidad, seguridad y operacion real.

Checklist:

- [ ] Revisar OWASP API Top 10 (2023) aplicado al dominio.
- [ ] Rate limiting en endpoints criticos.
- [ ] Auditoria de autorizacion por recurso (evitar BOLA).
- [ ] Logging estructurado + trazas + alertas.
- [ ] Pruebas E2E de flujos clave.
- [ ] Checklist de despliegue y rollback.

Entregable:

- Beta controlada lista para usuarios reales.

---

## 9. Buenas practicas obligatorias del proyecto

- API-first y contratos versionados.
- Validacion de entrada en todos los endpoints.
- Separacion estricta por capas.
- No logica de negocio en controllers.
- Idempotencia donde aplique (actualizaciones).
- Observabilidad minima desde fase 2.
- Seguridad por defecto (deny-by-default en acceso a recursos).
- Documentacion viva en carpeta `Docs/`.

---

## 10. Riesgos, supuestos y mitigacion

### Riesgos

1. Inestabilidad eventual del wrapper (errores `503`).
2. Datos incompletos o inconsistentes (archetypes, imagenes multiples).
3. Ausencia de enlaces de compra directos por carta.

### Mitigaciones

- Cache local y fallback de datos.
- Normalizacion en capa de infraestructura.
- Estrategia de redireccion por marketplace + nombre.
- Monitoreo de errores por endpoint externo.

### Supuestos

- La API wrapper continuara disponible publicamente.
- El usuario final acepta redireccion a tiendas externas.

---

## 11. KPI de exito para MVP

- Tiempo medio para agregar 1 carta al inventario < 10 segundos.
- Tiempo medio para crear deck base de 40 cartas < 8 minutos.
- Precision del calculo de faltantes: 100% (reglas MVP).
- Tasa de errores de integracion externa controlada con fallback > 95% de operaciones sin bloqueo UX.

---

## 12. Definicion de Done (MVP)

Un usuario autenticado puede:

- Buscar cartas consumiendo la API `https://ygo-api-wrapper-177404616225.us-central1.run.app/api/v1/cards`.
- Agregar y administrar inventario personal.
- Ver cartas en galeria y lista.
- Crear deck y cargar cartas por seccion.
- Visualizar faltantes exactos vs inventario dentro del Deck Builder.
- Consultar precios por marketplace y redirigirse a compra.

Y ademas:

- El sistema pasa pruebas criticas (unit + integration + E2E basico).
- Existe logging y manejo de errores consistente.
- La documentacion tecnica en `Docs/` esta actualizada.

---

## 13. Plan de ejecucion semanal

El desglose por sprints semanales (con fechas, objetivos, checklists y entregables) se encuentra en:

- `Docs/Sprints-MVP.md`
