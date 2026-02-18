import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Card } from '../types'
import { ATTRIBUTE_COLOR } from '../constants'
import { CardTooltip } from './CardTooltip'
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

const HOVER_DELAY_MS = 300

export function CardTile({ card }: Props) {
  const [imgError, setImgError] = useState(false)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
  const articleRef = useRef<HTMLElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const image = card.images[0]
  const frameLabel = FRAME_LABEL[card.frameType] ?? card.frameType.slice(0, 3).toUpperCase()
  const attrColor = card.attribute ? (ATTRIBUTE_COLOR[card.attribute] ?? '#7a8fa0') : undefined

  function handleMouseEnter() {
    timerRef.current = setTimeout(() => {
      if (articleRef.current) {
        setAnchorRect(articleRef.current.getBoundingClientRect())
      }
    }, HOVER_DELAY_MS)
  }

  function handleMouseLeave() {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setAnchorRect(null)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <article
      ref={articleRef}
      className={styles.tile}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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

      {anchorRect &&
        createPortal(<CardTooltip card={card} anchorRect={anchorRect} />, document.body)}
    </article>
  )
}
