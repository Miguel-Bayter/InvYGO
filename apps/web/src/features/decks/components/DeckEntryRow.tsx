import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import type { DeckEntry } from '../types'
import { MAX_COPIES_PER_DECK, DECK_LIMITS } from '../types'
import { useDecks } from '../context'
import { useInventory } from '../../inventory/context'
import { useToast } from '../../../components/ui/ToastProvider'
import { CardTooltip } from '../../catalog/components/CardTooltip'
import styles from './DeckEntryRow.module.css'

const HOVER_DELAY_MS = 300
const CLOSE_DELAY_MS = 200

interface Props {
  entry: DeckEntry
  deckId: string
}

export function DeckEntryRow({ entry, deckId }: Props) {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const { updateQuantity, removeCard, decks } = useDecks()
  const { getItem } = useInventory()

  const inventoryItem = getItem(entry.cardId)
  const owned = inventoryItem?.quantity ?? 0
  const missing = Math.max(0, entry.quantity - owned)
  const image = entry.card.images[0]

  const deck = decks[deckId]
  const sectionTotal = deck
    ? deck.entries.filter(e => e.section === entry.section).reduce((sum, e) => sum + e.quantity, 0)
    : 0
  const atMaxCopies = entry.quantity >= MAX_COPIES_PER_DECK
  const sectionFull = sectionTotal >= DECK_LIMITS[entry.section].max

  const rowRef = useRef<HTMLDivElement>(null)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      if (rowRef.current) setAnchorRect(rowRef.current.getBoundingClientRect())
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

  function decrement() {
    updateQuantity(deckId, entry.cardId, entry.section, entry.quantity - 1)
  }

  function increment() {
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

  return (
    <>
      <div className={styles.row}>
        {/* Hover zone: image + info only — stepper/remove stay always interactive */}
        <div
          ref={rowRef}
          className={styles.hoverZone}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {image ? (
            <img
              src={image.imageUrlSmall}
              alt={entry.card.name}
              className={styles.thumb}
              loading="lazy"
            />
          ) : (
            <div className={styles.thumbFallback}>⬡</div>
          )}

          <div className={styles.info}>
            <div className={styles.name}>{entry.card.name}</div>
            <div className={styles.meta}>
              {entry.card.type}
              {missing > 0 && (
                <span className={styles.missingBadge}>
                  {' '}
                  · {t('decks.entry.missing', { count: missing })}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.stepper}>
          <button
            className={styles.stepBtn}
            onClick={decrement}
            disabled={entry.quantity <= 1}
            title={t('decks.entry.decrease')}
          >
            −
          </button>
          <span className={styles.qty}>{entry.quantity}</span>
          <button className={styles.stepBtn} onClick={increment} title={t('decks.entry.increase')}>
            +
          </button>
        </div>

        <button
          className={styles.removeBtn}
          onClick={() => removeCard(deckId, entry.cardId, entry.section)}
          title={t('decks.entry.remove')}
        >
          ✕
        </button>
      </div>
      {anchorRect &&
        createPortal(
          <CardTooltip
            card={entry.card}
            anchorRect={anchorRect}
            preferRight
            onClose={() => setAnchorRect(null)}
            onCancelClose={cancelClose}
          />,
          document.body
        )}
    </>
  )
}
