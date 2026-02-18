import type { Card } from '../types'
import { CardTile } from './CardTile'

interface Props {
  cards: Card[]
  isFetching?: boolean
}

export function CardGrid({ cards, isFetching = false }: Props) {
  return (
    <div
      className={[
        'grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5',
        'gap-3 sm:gap-4 transition-opacity duration-[250ms]',
        isFetching ? 'opacity-50 pointer-events-none' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {cards.map(card => (
        <CardTile key={card.id} card={card} />
      ))}
    </div>
  )
}
