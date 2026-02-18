# Sprint 4 — Inventario por Usuario v1
### Resumen técnico · Guía pedagógica · Cómo probarlo

---

## ✅ Qué se construyó

| Categoría | Detalle |
|-----------|---------|
| **Persistencia** | `localStorage` con key `invygo_inventory`. Sin backend. |
| **Estado compartido** | `InventoryContext` + `InventoryProvider` envuelven toda la app. |
| **Modelo de datos** | `InventoryItem` con `cardId`, snapshot de `Card`, `quantity`, `condition`, `edition`, `addedAt`, `updatedAt`. |
| **UI — Catálogo** | Botón `+` en hover sobre `CardTile` y `CardListItem`. Muestra `✓` si la carta ya está en inventario. |
| **UI — Modal** | `AddToInventoryModal`: stepper de cantidad, select de condición (7 valores), select de edición. Pre-rellena si la carta ya existe. Botón "Eliminar" disponible al editar. |
| **UI — Inventario** | `InventoryPage` con header stats, buscador local, `InventoryGrid` de 5 columnas. Badge rojo/dorado sobre la carta. Tooltip idéntico al catálogo. |
| **i18n** | Claves `inventory.*` en `en.json` y `es.json`. |
| **Responsive** | Tooltip se adapta a viewport estrecho. Lista oculta stats/attr en mobile. Grid escala 2→3→4→5 columnas. |

---

## 🗂 Archivos del Sprint

### Creados
```
features/inventory/
  types.ts                          → Tipos TypeScript
  storage.ts                        → Adapter localStorage
  context.tsx                       → Context + Provider + hook
  components/
    AddToInventoryModal.tsx         → Modal agregar/editar/eliminar
    AddToInventoryModal.module.css
    InventoryCardTile.tsx           → Tile con badge + tooltip + modal
    InventoryCardTile.module.css
    InventoryGrid.tsx               → Grid de tiles
    InventoryGrid.module.css
pages/
  InventoryPage.tsx                 → Página /inventory
  InventoryPage.module.css
```

### Modificados
```
features/inventory/index.ts         → Exports del feature
components/layout/AppLayout.tsx     → Envuelve con <InventoryProvider>
features/catalog/components/
  CardTile.tsx / .module.css        → Botón + en hover
  CardListItem.tsx / .module.css    → Botón + en fila + responsive
  CardTooltip.tsx / .module.css     → Responsive (getPosition dinámico)
router.tsx                          → /inventory → InventoryPage
i18n/locales/en.json + es.json      → Claves inventory.*
```

---

## 🧪 Cómo probarlo

```bash
cd apps/web
npm run dev
# Abre http://localhost:5173
```

**Checklist manual:**

1. **Catálogo galería** → hover sobre cualquier carta → aparece botón `+`
2. **Click `+`** → modal con qty=1, Near Mint, Unlimited
3. Cambiar qty a **2**, condición a **Good** → click **"Add to Inventory"**
4. Navegar a **`/inventory`** → carta con badge rojo `2`
5. Click en la carta → modal pre-relleno con qty=2, Good
6. Cambiar qty a **3** → click **"Update"** → badge cambia a `3`
7. Abrir modal de nuevo → click **"Remove"** → carta desaparece
8. **F5** (refresh) → inventario persiste (localStorage)
9. Buscador en `/inventory` → filtrar por nombre en tiempo real
10. Toggle idioma → todos los textos cambian (ES/EN)
11. **Vista lista** → botón `+` al extremo derecho de cada fila
12. **Responsive**: reducir ventana < 480px → lista simplificada, tooltip sin imagen

---

---

# 📚 Guía Pedagógica — Sprint 4 explicado desde cero

> **Para el estudiante:** Si llegás hasta acá y no entendiste algo, volvé al concepto anterior. No se puede construir el techo sin los cimientos.

---

## Concepto 1 — ¿Por qué localStorage y no una variable normal?

### El problema
Cuando React re-renderiza un componente, **las variables comunes se resetean**.

```javascript
// ❌ MAL — se pierde al recargar la página o cambiar de ruta
let miInventario = {}

function agregarCarta(carta) {
  miInventario[carta.id] = carta  // Solo vive en memoria RAM
}
```

### La solución: localStorage
`localStorage` es una mini-base de datos que el **browser** guarda en disco.
Sobrevive a recargas, cambios de pestaña, y cierres (salvo que el usuario la borre).

```javascript
// ✅ BIEN — persiste entre sesiones
localStorage.setItem('mi_clave', JSON.stringify({ dato: 'valor' }))
const datos = JSON.parse(localStorage.getItem('mi_clave') ?? '{}')
```

