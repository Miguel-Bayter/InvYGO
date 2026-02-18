# Sprint 1 - Fundación Frontend ✓ COMPLETADO

**Período:** 2026-02-17
**Estado:** Completado y verificado (lint ✓, typecheck ✓, build ✓)

---

## 1. Qué se hizo

### Estructura de archivos creada

```
InventoryYGO/
├── package.json                        ← Monorepo root con workspaces
├── .gitignore
├── Docs/
└── apps/
    └── web/
        ├── package.json                ← App con scripts: dev, build, lint, typecheck
        ├── vite.config.ts              ← Vite + alias @/ → src/
        ├── tsconfig.app.json           ← TS strict + paths @/*
        ├── eslint.config.js            ← ESLint + Prettier integrados
        ├── .prettierrc                 ← Reglas de formato
        ├── .env                        ← VITE_YGO_API_BASE_URL
        ├── .env.example                ← Template público para otros devs
        └── src/
            ├── main.tsx                ← Entry point: QueryClient + Router
            ├── router.tsx              ← Rutas: /, /catalog, /inventory, /decks, /missing
            ├── lib/
            │   ├── http.ts             ← Cliente axios + interceptores 400/503
            │   └── queryClient.ts      ← TanStack Query config (cache, retry)
            ├── styles/
            │   ├── tokens.css          ← Variables CSS: paleta HUD gamer
            │   └── global.css          ← Reset + scrollbar
            ├── components/layout/
            │   ├── Navbar.tsx          ← Nav sticky con NavLink activos
            │   ├── Navbar.module.css
            │   ├── AppLayout.tsx       ← Layout con <Outlet />
            │   └── AppLayout.module.css
            ├── pages/
            │   ├── HomePage.tsx        ← Dashboard: 4 status cards HUD
            │   ├── HomePage.module.css
            │   ├── PlaceholderPage.tsx ← Página temporal para rutas futuras
            │   └── PlaceholderPage.module.css
            └── features/               ← Estructura lista para sprints 2-6
                ├── catalog/
                ├── inventory/
                ├── decks/
                └── missing-cards/
```

### Dependencias instaladas

**Producción:**
| Paquete | Versión | Para qué sirve |
|---|---|---|
| `react` + `react-dom` | ^19 | La librería UI base |
| `react-router-dom` | ^7 | Navegación entre páginas |
| `@tanstack/react-query` | ^5 | Cache y manejo de requests HTTP |
| `axios` | ^1 | Cliente HTTP con interceptores |
| `zustand` | ^5 | Estado global (se usará en sprint 4+) |

**Desarrollo:**
| Paquete | Para qué sirve |
|---|---|
| `vite` + `@vitejs/plugin-react` | Build tool y HMR |
| `typescript` | Tipos estáticos |
| `eslint` + plugins | Detección de bugs en código |
| `prettier` | Formateo automático |
| `@tanstack/react-query-devtools` | Panel debug de queries en dev |

---

## 2. Cómo probarlo

```bash
# Entrar a la app
cd apps/web

# 1. TypeScript — debe salir SIN output (silencio = éxito)
npm run typecheck

# 2. Lint — debe salir SIN errores
npm run lint

# 3. Build de producción — debe decir "✓ built in Xs"
npm run build

# 4. Servidor de desarrollo — abrir http://localhost:5173
npm run dev
```

**En el navegador, verificar:**
- `/` → Pantalla de inicio con logo **InvYgo** en cian, fondo oscuro navy, 4 status cards
- `/catalog` → Texto "Catálogo de Cartas / Sprint 2"
- `/inventory` → Texto "Mi Inventario / Sprint 4"
- `/decks` → Texto "Deck Builder / Sprint 5"
- `/missing` → Texto "Cartas Faltantes / Sprint 6"
- El navbar se queda fijo arriba en todas las rutas
- El link activo del navbar se ilumina en cian

---

## 3. Guía educativa para el estudiante

> Este apartado explica **qué es cada tecnología, por qué la usamos y cómo funciona**, con ejemplos reales del proyecto.

---

### 3.1 Monorepo y npm Workspaces

#### ¿Qué es?

Un **monorepo** es tener múltiples proyectos dentro de un mismo repositorio git. En lugar de tener:

```
/github/invygo-frontend    ← repo separado
/github/invygo-backend     ← repo separado
/github/invygo-shared      ← repo separado
```

Tenés todo junto:

```
/github/InventoryYGO       ← un solo repo
    apps/web               ← frontend
    apps/api               ← backend (sprint futuro)
    packages/shared        ← código compartido
```

