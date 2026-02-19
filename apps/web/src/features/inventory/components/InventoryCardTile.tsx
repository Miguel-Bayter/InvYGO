import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { InventoryItem } from '../types'
import { CardTooltip } from '../../catalog/components/CardTooltip'
import { AddToInventoryModal } from './AddToInventoryModal'
import styles from './InventoryCardTile.module.css'

interface Props {
  item: InventoryItem
}

const HOVER_DELAY_MS = 500
const CLOSE_DELAY_MS = 300
// On touch-only devices the tooltip is driven by handleTouchStart (instant).
// Mouse events fire spuriously after touch and must be ignored.
const IS_TOUCH_DEVICE = window.matchMedia('(hover: none)').matches

export function InventoryCardTile({ item }: Props) {
  const [imgError, setImgError] = useState(false)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
  const [showModal, setShowModal] = useState(false)
  const articleRef = useRef<HTMLElement>(null)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Tracks whether the last interaction was a touch (to prevent ghost click opening modal)
  const wasTouched = useRef(false)

  const image = item.card.images[0]

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

  // Touch on card body → show tooltip (badge tap is handled separately)
  function handleTouchStart() {
    wasTouched.current = true
    cancelClose()
    if (articleRef.current) {
      setAnchorRect(articleRef.current.getBoundingClientRect())
    }
  }

  // Desktop click → open edit modal; touch click is ignored (tooltip was shown instead)
  function handleClick() {
    if (wasTouched.current) {
      wasTouched.current = false
      return
    }
    setAnchorRect(null)
    cancelClose()
    setShowModal(true)
  }

  // Badge: dedicated touch/click target to open edit modal on mobile
  function handleBadgeTap(e: React.MouseEvent | React.TouchEvent) {
    e.stopPropagation()
    wasTouched.current = false
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
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
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
          {/* Badge: tap to open edit modal on mobile, click on desktop */}
          <span
            className={`${styles.badge} ${item.quantity > 99 ? styles.badgeWide : ''}`}
            onClick={handleBadgeTap}
            onTouchStart={e => { e.stopPropagation(); handleBadgeTap(e) }}
            role="button"
            aria-label="Edit inventory entry"
          >
            {item.quantity > 99 ? '+99' : item.quantity}
          </span>
        </div>

        {anchorRect &&
          createPortal(
            <CardTooltip
              card={item.card}
              anchorRect={anchorRect}
              onClose={() => setAnchorRect(null)}
              onCancelClose={cancelClose}
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
