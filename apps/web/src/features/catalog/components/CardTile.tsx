import { useState } from 'react'
import type { Card } from '../types'
import styles from './CardTile.module.css'

interface Props {
  card: Card
}

const FRAME_LABEL: Record<string, string> = {
  normal: 'NOR',
  effect: 'EFT',
  ritual: 'RIT',
  fusion: 'FUS',
  synchro: 'SYN',
  xyz: 'XYZ',
  link: 'LNK',
  spell: 'SPC',
  trap: 'TRP',
  token: 'TKN',
  skill: 'SKL',
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

export function CardTile({ card }: Props) {
  const [imgError, setImgError] = useState(false)
  const image = card.images[0]
  const frameLabel = FRAME_LABEL[card.frameType] ?? card.frameType.slice(0, 3).toUpperCase()
  const attrColor = card.attribute ? (ATTRIBUTE_COLOR[card.attribute] ?? '#7a8fa0') : undefined

  return (
    <article className={styles.tile}>
      <div className={styles.imageWrapper}>
        {image && !imgError ? (
          <img
            src={image.imageUrlSmall}
            alt={card.name}
            className={styles.image}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={styles.imageFallback}>
            <span>⬡</span>
          </div>
        )}
        <span className={styles.frameBadge}>{frameLabel}</span>
        {card.attribute && (
          <span className={styles.attrBadge} style={{ background: attrColor }}>
            {card.attribute}
          </span>
        )}
      </div>

      <div className={styles.info}>
        <p className={styles.name} title={card.name}>
          {card.name}
        </p>
        <p className={styles.type}>{card.race}</p>

        {card.level !== undefined && (
          <div className={styles.stats}>
            <span>Lv.{card.level}</span>
            {card.attack !== undefined && <span>ATK {card.attack}</span>}
            {card.defense !== undefined && <span>DEF {card.defense}</span>}
          </div>
        )}
      </div>
    </article>
  )
}
