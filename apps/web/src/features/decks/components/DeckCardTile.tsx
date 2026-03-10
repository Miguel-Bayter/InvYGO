import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import type { DeckEntry } from '../types'
import { MAX_COPIES_PER_DECK, DECK_LIMITS } from '../types'
import { useDecks } from '../context'
import { useInventory } from '../../inventory/context'
import { useToast } from '../../../components/ui/ToastProvider'
import { CardTooltip } from '../../catalog/components/CardTooltip'
import styles from './DeckCardTile.module.css'

const HOVER_DELAY_MS = 500
const CLOSE_DELAY_MS = 300

interface Props {
  entry: DeckEntry
  deckId: string
}

export function DeckCardTile({ entry, deckId }: Props) {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const { updateQuantity, removeCard, decks } = useDecks()
  const { getItem } = useInventory()
  const [imgError, setImgError] = useState(false)

  const inventoryQty = getItem(entry.cardId)?.quantity ?? 0
  const missingQty = Math.max(0, entry.quantity - inventoryQty)

  const deck = decks[deckId]
  const sectionTotal = deck
    ? deck.entries.filter(e => e.section === entry.section).reduce((sum, e) => sum + e.quantity, 0)
    : 0
  const totalCopiesAllSections = deck
    ? deck.entries.filter(e => e.cardId === entry.cardId).reduce((sum, e) => sum + e.quantity, 0)
    : entry.quantity
  const atMaxCopies = totalCopiesAllSections >= MAX_COPIES_PER_DECK
  const sectionFull = sectionTotal >= DECK_LIMITS[entry.section].max
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
  const articleRef = useRef<HTMLElement>(null)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const image = entry.card.images[0]

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
    cancelClose()
    hoverTimerRef.current = setTimeout(() => {
      if (articleRef.current) setAnchorRect(articleRef.current.getBoundingClientRect())
    }, HOVER_DELAY_MS)
  }

  function handleMouseLeave(e: React.MouseEvent) {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
    const related = e.relatedTarget as Element | null
    if (related?.closest('[data-card-tooltip]')) return
    scheduleClose()
  }

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  function handleDecrement(e: React.MouseEvent) {
    e.stopPropagation()
    updateQuantity(deckId, entry.cardId, entry.section, entry.quantity - 1)
  }

  function handleIncrement(e: React.MouseEvent) {
    e.stopPropagation()
    if (atMaxCopies) {
      showToast(
        t('decks.toast.maxCopies', { name: entry.card.name, count: entry.quantity }),
        'warning'
      )
      return
    }
    if (sectionFull) {
      showToast(
        t('decks.toast.sectionFull', {
          section: t(`decks.section.${entry.section}`),
          current: sectionTotal,
          max: DECK_LIMITS[entry.section].max,
        }),
        'error'
      )
      return
    }
    updateQuantity(deckId, entry.cardId, entry.section, entry.quantity + 1)
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation()
    removeCard(deckId, entry.cardId, entry.section)
  }

  return (
    <>
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
              alt={entry.card.name}
              className={styles.image}
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={styles.imageFallback}>
              <span>⬡</span>
            </div>
          )}

          <span className={styles.badge}>{entry.quantity}</span>

          {missingQty > 0 && (
            <span
              className={`${styles.missingBadge} ${missingQty === entry.quantity ? styles.missingBadgeCritical : ''}`}
            >
              −{missingQty}
            </span>
          )}

          {/* Hover actions */}
          <div className={styles.actions}>
            <div className={styles.topRow}>
              <button
                className={`${styles.actionBtn} ${styles.removeBtn}`}
                onClick={handleRemove}
                title={t('decks.entry.remove')}
              >
                ✕
              </button>
            </div>
            <div className={styles.bottomRow}>
              <button
                className={`${styles.actionBtn} ${styles.decrementBtn}`}
                onClick={handleDecrement}
                disabled={entry.quantity <= 1}
                title={t('decks.entry.decrease')}
              >
                −
              </button>
              <button
                className={`${styles.actionBtn} ${styles.incrementBtn}`}
                onClick={handleIncrement}
                title={t('decks.entry.increase')}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </article>

      {anchorRect &&
        createPortal(
          <CardTooltip
            card={entry.card}
            anchorRect={anchorRect}
            onClose={() => setAnchorRect(null)}
            onCancelClose={cancelClose}
          />,
          document.body
        )}
    </>
  )
}
