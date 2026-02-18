import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Card } from '../types'
import { ATTRIBUTE_COLOR } from '../constants'
import { CardTooltip } from './CardTooltip'
import styles from './CardListItem.module.css'

interface Props {
  card: Card
}

const HOVER_DELAY_MS = 300

export function CardListItem({ card }: Props) {
  const [imgError, setImgError] = useState(false)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
  const articleRef = useRef<HTMLElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const image = card.images[0]
  const attrColor = card.attribute ? (ATTRIBUTE_COLOR[card.attribute] ?? '#7a8fa0') : undefined

  function handleMouseEnter() {
    timerRef.current = setTimeout(() => {
      if (articleRef.current) {
        setAnchorRect(articleRef.current.getBoundingClientRect())
      }
    }, HOVER_DELAY_MS)
  }

  function handleMouseLeave(e: React.MouseEvent) {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    // Keep tooltip visible if mouse moved directly onto it
    const related = e.relatedTarget as Element | null
    if (related?.closest('[data-card-tooltip]')) return
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
      className={styles.item}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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

      {anchorRect &&
        createPortal(
          <CardTooltip
            card={card}
            anchorRect={anchorRect}
            preferRight
            onClose={() => setAnchorRect(null)}
          />,
          document.body
        )}
    </article>
  )
}
