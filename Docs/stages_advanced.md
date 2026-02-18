# Stages Avanzados — Post-MVP

> ⚠️ Este documento no entra en planificacion activa hasta completar los 8 sprints del MVP
> (fecha estimada de inicio: a partir del 2026-04-20).

---

## Feature: Filtro por Tipo de Carta (Frame Type)

### Descripcion

Agregar un dropdown en la FilterBar que permita al usuario filtrar el catalogo
por tipo de frame de carta: Normal, Efecto, Ritual, Fusion, Sincro, XYZ, Link,
Magia, Trampa y Token.

### Contexto tecnico

Este filtro ya fue implementado y revertido durante el Sprint 3.
La razon es que el Wrapper API (`/api/v1/cards`) no soporta el parametro
`frameType` ni `type` — los rechaza con 400.

La solucion explorada fue escanear paginas del Wrapper API y filtrar en cliente,
lo cual funciona pero impacta la performance cuando el tipo buscado es poco comun
en el pool general de resultados (ej. Ritual, Link, XYZ).

Toda la logica esta lista y comentada en el codigo; solo falta re-exponer el
control en la UI una vez que se decida la estrategia final.

### Opciones de implementacion evaluadas

| Opcion | Descripcion | Pros | Contras |
|--------|-------------|------|---------|
| A — Cliente puro | Wrapper API sin filtro de tipo + filtrar cartas recibidas en cliente | Simple, sin cambios de backend | Requiere escanear muchas paginas para tipos raros; lento para Ritual/XYZ/Link |
| B — API externa directa | Llamar YGOPRODECK public API (`db.ygoprodeck.com/api/v7`) por tipo nativo | Resultados exactos sin escaneo | Dos APIs distintas en el proyecto; posible rate-limit; desacoplado del Wrapper |
| C — Soporte en el Wrapper | Pedir al equipo de backend que agregue soporte del param `type` al Wrapper API | Un solo cliente HTTP, resultados exactos | Requiere coordinar con backend |

### Estado actual del codigo

- `CatalogFilters.frameType` — campo presente en el tipo, persiste en URL.
- `useCatalogFilters` — lee/escribe `frameType` desde `useSearchParams`.
- `useCards.ts` — `fetchCardsWithClientFrameFilters` ya maneja `frameType` via
  `FRAME_FAMILY` (incluye variantes pendulum) y `matchesClientOnlyFilters`.
- `MAX_SCAN_PAGES_BY_TYPE` — limites de paginas por tipo ya calibrados.
- `constants.ts` — `FRAME_TYPES` y `RARE_FRAME_TYPES` disponibles para poblar el dropdown.
- `FilterBar.tsx` — bloque del select eliminado de la UI; el resto permanece intacto.

### Para re-activar el filtro

1. En `FilterBar.tsx`, re-agregar el import de `FRAME_TYPES` y el bloque JSX del select.
2. Evaluar y elegir la opcion de implementacion (A, B o C).
3. Si se elige la opcion B o C, actualizar `queryFn` en `useCards.ts` acordemente.
4. Ajustar `MAX_SCAN_PAGES_BY_TYPE` si la opcion elegida aun requiere escaneo en cliente.

### Criterios de aceptacion (cuando se retome)

- [ ] Seleccionar "Normal" muestra solo monstruos de frame normal y normal-pendulum.
- [ ] Seleccionar "Fusion" muestra al menos 20 cartas en la pagina 1.
- [ ] Seleccionar "Link" muestra al menos 20 cartas en la pagina 1.
- [ ] El filtro se combina correctamente con Atributo, Raza, Arquetipo y Nombre.
- [ ] El filtro persiste en la URL y survives refresh.
- [ ] El contador de filtros activos incluye frameType cuando esta seteado.
- [ ] No hay regresiones en los filtros existentes al re-activarlo.

---

## Otros features post-MVP (placeholder)

> Agregar aqui cualquier idea que surja durante los sprints 4-8 y que no quepa
> en el scope del MVP actual.

- TBD
