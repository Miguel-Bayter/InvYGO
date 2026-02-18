import type { InventoryItem } from '../types'
import { InventoryCardTile } from './InventoryCardTile'

interface Props {
  items: InventoryItem[]
}

export function InventoryGrid({ items }: Props) {
  return (
    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
      {items.map(item => (
        <InventoryCardTile key={item.cardId} item={item} />
      ))}
    </div>
  )
}
