# Sprint 2 - Catálogo de Cartas v1 ✓ COMPLETADO

**Período:** 2026-02-17
**Estado:** Completado y verificado (lint ✓, typecheck ✓, build ✓, CORS resuelto ✓)

---

## 1. Qué se hizo

### El problema extra que apareció: CORS
Al probar en el browser saltó un error de CORS. La API externa no permite llamadas
directas desde `localhost`. Se resolvió configurando un **proxy en Vite** que intercepta
los requests del browser y los reenvía desde el servidor (donde CORS no aplica).

**Cambios para el proxy:**
- `vite.config.ts` → se agregó `server.proxy`: `/ygo-api` → API externa
- `.env` → `VITE_YGO_API_BASE_URL` cambió de URL absoluta a `/ygo-api/v1` (ruta relativa)

### Estructura de archivos creada

```
src/
├── hooks/
│   └── useDebounce.ts                      ← Hook genérico, reusable en todo el proyecto
├── features/catalog/
│   ├── types.ts                            ← Raw JSON:API + tipos normalizados + normalizer
│   ├── api.ts                              ← fetchCards({ name, fuzzyName, page, limit })
│   ├── hooks/
│   │   └── useCards.ts                     ← TanStack Query + debounce + keepPreviousData
│   ├── components/
│   │   ├── SearchBar.tsx / .module.css     ← Input con ícono, clear, estado "buscando"
│   │   ├── CardTile.tsx / .module.css      ← Card: imagen lazy, badges frame/attr, stats
│   │   ├── CardGrid.tsx / .module.css      ← Grid responsive auto-fill, se atenúa al paginar
│   │   └── Pagination.tsx / .module.css   ← Paginación con ellipsis, info "X–Y de N"
│   └── index.ts                            ← Barrel export del feature
├── components/ui/
│   ├── LoadingSpinner.tsx / .module.css    ← Spinner con ring cian animado
│   ├── ErrorMessage.tsx / .module.css      ← Error + retry, mensaje diferenciado por 503
│   └── EmptyState.tsx / .module.css        ← Estado vacío con ícono
└── pages/
    ├── CatalogPage.tsx / .module.css       ← Página completa conectada
```

### Flujo de datos completo

```
Usuario escribe "Dark Magician"
    ↓ (400ms debounce)
useCards hook
    ↓ queryKey: ['cards', { search: 'Dark Magician', page: 1, limit: 20 }]
fetchCards() → axios GET /ygo-api/v1/cards?fuzzyName=Dark+Magician&page=1&limit=20
    ↓
Vite proxy → GET https://ygo-api-wrapper.../api/v1/cards?fuzzyName=...
    ↓
Raw JSON:API response
    ↓ normalizeCardsResponse()
{ cards: Card[], pagination: { totalItems, totalPages, currentPage, itemsPerPage } }
    ↓
CatalogPage → CardGrid → CardTile (×20)
              Pagination
```

---

## 2. Cómo probarlo

```bash
# Reiniciar el servidor (obligatorio para que tome el nuevo .env y vite.config)
# Ctrl+C primero, luego:
cd apps/web
npm run dev
```

**Ir a `http://localhost:5173/catalog` y verificar:**

| Prueba | Resultado esperado |
|---|---|
| Carga inicial | 20 cartas aparecen en grilla |
| Paginación | "1–20 de 14,149 cartas" en el pie |
| Escribir "Dark Magician" | Espera ~400ms y filtra resultados |
| Ícono del buscador | Gira `⟳` mientras debouncea, vuelve a `⌕` |
| Botón ✕ | Aparece cuando hay texto, limpia la búsqueda |
| Cambiar página | Grilla se atenúa mientras carga la siguiente |
| Nombre sin resultados | Estado vacío "Sin resultados" |
| Hover sobre card | Se eleva 3px con glow cian |
| Badge de frame | "NOR", "SPC", "TRP", "SYN", etc. sobre imagen |
| Badge de atributo | Color por atributo: DARK=violeta, LIGHT=amarillo, etc. |