**Analogía:** Es como un edificio de oficinas. Cada empresa (app) tiene su piso, pero comparten estacionamiento (node_modules), recepción (package.json raíz) y electricidad (herramientas de CI/CD). Si fueran edificios separados, pagarías todo por duplicado.

#### ¿Cómo funciona en el proyecto?

```json
// package.json raíz
{
  "name": "invygo",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "npm run dev --workspace=apps/web"
  }
}
```

Cuando corrés `npm run dev` desde la raíz, npm sabe que tiene que entrar a `apps/web` y correr el script `dev` de ese workspace. Solo tenés que correr comandos desde un lugar.

---

### 3.2 Vite — el build tool

#### ¿Qué es y por qué reemplazó a Create React App?

**Create React App (CRA)** era la herramienta oficial para iniciar proyectos React. El problema: antes de que veas algo en el navegador, CRA tiene que **empaquetar todo tu código** en uno o varios archivos JavaScript enormes. En proyectos grandes esto tardaba 30-60 segundos cada vez que iniciabas el servidor.

**Vite** hace lo opuesto: en desarrollo, sirve cada archivo JavaScript tal como está (usando ES Modules nativos del navegador) y solo lo procesa cuando el navegador lo pide. ¿Resultado?

| Métrica | Create React App | Vite |
|---|---|---|
| Arranque del servidor | 10-30 segundos | 300-800ms |
| Guardas un archivo (HMR) | 2-5 segundos | < 100ms |
| Build de producción | 2-3 minutos | 10-30 segundos |

#### Hot Module Replacement (HMR)

Cuando guardás un archivo, Vite:
1. Detecta qué archivo cambió
2. Envía **solo ese archivo** al navegador via WebSocket
3. React actualiza **solo el componente afectado**, sin recargar la página entera
4. Tu estado (datos en pantalla) se mantiene

**El `vite.config.ts` del proyecto:**

```typescript
import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],        // Plugin que habilita JSX y HMR de React
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),  // @/ es un atajo para src/
    },
  },
})
```

El alias `@/` permite escribir:

```typescript
import { queryClient } from '@/lib/queryClient'
// En vez de:
import { queryClient } from '../../lib/queryClient'  // Horrible con carpetas anidadas
```

---

### 3.3 TypeScript Strict Mode

#### ¿Qué es?

TypeScript puede ser "permisivo" o "estricto". En modo estricto, TypeScript actúa como un inspector exigente que te para antes de que rompas algo en producción.

**Analogía:** Conducir sin cinturón vs. con cinturón. Podés ir igual, pero si algo sale mal, las consecuencias son muy diferentes.

#### Las flags del `tsconfig.app.json` explicadas

```json
{
  "compilerOptions": {
    "strict": true,
    // ↑ Activa todo el grupo de checks estrictos de una vez

    "noUnusedLocals": true,
    // ↑ Error si declarás una variable y nunca la usás
    // ❌ const data = fetchCards()  <- nunca se lee 'data'

    "noUnusedParameters": true,
    // ↑ Error si un parámetro de función nunca se usa
    // ❌ function add(a: number, b: number) { return a }  <- 'b' no se usa

    "noFallthroughCasesInSwitch": true,
    // ↑ Error si un case de switch cae al siguiente sin break/return
    // ❌ case 404:
    //      console.log('not found')
    //      // <- falta break, cae al case 500!

    "noUncheckedSideEffectImports": true,
    // ↑ Error si importás algo solo por efectos secundarios sin usar su valor

    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
    // ↑ Habilita el alias @/ para importaciones limpias
  }
}
```

#### Ejemplo de lo que strict te salva

Sin strict, este código compila sin problemas:

```typescript
function getCardPrice(card) {          // 'card' tiene tipo 'any' implícito
  return card.prcies.cardmarket        // typo: 'prcies' en vez de 'prices'
}
// -> Explota en runtime: TypeError: Cannot read properties of undefined
```

Con strict:

```typescript
function getCardPrice(card: Card) {    // OBLIGADO a tipar
  return card.prcies.cardmarket        // ERROR en compilación: 'prcies' no existe en Card
}
// -> Atrapado ANTES de llegar al navegador
```

---

### 3.4 TanStack Query (React Query) v5

#### ¿Qué problema resuelve?

Sin TanStack Query, para traer datos de una API en React tenés que manejar a mano:
- Estado de carga (`isLoading`)
- Estado de error (`error`)
- Los datos en sí (`data`)
- Cuándo volver a pedir los datos
- No pedir los mismos datos dos veces
- Cancelar requests cuando el usuario navega

