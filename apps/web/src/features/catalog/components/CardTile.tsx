import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Card } from '../types'
import { CardTooltip } from './CardTooltip'
import { AddToInventoryModal } from '../../inventory/components/AddToInventoryModal'
import { useInventory } from '../../inventory/context'
import styles from './CardTile.module.css'

interface Props {
  card: Card
}

const HOVER_DELAY_MS = 500
const CLOSE_DELAY_MS = 300
// On touch-only devices the tooltip is driven by handleTouchStart (instant).
// Mouse events fire spuriously after touch and must be ignored.
const IS_TOUCH_DEVICE = window.matchMedia('(hover: none)').matches

export function CardTile({ card }: Props) {
  const [imgError, setImgError] = useState(false)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
  const [showModal, setShowModal] = useState(false)
  const articleRef = useRef<HTMLElement>(null)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wasTouched = useRef(false)
  const { getItem } = useInventory()

  const image = card.images[0]
  const inInventory = !!getItem(card.id)

  function cancelClose() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  function scheduleClose() {
    cancelClose()
    closeTimerRef.current = setTimeout(() => setAnchorRect(null), CLOSE_DELAY_MS)
  }

  function handleMouseEnter() {
    if (IS_TOUCH_DEVICE) return
    cancelClose()
    hoverTimerRef.current = setTimeout(() => {
      if (articleRef.current) {
        setAnchorRect(articleRef.current.getBoundingClientRect())
      }
    }, HOVER_DELAY_MS)
  }

  function handleMouseLeave(e: React.MouseEvent) {
    if (IS_TOUCH_DEVICE) return
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
    const related = e.relatedTarget as Element | null
    if (related?.closest('[data-card-tooltip]')) return
    scheduleClose()
  }

  function handleTouchStart() {
    wasTouched.current = true
    cancelClose()
    if (articleRef.current) {
      setAnchorRect(articleRef.current.getBoundingClientRect())
    }
  }

  function handleAddClick(e: React.MouseEvent | React.TouchEvent) {
    e.stopPropagation()
    setAnchorRect(null)
    cancelClose()
    setShowModal(true)
  }

  // Close tooltip when tapping outside on mobile
  useEffect(() => {
    if (!anchorRect) return
    function onDocTouch(e: TouchEvent) {
      const target = e.target as Element
      if (target.closest('[data-card-tooltip]')) return
      if (articleRef.current?.contains(target)) return
      setAnchorRect(null)
    }
    document.addEventListener('touchstart', onDocTouch, { passive: true })
    return () => document.removeEventListener('touchstart', onDocTouch)
  }, [anchorRect])

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  return (
    <>
      <article
        ref={articleRef}
        className={styles.tile}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
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
          <button
            className={`${styles.addBtn} ${inInventory ? styles.addBtnActive : ''}`}
            onClick={handleAddClick}
            onTouchStart={e => { e.stopPropagation(); handleAddClick(e) }}
            aria-label="Add to inventory"
          >
            {inInventory ? '✓' : '+'}
          </button>
        </div>

        {anchorRect &&
          createPortal(
            <CardTooltip
              card={card}
              anchorRect={anchorRect}
              onClose={() => setAnchorRect(null)}
              onCancelClose={cancelClose}
            />,
            document.body
          )}
      </article>

      {showModal && (
        <AddToInventoryModal card={card} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}