**Verificar que no hay CORS:**
- Abrir DevTools → Network
- Los requests deben ir a `/ygo-api/v1/cards` (no a la URL externa directa)
- Status 200, sin errores rojos de CORS

---

## 3. Guía educativa para el estudiante

> Explicación detallada de cada concepto nuevo implementado en Sprint 2.
> Cada sección tiene: qué es, por qué lo usamos, analogía y código real del proyecto.

---

### 3.1 CORS — El problema y cómo lo resolvemos

#### ¿Qué es CORS?

**CORS** (Cross-Origin Resource Sharing) es una política de seguridad que los browsers
implementan para protegerte. La regla es simple:

> "Si tu página está en el dominio A, no puede pedir datos al dominio B
> a menos que el dominio B lo permita explícitamente."

**Analogía:** Es como un guardia de edificio corporativo. Si sos del piso 3 (localhost:5173)
y querés entrar al piso 7 (api.externa.com), el guardia te pide autorización del piso 7.
Si el piso 7 no dice "este chico puede entrar", te bloquean en la puerta.

#### Por qué pasó en el proyecto

```
Browser en localhost:5173 →  Request a ygo-api-wrapper-....run.app
                          ←  ❌ Sin header 'Access-Control-Allow-Origin'
                              BLOQUEADO por el browser
```

El servidor externo no tiene configurado ese header para `localhost`. No podemos
modificar ese servidor porque no es nuestro.

#### La solución: Proxy de Vite

```
Browser en localhost:5173 →  GET /ygo-api/v1/cards   (mismo origen = sin CORS)
        ↓
Vite Dev Server (Node.js)  →  GET https://ygo-api-wrapper.../api/v1/cards
                               (server-to-server: CORS no existe acá)
        ↓
API externa                ←  200 OK con los datos
        ↓
Browser                    ←  recibe los datos limpiamente
```

**El browser solo habla con Vite. Vite habla con la API. CORS no aplica entre servidores.**

#### El código del proxy (`vite.config.ts`)

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/ygo-api': {
        target: 'https://ygo-api-wrapper-177404616225.us-central1.run.app',
        changeOrigin: true,
        rewrite: p => p.replace(/^\/ygo-api/, '/api'),
      },
    },
  },
})
```

- `'/ygo-api'` → intercepta cualquier request que empiece con `/ygo-api`
- `target` → lo reenvía a esa URL base
- `changeOrigin: true` → cambia el header `Host` al del target (necesario para muchos servidores)
- `rewrite` → renombra la ruta: `/ygo-api/v1/cards` → `/api/v1/cards`

**Por eso el `.env` ahora dice:**
```
VITE_YGO_API_BASE_URL=/ygo-api/v1
```
Es una ruta relativa. El browser la pide a sí mismo (Vite), y Vite la proxea.

#### ¿Y en producción?

El proxy de Vite solo existe en desarrollo. En producción hay dos opciones:
1. El servidor de producción tiene el mismo dominio que la API (no hay CORS)
2. Se crea un backend propio que actúa de proxy (lo haremos en el Sprint de backend)

---

### 3.2 JSON:API — El formato de respuesta de la API

#### ¿Qué es?

**JSON:API** es una especificación estándar para estructurar respuestas de APIs REST.
En vez de devolver objetos planos, envuelve todo en una estructura fija con `data`,
`meta` y `links`.

**Respuesta real de la API del proyecto:**
```json
{
  "jsonapi": { "version": "1.1" },
  "links": {
    "self": "/api/v1/cards?limit=1",
    "first": "/api/v1/cards?limit=1&page=1",
    "prev": null,
    "next": "/api/v1/cards?limit=1&page=2",
    "last": "/api/v1/cards?limit=1&page=14149"
  },
  "data": [
    {
      "type": "cards",
      "id": "80181649",
      "attributes": {
        "name": "\"A Case for K9\"",
        "type": "Spell Card",
        "frameType": "spell",
        "race": "Continuous",
        "archetype": "K9",
        "images": [{ "id": 80181649, "imageUrl": "...", "imageUrlSmall": "..." }],
        "prices": [{ "cardmarketPrice": "0.23", "tcgplayerPrice": "0.24" }]
      }
    }
  ],
  "meta": {
    "totalItems": 14149,
    "totalPages": 14149,
    "currentPage": 1,
    "itemsPerPage": 1
  }
}
```

**Cosas raras que encontramos:**
- Los datos de la carta están en `data[i].attributes`, no directamente en `data[i]`
- `prices` son `string`, no `number` (ej: `"0.23"` en vez de `0.23`)
- `attack`, `defense`, `level`, `attribute` no existen en Spell/Trap cards

#### El patrón Normalizer

En vez de trabajar con la estructura rara del JSON:API en toda la app, normalizamos
en un solo lugar: la capa de API. El resto de la app trabaja con objetos limpios.

```typescript
// ANTES de normalizar (raw, difícil de usar):
card.attributes.name
card.attributes.images[0].imageUrlSmall
parseFloat(card.attributes.prices[0].cardmarketPrice)