**Limitaciones de localStorage:**
| Característica | Valor |
|----------------|-------|
| Tamaño máximo | ~5 MB por dominio |
| Tipo de datos | Solo strings (por eso usamos `JSON.stringify/parse`) |
| Sincrónico | Bloquea el hilo principal (pero para datos pequeños no importa) |
| Compartido | Solo en ese browser, ese usuario |

### Cómo lo implementamos
```typescript
// storage.ts — el "adaptador"
const STORAGE_KEY = 'invygo_inventory'

export function loadInventory(): Inventory {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Inventory   // string → objeto
  } catch {
    return {}  // si el JSON está corrupto, empezamos de cero
  }
}

export function saveInventory(inventory: Inventory): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory))  // objeto → string
  } catch {
    // En modo privado, algunos browsers bloquean localStorage
  }
}
```

> **Por qué un archivo separado `storage.ts`?**
> Si en el futuro cambiamos a un backend real, solo tocamos este archivo.
> El resto de la app no sabe NI LE IMPORTA de dónde vienen los datos.
> Esto se llama **separación de responsabilidades** (Single Responsibility Principle).

---

## Concepto 2 — React Context: compartir estado sin prop drilling

### El problema que resuelve Context

Imaginate esta jerarquía de componentes:
```
AppLayout
  └── CatalogPage
        └── CardGrid
              └── CardTile
                    └── [necesita acceso al inventario]
```

Sin Context, tendrías que pasar el inventario como **prop** en cada nivel:
```tsx
// ❌ MAL — "prop drilling" (perforación de props)
<AppLayout inventory={inv} setInventory={setInv}>
  <CatalogPage inventory={inv} setInventory={setInv}>
    <CardGrid inventory={inv} setInventory={setInv}>
      <CardTile inventory={inv} setInventory={setInv} />
```

Esto es un desastre. Si agregás un nivel nuevo, tenés que actualizar todo.

### La solución: Context API

Context crea un "canal de datos" que cualquier componente puede **enchufarse**
sin importar cuán anidado esté.

```
InventoryProvider (datos viven acá)
  └── cualquier componente puede llamar useInventory() y acceder
```

### Cómo funciona por dentro

```typescript
// context.tsx — paso a paso

// 1. Crear el "molde" del context (qué datos va a proveer)
interface InventoryContextValue {
  inventory: Inventory
  addOrUpdate: (payload: AddOrUpdatePayload) => void
  remove: (cardId: string) => void
  getItem: (cardId: string) => InventoryItem | undefined
}

// 2. Crear el context (empieza vacío, null es el default)
const InventoryContext = createContext<InventoryContextValue | null>(null)

// 3. El Provider: componente que ENVUELVE a sus hijos y les da los datos
export function InventoryProvider({ children }: { children: ReactNode }) {
  // El estado vive ACÁ, una sola vez para toda la app
  const [inventory, setInventory] = useState<Inventory>(() => loadInventory())
  //                                                     ↑
  //              "lazy initializer": solo corre UNA VEZ al montar

  const addOrUpdate = useCallback((payload) => {
    setInventory(prev => {
      const next = { ...prev, [payload.card.id]: { /* nuevo item */ } }
      saveInventory(next)  // sincronizan localStorage cada vez
      return next
    })
  }, [])  // [] = se crea UNA SOLA VEZ, no cambia en cada render

  return (
    <InventoryContext.Provider value={{ inventory, addOrUpdate, remove, getItem }}>
      {children}  {/* todos los hijos tienen acceso */}
    </InventoryContext.Provider>
  )
}

// 4. El hook: la forma de CONSUMIR el context
export function useInventory() {
  const ctx = useContext(InventoryContext)
  if (!ctx) throw new Error('useInventory must be used inside <InventoryProvider>')
  //       ↑ guard: si alguien llama useInventory fuera del Provider, explota con mensaje claro
  return ctx
}
```

### Dónde se envuelve el Provider

```tsx
// AppLayout.tsx — envuelve TODA la app
export function AppLayout() {
  return (
    <InventoryProvider>  {/* ← todos los hijos tienen acceso */}
      <div className={styles.root}>
        <Navbar />
        <main>
          <Outlet />  {/* CatalogPage, InventoryPage, etc. */}
        </main>
      </div>
    </InventoryProvider>
  )
}
```

### Cómo se consume en cualquier componente

```tsx
// CardTile.tsx
const { getItem } = useInventory()
const inInventory = !!getItem(card.id)  // true/false

// InventoryPage.tsx
const { inventory } = useInventory()
const allItems = Object.values(inventory)
```

---

## Concepto 3 — TypeScript: tipos como contrato

Los tipos no son "decoración". Son un **contrato** que el compilador verifica.

