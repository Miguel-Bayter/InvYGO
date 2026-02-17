import type { Card } from '../types'
import { CardTile } from './CardTile'
import styles from './CardGrid.module.css'

interface Props {
  cards: Card[]
  isFetching?: boolean
}

export function CardGrid({ cards, isFetching = false }: Props) {
  return (
    <div className={[styles.grid, isFetching ? styles.dimmed : ''].join(' ')}>
      {cards.map(card => (
        <CardTile key={card.id} card={card} />
      ))}
    </div>
  )
}