// DESPUÉS de normalizar (limpio):
card.name
card.images[0].imageUrlSmall
card.prices[0].cardmarketPrice  // ya es number
```

**El normalizer del proyecto (`types.ts`):**

```typescript
export function normalizeCardsResponse(raw: RawCardsResponse): CardsResult {
  const cards: Card[] = raw.data.map(item => ({
    id: item.id,
    name: item.attributes.name,      // ← Sacamos de .attributes
    type: item.attributes.type,
    // ... resto de campos
    prices: item.attributes.prices.map(p => ({
      cardmarketPrice: parseFloat(p.cardmarketPrice),  // ← string → number
      tcgplayerPrice:  parseFloat(p.tcgplayerPrice),
    })),
  }))

  return { cards, pagination: raw.meta }
}
```

**Regla de oro:** La API externa puede cambiar su formato mañana. Si normalizás en
un solo lugar, solo tenés que actualizar el normalizer y el resto de la app no se entera.

---

### 3.3 TypeScript: dos capas de tipos

En el proyecto usamos dos capas de tipos para la misma carta. ¿Por qué?

```typescript
// Capa 1: Raw — refleja EXACTAMENTE lo que manda la API
interface RawCardAttributes {
  name: string
  prices: { cardmarketPrice: string }[]  // ← string porque la API manda string
  attack?: number  // ← opcional porque Spell cards no tienen ATK
}

// Capa 2: Dominio — lo que el resto de la app quiere ver
interface Card {
  name: string
  prices: { cardmarketPrice: number }[]  // ← number porque ya parseamos
  attack?: number
}
```

**¿Por qué dos capas?**

Si usarás solo un tipo, tendrías que hacer `parseFloat()` en cada componente que
muestre un precio. Con la normalización, el componente recibe `number` directamente.

```typescript
// Sin normalizar (malo):
function CardTile({ card }: { card: RawCard }) {
  const price = parseFloat(card.attributes.prices[0]?.cardmarketPrice ?? '0')
  // ← parseFloat en cada componente que muestre precio
}