Con TanStack Query, todo eso viene gratis.

#### Los tres conceptos clave

```typescript
// lib/queryClient.ts — configuración global del proyecto
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 minutos
      // ↑ "Datos frescos" por 5 min. Si el usuario navega y vuelve
      //   antes de 5 min, NO hace un nuevo request. Usa el cache.
      //   Después de 5 min, los datos son "stale" (viejos) y al
      //   usarlos de nuevo, hace un refetch en segundo plano.

      gcTime: 1000 * 60 * 10,     // 10 minutos
      // ↑ Si nadie usa esos datos por 10 minutos, se borran del cache.
      //   "gc" = garbage collection (limpieza de memoria)

      retry: (failureCount, error) => {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status
          if (status === 400 || status === 404) return false
          // ↑ 400 = tu request está mal formado (reintentar no ayuda)
          //   404 = la carta no existe (reintentar no ayuda)
        }
        return failureCount < 2
        // ↑ Para otros errores (503, timeout): reintenta hasta 2 veces
      },

      refetchOnWindowFocus: false,
      // ↑ Por defecto React Query refetch cuando el usuario vuelve a la
      //   pestaña del browser. Lo desactivamos para no sobrecargar la API.
    },
  },
})
```

**Timeline visual de cómo funciona el cache:**

```
00:00  Usuario busca "Dark Magician"
       → Request a la API → Respuesta guardada en cache
       → staleTime empieza (5 min)

02:30  Usuario navega a /inventory y vuelve a /catalog
       → staleTime no expiró → NO hace request → Muestra cache

05:01  staleTime expiró → Datos marcados como "stale"
       → Usuario hace otra búsqueda → Muestra cache INMEDIATAMENTE
       → Mientras tanto, hace request en segundo plano
       → Cuando llega respuesta, actualiza silenciosamente

15:00  Nadie usó el cache de "Dark Magician" por 10 min
       → gcTime expiró → Cache borrado de memoria
       → Próxima búsqueda = request fresco
```

**Uso en un componente (Sprint 2 va a tener esto):**

```typescript
function CatalogPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['cards', { name: 'Dark Magician' }],  // Clave única del cache
    queryFn: () => ygoApiClient.get('/cards?name=Dark+Magician').then(r => r.data),
  })

  if (isLoading) return <div>Cargando...</div>
  if (error)     return <div>Error: {error.message}</div>
  return <CardGrid cards={data} />
}
```

---

### 3.5 React Router v7 — createBrowserRouter + Outlet

#### ¿Qué es y cómo funciona?

React es una Single Page Application (SPA): hay un solo `index.html`. React Router simula que hay múltiples páginas cambiando qué componente se muestra según la URL, sin recargar la página.

**`createBrowserRouter`** define el mapa de URLs del sistema:

```typescript
// router.tsx
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,     // <- Padre: siempre se renderiza
    children: [                 // <- Hijos: se renderizan DENTRO del padre
      { index: true, element: <HomePage /> },        // URL: /
      { path: 'catalog',   element: <CatalogPage /> },   // URL: /catalog
      { path: 'inventory', element: <InventoryPage /> },  // URL: /inventory
      { path: 'decks',     element: <DecksPage /> },      // URL: /decks
    ],
  },
])
```

**`<Outlet />`** es el hueco donde se inserta el hijo activo:

```typescript
// AppLayout.tsx
export function AppLayout() {
  return (
    <div>
      <Navbar />      {/* Siempre visible, en todas las páginas */}
      <main>
        <Outlet />    {/* Aquí aparece HomePage, CatalogPage, etc. según la URL */}
      </main>
    </div>
  )
}
```

**Visualización:**

```
URL: /inventory
┌─────────────────────────────┐
│  <AppLayout>                │
│  ┌───────────────────────┐  │
│  │  <Navbar />           │  │  <- Siempre presente
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │  <Outlet />           │  │  <- Aquí va <InventoryPage />
│  │  = <InventoryPage />  │  │
│  └───────────────────────┘  │
└─────────────────────────────┘

Cuando navegás a /catalog:
│  <Navbar />           │  <- Sigue igual, NO recarga
│  <CatalogPage />      │  <- Esto cambia
```

**`NavLink`** vs `Link`: NavLink agrega una clase `active` automáticamente al link de la página actual, lo que permite estilar el link activo en el navbar:

```typescript
<NavLink
  to="/catalog"
  className={({ isActive }) => isActive ? styles.linkActive : styles.link}
>
  Catálogo
</NavLink>
```

---

### 3.6 Zustand — Estado global simple

#### ¿Qué es el estado global?