```typescript
// types.ts — definimos exactamente qué forma tienen los datos

type CardCondition = 'mint' | 'near-mint' | 'excellent' | 'good' | 'light-played' | 'played' | 'poor'
//                   ↑ "union type" — solo estos 7 valores son válidos

type CardEdition = 'first' | 'unlimited'

interface InventoryItem {
  cardId:    string
  card:      Card      // snapshot de la carta (objeto completo)
  quantity:  number
  condition: CardCondition
  edition:   CardEdition
  addedAt:   string    // ISO 8601: "2024-01-15T10:30:00.000Z"
  updatedAt: string
}

type Inventory = Record<string, InventoryItem>
//               ↑ equivale a { [cardId: string]: InventoryItem }
//               Es un diccionario: buscar por cardId es O(1), instantáneo
```

**¿Por qué `Record<string, InventoryItem>` y no `InventoryItem[]`?**

```typescript
// Con array ❌ — para buscar una carta hay que recorrer todo
const item = inventory.find(i => i.cardId === cardId)  // O(n)

// Con Record ✅ — acceso directo por clave
const item = inventory[cardId]  // O(1), instantáneo
```

---

## Concepto 4 — createPortal: renderizar fuera del árbol DOM

### El problema
El modal y el tooltip necesitan estar **sobre todo** (z-index máximo, sin ser afectados por `overflow: hidden` de sus padres).

```
<article style="overflow: hidden">   ← el CardTile tiene overflow hidden
  <img />
  <Modal />  ← si renderizamos ACÁ, el modal queda cortado
</article>
```

### La solución: Portal

```tsx
import { createPortal } from 'react-dom'

// El componente vive en el árbol React de CardTile...
// ...pero el DOM se renderiza directamente en document.body
{showModal && createPortal(
  <AddToInventoryModal card={card} onClose={() => setShowModal(false)} />,
  document.body   // ← destino en el DOM real
)}
```

**React Tree vs DOM Tree:**
```
React Tree (lógica):           DOM Tree (lo que ve el browser):
CardTile                       <body>
  └── Portal(Modal)              <div id="root">
        → "vive" en CardTile       <article>  ← CardTile
          a nivel lógico             <img>
                                   </article>
                                 </div>
                                 <div class="modal">  ← Portal acá
                                   ...
                                 </div>
                               </body>
```

Los eventos (click, teclado) se propagan por el **árbol React**, no el DOM.
Por eso el `onClose` funciona aunque el modal esté en `document.body`.

---

## Concepto 5 — Hooks utilizados y por qué

### useState — estado local del componente

```tsx
const [showModal, setShowModal] = useState(false)
const [quantity, setQuantity] = useState(existing?.quantity ?? 1)
//                                        ↑ "nullish coalescing": si existing es null/undefined, usa 1
```

### useRef — referencia mutable que NO re-renderiza

```tsx
const articleRef = useRef<HTMLElement>(null)  // referencia al DOM node
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)  // timer del hover
```

`useRef` vs `useState`:
- `useState` → al cambiar, el componente **re-renderiza**
- `useRef` → al cambiar, el componente **NO re-renderiza** (ideal para timers, refs DOM)

### useEffect — efectos secundarios y limpieza

```tsx
useEffect(() => {
  // Se ejecuta cuando el componente se DESMONTA
  return () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    //                     ↑ limpia el timer para evitar memory leaks
  }
}, [])  // [] = solo al montar/desmontar
```

**¿Qué es un memory leak?**
Si no limpias el timer y el componente se desmonta, el timer sigue corriendo
y cuando expira intenta actualizar un componente que ya no existe → error.

### useCallback — memoriza funciones

```tsx
const addOrUpdate = useCallback((payload) => {
  setInventory(prev => { /* ... */ })
}, [])  // [] = la función se crea UNA SOLA VEZ
```

Sin `useCallback`, cada render crearía una nueva función → los hijos que
reciben esa función como prop se re-renderizarían innecesariamente.

### useMemo — memoriza valores calculados

```tsx
// InventoryPage.tsx
const filteredItems = useMemo(() => {
  if (!search.trim()) return allItems
  const q = search.toLowerCase()
  return allItems.filter(item => item.card.name.toLowerCase().includes(q))
}, [allItems, search])
// ↑ solo recalcula cuando allItems o search cambian
```

Sin `useMemo`, el filtro correría en CADA render aunque no cambie nada.

---

## Concepto 6 — CSS Modules y el badge responsivo

### ¿Por qué CSS Modules?