// Con normalizar (bien):
function CardTile({ card }: { card: Card }) {
  const price = card.prices[0]?.cardmarketPrice ?? 0
  // ← ya es number, sin conversión
}
```

---

### 3.4 useDebounce — Esperando que el usuario termine de escribir

#### ¿Qué es debounce?

**Debounce** significa "ejecutar esta función, pero solo cuando el usuario dejó de
hacer algo por X milisegundos".

**Sin debounce:** El usuario escribe "Dark Magician" (13 caracteres).
Se disparan 13 requests a la API (uno por cada tecla).

**Con debounce de 400ms:** El usuario escribe. El hook espera. Si el usuario para
por 400ms, recién ahí dispara 1 request.

**Analogía:** Es el botón de "abrir puerta" del ascensor. Si alguien aprieta, el
ascensor espera 3 segundos a que entren más personas antes de cerrar. No cierra
la puerta inmediatamente con cada apretón.

#### El hook del proyecto

```typescript
// src/hooks/useDebounce.ts
import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    // Inicia un timer al recibir un nuevo valor
    const timer = setTimeout(() => setDebounced(value), delayMs)

    // Si llega un nuevo valor antes de que termine el timer,
    // cancela el timer anterior y empieza uno nuevo
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
```

**Visualización del comportamiento:**

```
Usuario escribe:  D  a  r  k     M  a  g
Tiempo (ms):      0  80 160 240 320 400 480 560
Timer anterior:   X  X  X  X   X  X  X  X     ← cancelado en cada tecla
Timer activo:                               [═══400ms═══]
Request disparado:                                       ← solo 1 request
```

**Cómo se usa en `useCards.ts`:**

```typescript
export function useCards({ searchTerm, page, limit = 20 }: UseCardsParams) {
  // searchTerm cambia en cada tecla
  // debouncedSearch cambia solo 400ms después de que el usuario para
  const debouncedSearch = useDebounce(searchTerm.trim(), 400)

  const query = useQuery({
    // La queryKey usa debouncedSearch, no searchTerm
    // → TanStack Query solo hace request cuando debouncedSearch cambia
    queryKey: ['cards', { search: debouncedSearch, page, limit }],
    queryFn: () => fetchCards({ fuzzyName: debouncedSearch || undefined, page, limit }),
  })

  return {
    ...query,
    // true cuando el usuario escribió algo pero el debounce aún no disparó
    isSearching: searchTerm.trim() !== debouncedSearch,
  }
}
```

`isSearching` se usa para mostrar el ícono girando `⟳` mientras el debounce está
en progreso, dando feedback visual inmediato aunque el request no haya salido aún.

---

### 3.5 TanStack Query avanzado: queryKey y keepPreviousData

#### La queryKey como identidad del cache

```typescript
queryKey: ['cards', { search: 'Dark Magician', page: 1, limit: 20 }]
```

Cada combinación única de queryKey tiene su propio cache independiente. Esto significa:

```
queryKey ['cards', { search: '',              page: 1 }]  → cache A
queryKey ['cards', { search: 'Dark Magician', page: 1 }]  → cache B
queryKey ['cards', { search: 'Dark Magician', page: 2 }]  → cache C
```

Si el usuario va a la página 2 y vuelve a la 1, los datos de la página 1 están
en cache (si no expiró el `staleTime`). **Cero requests extra.**

#### keepPreviousData — Sin parpadeos al paginar

```typescript
const query = useQuery({
  queryKey: ['cards', { search, page, limit }],
  queryFn: fetchCards,
  placeholderData: keepPreviousData,  // ← esta línea
})
```

**Sin `keepPreviousData`:** Al cambiar de página, `data` se vuelve `undefined`
mientras carga la nueva. El componente muestra el spinner. La grilla desaparece.
Parpadeo horrible.

**Con `keepPreviousData`:** Al cambiar de página, `data` sigue mostrando los
datos de la página anterior mientras carga la nueva. El componente atenúa la
grilla (`isFetching = true`). La nueva data aparece sin parpadeos.

```
Página 1 cargada:   [20 cartas visibles, isFetching: false]
Usuario presiona →  [20 cartas de página 1, isFetching: true, grilla al 50% opacidad]
Página 2 llega:     [20 cartas de página 2, isFetching: false]
```

---

### 3.6 CSS Grid auto-fill + minmax — Responsive sin media queries

#### El problema que resuelve

Hacer una grilla responsive normalmente requiere esto:

```css
/* Sin auto-fill */
.grid { grid-template-columns: repeat(2, 1fr); }          /* móvil */

@media (min-width: 640px) {
  .grid { grid-template-columns: repeat(3, 1fr); }        /* tablet */
}