Hay datos que muchos componentes necesitan al mismo tiempo: ¿qué usuario está logueado? ¿Qué cartas tiene en el inventario? Pasar eso de componente en componente (`props`) se vuelve inmanejable en proyectos grandes. El estado global lo pone en un lugar central.

#### ¿Por qué Zustand y no Redux?

Redux fue el estándar por años, pero requiere mucho código para hacer cosas simples:

```typescript
// Redux: para guardar UN dato necesitás 3 archivos y 40+ líneas
// action.ts → reducer.ts → store.ts → useDispatch → useSelector

// Zustand: todo en un lugar, en 10 líneas
import { create } from 'zustand'

const useInventoryStore = create((set) => ({
  cards: [],
  addCard: (card) => set(state => ({ cards: [...state.cards, card] })),
  removeCard: (id) => set(state => ({ cards: state.cards.filter(c => c.id !== id) })),
}))

// Uso en cualquier componente:
function InventoryPage() {
  const { cards, addCard } = useInventoryStore()
  // ...
}
```

Zustand se va a usar en Sprint 4 para el inventario y en Sprint 5 para los decks.

---

### 3.7 ESLint vs Prettier — trabajos distintos

**Confusión común:** la gente cree que son lo mismo. No lo son.

| | ESLint | Prettier |
|---|---|---|
| **Trabajo** | Encuentra bugs y patrones malos | Formatea el código |
| **Pregunta** | ¿Tu código hace lo correcto? | ¿Tu código se ve bien? |
| **Ejemplo de error** | Variable declarada y nunca usada | String con comillas dobles en vez de simples |
| **¿Puede arreglar bugs?** | Algunos | Nunca (no entiende lógica) |

**Ejemplo concreto:**

```typescript
// Este código tiene AMBOS problemas:
const userData = fetchUser(id)   // <- ESLint: variable no usada (BUG)
const x=42;const y=99            // <- Prettier: mal formateado (FEALDAD)
```

```typescript
// Después de `npm run format` (Prettier):
const userData = fetchUser(id)   // <- Bug sigue ahí, pero formateado
const x = 42
const y = 99

// Después de `npm run lint` (ESLint):
// error: 'userData' is assigned a value but never used
```

**Integración en el proyecto:** `eslint-config-prettier` desactiva las reglas de ESLint que pueden chocar con Prettier, para que no se peleen entre sí.

**Workflow correcto:**

```bash
npm run format    # 1. Que Prettier formatee todo
npm run lint      # 2. Que ESLint revise la lógica
npm run typecheck # 3. Que TypeScript verifique los tipos
npm run build     # 4. Que Vite compile todo
```

Si los 4 pasan sin errores, el código está listo.

---

### 3.8 CSS Custom Properties — Design Tokens

#### ¿Qué son?

Las CSS custom properties (variables CSS) permiten definir valores una sola vez y reutilizarlos en todo el proyecto. Los **design tokens** son un sistema organizado de esas variables para colores, espaciados, tipografías, etc.

**Sin tokens (el caos que se instala solo):**

```css
/* Componente A */
.card { background: #1f2c3a; padding: 16px; color: #f0f6ff; }

/* Componente B */
.panel { background: #1f2c3a; padding: 16px; color: #f0f6ff; }

/* Componente C */
.modal { background: #1f2c3a; padding: 16px; color: #f0f6ff; }

/* El cliente quiere cambiar el fondo a #2a3d50 → tenés que buscar #1f2c3a
   en 80 archivos y reemplazarlo uno por uno */
```

**Con tokens (el proyecto real):**

```css
/* styles/tokens.css — se define UNA VEZ */
:root {
  --color-navy-deep: #061a2b;
  --color-cyan-hud: #13b8ff;
  --surface-panel: #1f2c3a;
  --color-white: #f0f6ff;
  --space-4: 16px;
  --glow-cyan: 0 0 12px rgba(19, 184, 255, 0.35);
}

/* Componente A */
.card { background: var(--surface-panel); padding: var(--space-4); color: var(--color-white); }

/* Componente B */
.panel { background: var(--surface-panel); padding: var(--space-4); color: var(--color-white); }

/* Componente C */
.modal { background: var(--surface-panel); padding: var(--space-4); color: var(--color-white); }

/* El cliente quiere cambiar el fondo → cambias UNA línea en tokens.css
   y se actualiza en TODOS los componentes automáticamente */
```

**La paleta HUD gamer del proyecto:**

