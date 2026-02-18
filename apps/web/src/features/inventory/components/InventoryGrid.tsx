import type { InventoryItem } from '../types'
import { InventoryCardTile } from './InventoryCardTile'
import styles from './InventoryGrid.module.css'

interface Props {
  items: InventoryItem[]
}

export function InventoryGrid({ items }: Props) {
  return (
    <div className={styles.grid}>
      {items.map(item => (
        <InventoryCardTile key={item.cardId} item={item} />
      ))}
    </div>
  )
}