@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(5, 1fr); }        /* desktop */
}
```

Tenés que decidir cuántas columnas en cada breakpoint.

#### La solución: `auto-fill` + `minmax`

```css
/* Del proyecto, CardGrid.module.css */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
}
```

**¿Cómo funciona?**

- `auto-fill` → "creá todas las columnas que quepan"
- `minmax(140px, 1fr)` → "cada columna mide mínimo 140px, máximo todo el espacio disponible"

El navegador calcula solo cuántas columnas entran:

```
Pantalla 320px:   [320 / 140] = 2 columnas de ~160px
Pantalla 768px:   [768 / 140] = 5 columnas de ~153px
Pantalla 1440px:  [1440 / 140] = 10 columnas de ~144px
```

**Sin escribir ni una media query extra.** El CSS es inteligente solo.

---

### 3.7 CSS aspect-ratio — Proporciones sin trucos

Las cartas de Yu-Gi-Oh tienen una proporción estándar de 59×86mm. Para mantenerla
en el CSS sin trucos del padding-hack:

```css
/* CardTile.module.css */
.imageWrapper {
  aspect-ratio: 59 / 86;  /* ancho / alto — proporción real de carta YGO */
  background: var(--surface-panel);
  overflow: hidden;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;  /* La imagen llena el espacio manteniendo su proporción */
}
```

**Antes de `aspect-ratio` existir** se hacía con el "padding-top hack":

```css
/* El viejo truco feo (ya no necesario) */
.imageWrapper {
  position: relative;
  padding-top: 145.76%;  /* (86/59) * 100 = 145.76% */
}
.image {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
}
```

`aspect-ratio` es CSS moderno (Chrome 88+, Firefox 89+, Safari 15+). Se usa directo.

---

### 3.8 Lazy loading de imágenes

```tsx
// CardTile.tsx
<img
  src={image.imageUrlSmall}
  alt={card.name}
  loading="lazy"           // ← esta línea
  onError={() => setImgError(true)}
/>
```

**`loading="lazy"`** es un atributo HTML nativo que le dice al browser:
"No cargues esta imagen hasta que esté cerca del viewport del usuario."

**Sin lazy loading:** Al cargar la página de catálogo (20 cartas), el browser
hace 20 requests de imágenes simultáneos, aunque el usuario solo ve las primeras
5. Desperdicio de ancho de banda.

**Con lazy loading:** Solo carga las imágenes que el usuario puede ver (o que
están a punto de ver al hacer scroll). Las del fondo se cargan a medida que baja.

**El fallback con `onError`:**

```tsx
const [imgError, setImgError] = useState(false)