```css
/* En CSS global: */
.badge { color: red; }  /* Afecta a TODOS los elementos con clase .badge */

/* En CSS Module: */
.badge { color: red; }  /* Solo afecta al componente que importa este archivo */
/* Compila a: .InventoryCardTile_badge__x7k2d { color: red; } */
```

### El badge: posicionamiento absoluto dentro de relativo

```css
.imageWrapper {
  position: relative;  /* ← contenedor de referencia */
}

.badge {
  position: absolute;  /* ← se posiciona relativo al padre "relative" */
  bottom: 4px;
  left: 4px;
  /* Sin "position: relative" en el padre, se posicionaría respecto a la página */
}
```

### CSS custom properties (variables)

```css
/* tokens.css — definidas una vez */
:root {
  --color-cyan-hud: #13b8ff;
  --font-mono: 'JetBrains Mono', monospace;
  --space-4: 16px;
}

/* Usadas en cualquier archivo CSS */
.stat { color: var(--color-cyan-hud); }
```

Si el día de mañana querés cambiar el color principal de la app,
**solo tocás tokens.css** y cambia en todos lados automáticamente.

---

## Concepto 7 — Responsive Design: el tooltip

### El problema del tooltip en pantallas chicas

El tooltip tiene `width: 500px` fijo. En un teléfono de 375px de ancho,
el tooltip saldría de la pantalla.

### Solución en CSS: max-width

```css
.tooltip {
  width: 500px;              /* valor preferido en desktop */
  max-width: calc(100vw - 16px);  /* nunca más ancho que la pantalla */
}
```

`100vw` = 100% del viewport width. Así en mobile: `375px - 16px = 359px`.

### Solución en JS: getPosition dinámico

```typescript
function getPosition(rect, preferRight) {
  const maxW = window.innerWidth - 2 * EDGE_PAD   // espacio disponible
  const effectiveW = Math.min(TOOLTIP_W, maxW)    // el menor entre 500 y lo disponible

  if (effectiveW < TOOLTIP_W) {
    left = EDGE_PAD  // pantalla muy chica: pegado al borde izquierdo
  } else {
    // lógica normal de posicionamiento
  }

  return { left, top, width: effectiveW }  // width dinámico
}
```

### Media queries para el contenido

```css
/* Tablet: reducir alto del tooltip */
@media (max-width: 768px) {
  .tooltip { height: auto; max-height: 356px; }
}

/* Mobile: ocultar imagen de la carta para ahorrar espacio */
@media (max-width: 520px) {
  .imageCol { display: none; }
}
```

**Jerarquía de media queries (mobile-first vs desktop-first):**
```css
/* Desktop-first (nuestro caso): */
.grid { grid-template-columns: repeat(5, 1fr); }       /* default: 5 col */
@media (max-width: 1023px) { grid-template-columns: repeat(4, 1fr); }
@media (max-width: 767px)  { grid-template-columns: repeat(3, 1fr); }
@media (max-width: 479px)  { grid-template-columns: repeat(2, 1fr); }
```

---

## Concepto 8 — Patrón de arquitectura del feature

```
features/inventory/
  ├── types.ts        → ¿Qué forma tienen los datos?
  ├── storage.ts      → ¿Dónde se guardan?
  ├── context.tsx     → ¿Cómo se comparten en la app?
  └── components/     → ¿Cómo se muestran?
```

Este patrón se llama **Feature-Sliced Design** (simplificado).
Cada feature es una caja negra con su propia lógica, tipos y UI.

**Regla de dependencias:**
- `components/` puede importar de `context.tsx`, `types.ts`, `catalog/`
- `context.tsx` puede importar de `storage.ts`, `types.ts`
- `storage.ts` solo importa de `types.ts`
- `types.ts` no importa nada del proyecto

```
types.ts ← storage.ts ← context.tsx ← components/
                                  ↑
                            catalog/components (CardTooltip)
```

Si una flecha apuntara hacia arriba (ej: `types.ts` importando de `context.tsx`),
tendríamos una **dependencia circular** → bug difícil de detectar.

---

## Resumen mental del Sprint

```
Usuario hover CardTile
  → handleMouseEnter() → setTimeout 300ms → setAnchorRect(rect)
  → CardTooltip se renderiza via Portal en document.body
  → Usuario click botón "+"
  → handleAddClick() → setShowModal(true) → AddToInventoryModal se renderiza
  → Usuario configura qty/condición/edición → submit
  → addOrUpdate() en InventoryContext
  → setInventory(prev => ({ ...prev, [cardId]: newItem }))
  → saveInventory(next) → localStorage.setItem(...)
  → React re-renderiza: InventoryPage ve el item nuevo
  → Badge rojo con número aparece en /inventory
```

---

*Sprint 4 completado. Próximo: Sprint 5 — Deck Builder.*