```css
:root {
  --color-navy-deep: #061a2b;    /* Fondo oscuro base */
  --color-blue-electric: #0b3a5c; /* Paneles */
  --color-cyan-hud: #13b8ff;     /* Acentos y elementos activos */
  --color-steel-dark: #1f2c3a;   /* Superficies de cards */
  --color-amber-alert: #ffb020;  /* Alertas y advertencias */
  --color-red-warning: #ff5d5d;  /* Errores críticos */
}
```

---

### 3.9 Axios — cliente HTTP con interceptores

#### Fetch vs Axios

`fetch` es nativo del browser, gratuito, pero verboso y con quirks. `axios` es una librería de 15KB que simplifica el 90% de los casos.

**El mismo request en ambos:**

```typescript
// Con fetch (nativo):
const res = await fetch('https://api.ygo.com/v1/cards?name=Blue-Eyes', {
  headers: {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,   // Hay que agregarlo manualmente
  },
})
if (!res.ok) throw new Error(`HTTP ${res.status}`)  // Fetch no falla en 4xx/5xx!
const data = await res.json()             // Hay que deserializar manualmente

// Con axios (del proyecto):
const data = await ygoApiClient.get('/cards', { params: { name: 'Blue-Eyes' } })
// ↑ Token ya está en el header (interceptor), JSON ya deserializado, error ya manejado
```

**Los interceptores del proyecto:**

```typescript
// lib/http.ts
ygoApiClient.interceptors.response.use(
  response => response,      // Si la respuesta es exitosa, pásala tal cual
  error => {
    // Este bloque se ejecuta AUTOMÁTICAMENTE en CUALQUIER error
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      if (status === 503) {
        // API externa caída — mostrar mensaje de fallback
        console.warn('[YGO API] Service unavailable. Using fallback if available.')
      } else if (status === 400) {
        // Request mal formado — loguear para debug
        console.warn('[YGO API] Bad request:', error.response?.data)
      }
    }
    return Promise.reject(error)  // Sigue propagando el error para que el componente lo maneje
  }
)
```

**Analogía del interceptor:** Es el guardia de seguridad en la puerta. Cada paquete que entra o sale del edificio (requests/responses) pasa por él. El guardia tiene reglas: si el paquete dice "503", escribe en el libro de registros y llama al equipo de fallback. El emisor del paquete no tiene que preocuparse por eso, el guardia lo maneja solo.

---

### 3.10 Estructura por Features

#### ¿Por qué no por tipo de archivo?

La estructura "por tipo" parece lógica al principio:

```
src/
├── components/    ← todos los componentes juntos
├── hooks/         ← todos los hooks juntos
├── types/         ← todos los tipos juntos
└── services/      ← todos los servicios juntos
```

El problema: cuando trabajás en "Cartas del Catálogo", tus archivos están repartidos en 4 carpetas. Para entender un feature tenés que saltar entre directorios constantemente.

**Estructura por features (la del proyecto):**

```
src/features/
├── catalog/       ← TODO lo de catálogo junto
│   ├── components/
│   ├── hooks/
│   ├── types.ts
│   └── api.ts
├── inventory/     ← TODO lo de inventario junto
├── decks/         ← TODO lo de decks junto
└── missing-cards/ ← TODO lo de faltantes junto
```

**Regla mental:** Si eliminás la carpeta `features/catalog/`, ¿el resto del proyecto debería seguir compilando? Sí → bien aislado. No → el feature está mal encapsulado.

**El patrón `index.ts` para exportaciones limpias:**

```typescript
// features/catalog/index.ts
export { CardGrid } from './components/CardGrid'
export { CardDetail } from './components/CardDetail'
export { useCardSearch } from './hooks/useCardSearch'
export type { Card, CardFilter } from './types'

// Uso desde otro módulo:
import { CardGrid, useCardSearch, type Card } from '@/features/catalog'
// Un solo import, saben exactamente de dónde viene todo
```

---

## 4. Definition of Done Sprint 1 ✓

- [x] Build local sin errores (`✓ built in 3.29s`)
- [x] TypeScript check en verde (0 errores)
- [x] Lint en verde (0 errores, 0 warnings)
- [x] App corre en `localhost:5173`
- [x] Navegación entre las 5 rutas funciona
- [x] Navbar activo se ilumina en la ruta actual
- [x] Variables de entorno configuradas

---

## 5. Próximo: Sprint 2 (2026-03-02)

**Catálogo de cartas v1:**
- Buscador por nombre con debounce
- Paginación con `page` y `limit`
- Renderizado de cards: imagen, nombre, tipo, atributo
- Estados: loading, empty, error (con fallback 503)
- Filtros básicos integrados en URL