// Si la imagen falla de cargar (URL rota, timeout, etc.)
{image && !imgError ? (
  <img onError={() => setImgError(true)} ... />
) : (
  <div className={styles.imageFallback}>⬡</div>  // ← muestra ícono en vez de imagen rota
)}
```

Sin este handler, el browser mostraría el ícono de imagen rota nativo del OS,
que se ve horrible y rompe el diseño.

---

### 3.9 El algoritmo de paginación con ellipsis

La paginación muestra algo como `1 … 4 5 6 … 20` en vez de los 20 números.
Esto es el "ellipsis pattern".

```typescript
// Pagination.tsx
function buildPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  // ↑ Si hay 7 o menos páginas, mostrar todas sin ellipsis

  const pages: (number | '...')[] = [1]
  // ↑ Siempre mostrar la primera página

  if (current > 3) pages.push('...')
  // ↑ Si estás en página 4 o más, hay un hueco entre página 1 y el rango actual

  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p)
  }
  // ↑ Mostrar la página actual y sus vecinas inmediatas (current-1, current, current+1)

  if (current < total - 2) pages.push('...')
  // ↑ Si no estás cerca del final, hay otro hueco

  pages.push(total)
  // ↑ Siempre mostrar la última página

  return pages
}
```

**Visualización del resultado:**

```
Página 1:    [1] 2 3 … 14149
Página 5:    1 … 4 [5] 6 … 14149
Página 100:  1 … 99 [100] 101 … 14149
Página 14149: 1 … 14147 14148 [14149]
```

El usuario siempre puede ir a la primera, la última, o a las adyacentes de la actual.

---

### 3.10 Estados de UI: Loading / Error / Empty

Todo componente que trae datos del servidor debe manejar **tres estados** además
del happy path:

```
isLoading → true  : Datos no llegaron aún         → Mostrar spinner
isError   → true  : Falló el request              → Mostrar error + retry
data.length === 0 : Llegó pero sin resultados     → Mostrar empty state
data.length > 0   : Todo bien                     → Mostrar contenido
```

**En el proyecto (`CatalogPage.tsx`):**

```tsx
{isLoading ? (
  <LoadingSpinner label="Cargando catálogo..." />

) : isError ? (
  <ErrorMessage
    title={errorStatus === 503 ? 'Servicio no disponible' : 'Error al cargar'}
    message={errorStatus === 503
      ? 'La API está caída. Intentá en unos segundos.'
      : 'Revisá tu conexión.'}
    onRetry={() => void refetch()}
  />

) : data?.cards.length === 0 ? (
  <EmptyState description={`Sin resultados para "${searchTerm}"`} />

) : data ? (
  <>
    <CardGrid cards={data.cards} isFetching={isFetching} />
    <Pagination ... />
  </>
) : null}
```

**El error 503 tiene mensaje diferente al genérico.** ¿Por qué?

- `503` significa que el servicio está temporalmente caído → el usuario debe esperar
- Otro error → puede ser problema de red del usuario o bug nuestro

Dar mensajes específicos mejora enormemente la experiencia. Un usuario que ve
"Servicio no disponible, intentá en unos segundos" sabe qué hacer.
Un usuario que ve "Error desconocido" no sabe nada.

---

### 3.11 Barrel exports con `index.ts`

El `index.ts` de cada feature actúa como una "puerta principal":

```typescript
// features/catalog/index.ts
export { CardGrid }       from './components/CardGrid'
export { CardTile }       from './components/CardTile'
export { Pagination }     from './components/Pagination'
export { SearchBar }      from './components/SearchBar'
export { useCards }       from './hooks/useCards'
export type { Card, ... } from './types'
```

**¿Para qué sirve?**

```typescript
// SIN barrel export (import verboso):
import { CardGrid }  from '@/features/catalog/components/CardGrid'
import { useCards }  from '@/features/catalog/hooks/useCards'
import type { Card } from '@/features/catalog/types'

// CON barrel export (import limpio):
import { CardGrid, useCards, type Card } from '@/features/catalog'
```

Si en el futuro movés `CardGrid` a otra subcarpeta, solo actualizas el `index.ts`.
Todos los imports del proyecto siguen funcionando sin cambios.

---

## 4. Definition of Done Sprint 2 ✓

- [x] Buscador por nombre con debounce (400ms) funcionando
- [x] Paginación con `page` y `limit=20` respetando máximo 100
- [x] Cards se renderizan con imagen lazy, nombre, tipo, atributo y stats
- [x] Estado loading: spinner con ring cian
- [x] Estado error: mensaje diferenciado por 503, botón retry
- [x] Estado vacío: mensaje claro cuando no hay resultados
- [x] Paginación muestra "X–Y de N cartas"
- [x] Grilla se atenúa al cambiar de página (sin parpadeos)
- [x] CORS resuelto con proxy de Vite
- [x] Lint ✓, TypeCheck ✓, Build ✓

**Definition of Done del sprint:** "Se puede buscar 'Dark Magician' y navegar páginas" ✓

---

## 5. Próximo: Sprint 3 (2026-03-09)

**Filtros avanzados y UX gamer:**
- Filtros: `attribute`, `level`, `atk`, `def`, `race`, `archetype`
- Persistir filtros y búsqueda en la URL (`?name=dark&attribute=DARK&page=2`)
- Vista alterna: galería / lista
- Debounce también en filtros numéricos
- Filter bar persistente tipo consola (sin modales)
