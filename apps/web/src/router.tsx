import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { PageFallback } from './components/ui/PageFallback'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })))
const CatalogPage = lazy(() =>
  import('./pages/CatalogPage').then(m => ({ default: m.CatalogPage }))
)
const InventoryPage = lazy(() =>
  import('./pages/InventoryPage').then(m => ({ default: m.InventoryPage }))
)
const DecksPage = lazy(() => import('./pages/DecksPage').then(m => ({ default: m.DecksPage })))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: (
      <ErrorBoundary>
        <PageFallback />
      </ErrorBoundary>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageFallback />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'catalog',
        element: (
          <Suspense fallback={<PageFallback />}>
            <CatalogPage />
          </Suspense>
        ),
      },
      {
        path: 'inventory',
        element: (
          <Suspense fallback={<PageFallback />}>
            <InventoryPage />
          </Suspense>
        ),
      },
      {
        path: 'decks',
        element: (
          <Suspense fallback={<PageFallback />}>
            <DecksPage />
          </Suspense>
        ),
      },
    ],
  },
])
