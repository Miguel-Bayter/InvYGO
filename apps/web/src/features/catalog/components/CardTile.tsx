import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Card } from '../types'
import { CardTooltip } from './CardTooltip'
import styles from './CardTile.module.css'

interface Props {
  card: Card
}

const HOVER_DELAY_MS = 300

export function CardTile({ card }: Props) {
  const [imgError, setImgError] = useState(false)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
  const articleRef = useRef<HTMLElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const image = card.images[0]

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
      </div>

      {anchorRect &&
        createPortal(
          <CardTooltip card={card} anchorRect={anchorRect} onClose={() => setAnchorRect(null)} />,
          document.body
        )}
    </article>
  )
}
