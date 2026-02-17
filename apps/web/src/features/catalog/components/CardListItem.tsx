import { useState } from 'react'
import type { Card } from '../types'
import styles from './CardListItem.module.css'

interface Props {
  card: Card
}

const ATTRIBUTE_COLOR: Record<string, string> = {
  DARK: '#9b59b6',
  LIGHT: '#f1c40f',
  EARTH: '#a67c52',
  WATER: '#3498db',
  FIRE: '#e74c3c',
  WIND: '#2ecc71',
  DIVINE: '#e67e22',
}

export function CardListItem({ card }: Props) {
  const [imgError, setImgError] = useState(false)
  const image = card.images[0]
  const attrColor = card.attribute ? (ATTRIBUTE_COLOR[card.attribute] ?? '#7a8fa0') : undefined

  return (
    <article className={styles.item}>
      {/* Thumbnail */}
      <div className={styles.thumb}>
        {image && !imgError ? (
          <img
            src={image.imageUrlSmall}
            alt={card.name}
            className={styles.img}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={styles.imgFallback}>⬡</div>
        )}
      </div>

      {/* Name + type */}
      <div className={styles.main}>
        <p className={styles.name}>{card.name}</p>
        <p className={styles.type}>
          {card.type} — {card.race}
          {card.archetype && <span className={styles.archetype}> · {card.archetype}</span>}
        </p>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        {card.level !== undefined && <span className={styles.stat}>Lv.{card.level}</span>}
        {card.attack !== undefined && <span className={styles.stat}>ATK {card.attack}</span>}
        {card.defense !== undefined && <span className={styles.stat}>DEF {card.defense}</span>}
      </div>

      {/* Attribute badge */}
      {card.attribute && (
        <span className={styles.attr} style={{ background: attrColor }}>
          {card.attribute}
        </span>
      )}
    </article>
  )
}
