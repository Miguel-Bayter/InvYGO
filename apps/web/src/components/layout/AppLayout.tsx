import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { InventoryProvider } from '../../features/inventory/context'
import { CarouselProvider } from '../../features/carousel/context'
import { DecksProvider } from '../../features/decks/context'
import { ToastProvider } from '../ui/ToastProvider'
import styles from './AppLayout.module.css'

export function AppLayout() {
  return (
    <ToastProvider>
      <InventoryProvider>
        <CarouselProvider>
          <DecksProvider>
            <div className={styles.root}>
              <Navbar />
              <main className={styles.main}>
                <Outlet />
              </main>
            </div>
          </DecksProvider>
        </CarouselProvider>
      </InventoryProvider>
    </ToastProvider>
  )
}
