import type { Card } from '../types'
import { CardListItem } from './CardListItem'
import styles from './CardListView.module.css'

interface Props {
  cards: Card[]
  isFetching?: boolean
}

export function CardListView({ cards, isFetching = false }: Props) {
  return (
    <div className={[styles.list, isFetching ? styles.dimmed : ''].join(' ')}>
      {cards.map(card => (
        <CardListItem key={card.id} card={card} />
      ))}
    </div>
  )
}
