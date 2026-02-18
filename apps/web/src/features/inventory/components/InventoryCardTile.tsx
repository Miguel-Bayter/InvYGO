import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { InventoryItem } from '../types'
import { CardTooltip } from '../../catalog/components/CardTooltip'
import { AddToInventoryModal } from './AddToInventoryModal'
import styles from './InventoryCardTile.module.css'

interface Props {
  item: InventoryItem
}

const HOVER_DELAY_MS = 300

export function InventoryCardTile({ item }: Props) {
  const [imgError, setImgError] = useState(false)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
  const [showModal, setShowModal] = useState(false)
  const articleRef = useRef<HTMLElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const image = item.card.images[0]

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
    const related = e.relatedTarget as Element | null
    if (related?.closest('[data-card-tooltip]')) return
    setAnchorRect(null)
  }

  function handleClick() {
    setAnchorRect(null)
    setShowModal(true)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <>
      <article
        ref={articleRef}
        className={styles.tile}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.imageWrapper}>
          {image && !imgError ? (
            <img
              src={image.imageUrlSmall}
              alt={item.card.name}
              className={styles.image}
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={styles.imageFallback}>
              <span>⬡</span>
            </div>
          )}
          <span className={styles.badge}>{item.quantity}</span>
        </div>

        {anchorRect &&
          createPortal(
            <CardTooltip
              card={item.card}
              anchorRect={anchorRect}
              onClose={() => setAnchorRect(null)}
            />,
            document.body
          )}
      </article>

      {showModal && (
        <AddToInventoryModal card={item.card} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}
