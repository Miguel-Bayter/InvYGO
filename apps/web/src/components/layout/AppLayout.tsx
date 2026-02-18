import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { InventoryProvider } from '../../features/inventory/context'
import styles from './AppLayout.module.css'

export function AppLayout() {
  return (
    <InventoryProvider>
      <div className={styles.root}>
        <Navbar />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </InventoryProvider>
  )
}
