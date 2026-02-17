import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { HomePage } from './pages/HomePage'
import { CatalogPage } from './pages/CatalogPage'
import { PlaceholderPage } from './pages/PlaceholderPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'catalog',
        element: <CatalogPage />,
      },
      {
        path: 'inventory',
        element: <PlaceholderPage titleKey="router.inventory" sprint="Sprint 4" />,
      },
      {
        path: 'decks',
        element: <PlaceholderPage titleKey="router.deckBuilder" sprint="Sprint 5" />,
      },
      {
        path: 'missing',
        element: <PlaceholderPage titleKey="router.missingCards" sprint="Sprint 6" />,
      },
    ],
  },
])
