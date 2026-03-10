import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import type { Card } from '../../catalog/types'
import { useInventory } from '../context'
import { useCarousel } from '../../carousel/context'
import { CAROUSEL_MAX_ITEMS } from '../../carousel/defaults'
import { useDecks } from '../../decks/context'
import type { DeckSection } from '../../decks/types'
import { isExtraDeckCard, DECK_LIMITS } from '../../decks/types'
import { useToast } from '../../../components/ui/ToastProvider'
import styles from './AddToInventoryModal.module.css'

const DECK_SECTIONS: DeckSection[] = ['main', 'extra', 'side']

interface Props {
  card: Card
  onClose: () => void
}

export function AddToInventoryModal({ card, onClose }: Props) {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const { getItem, addOrUpdate, remove } = useInventory()
  const { state, addCard, hasCard } = useCarousel()
  const { decks, addCard: addCardToDeck } = useDecks()
  const existing = getItem(card.id)
  const inCarousel = hasCard(card.id)
  const carouselIsFull = state.cards.length >= CAROUSEL_MAX_ITEMS

  const deckList = Object.values(decks)
  const [quantity, setQuantity] = useState(existing?.quantity ?? 1)
  const [selectedDeckId, setSelectedDeckId] = useState<string>(() => deckList[0]?.id ?? '')
  const cardIsExtra = isExtraDeckCard(card)
  const [selectedSection, setSelectedSection] = useState<DeckSection>(
    cardIsExtra ? 'extra' : 'main'
  )
  const overlayRef = useRef<HTMLDivElement>(null)
  const image = card.images[0]

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    addOrUpdate({ card, quantity })
    onClose()
  }

  function handleAddToCarousel() {
    addCard({ card })
  }

  function handleAddToDeck() {
    if (!selectedDeckId) return
    const deck = decks[selectedDeckId]
    const result = addCardToDeck(selectedDeckId, card, selectedSection, quantity)
    if (result === 'ok') {
      showToast(t('decks.toast.added', { name: card.name, deck: deck?.name ?? '' }), 'success')
    } else if (result === 'maxCopies') {
      const copies = deck
        ? deck.entries.filter(e => e.cardId === card.id).reduce((sum, e) => sum + e.quantity, 0)
        : 0
      showToast(t('decks.toast.maxCopies', { name: card.name, count: copies }), 'warning')
    } else if (result === 'sectionFull') {
      const sectionTotal = deck
        ? deck.entries
            .filter(e => e.section === selectedSection)
            .reduce((sum, e) => sum + e.quantity, 0)
        : 0
      showToast(
        t('decks.toast.sectionFull', {
          section: t(`decks.section.${selectedSection}`),
          current: sectionTotal,
          max: DECK_LIMITS[selectedSection].max,
        }),
        'error'
      )
    }
  }

  function handleRemove() {
    remove(card.id)
    onClose()
  }

  function decrement() {
    setQuantity(q => Math.max(1, q - 1))
  }

  function increment() {
    setQuantity(q => q + 1)
  }

  return createPortal(
    <div
      ref={overlayRef}
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={t('inventory.modal.add')}
    >
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {existing ? t('inventory.modal.update') : t('inventory.modal.add')}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Card preview */}
        <div className={styles.preview}>
          {image ? (
            <img src={image.imageUrlSmall} alt={card.name} className={styles.cardImage} />
          ) : (
            <div className={styles.cardImageFallback}>⬡</div>
          )}
          <p className={styles.cardName}>{card.name}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Quantity */}
          <div className={styles.field}>
            <label className={styles.label}>{t('inventory.modal.quantity')}</label>
            <div className={styles.stepper}>
              <button
                type="button"
                className={styles.stepBtn}
                onClick={decrement}
                disabled={quantity <= 1}
              >
                −
              </button>
              <input
                type="number"
                className={styles.quantityInput}
                value={quantity}
                min={1}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <button type="button" className={styles.stepBtn} onClick={increment}>
                +
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t('inventory.modal.carousel')}</label>
            <button
              type="button"
              className={`${styles.carouselBtn} ${inCarousel ? styles.carouselBtnActive : ''}`}
              onClick={handleAddToCarousel}
              disabled={inCarousel || carouselIsFull}
            >
              {inCarousel
                ? t('inventory.modal.inCarousel')
                : carouselIsFull
                  ? t('inventory.modal.carouselFull')
                  : t('inventory.modal.addToCarousel')}
            </button>
          </div>

          {/* Add to Deck */}
          <div className={styles.field}>
            <label className={styles.label}>{t('inventory.modal.addToDeck')}</label>
            {deckList.length === 0 ? (
              <p className={styles.deckHint}>{t('inventory.modal.noDecks')}</p>
            ) : (
              <div className={styles.deckRow}>
                <select
                  className={styles.select}
                  value={selectedDeckId}
                  onChange={e => {
                    setSelectedDeckId(e.target.value)
                  }}
                >
                  {deckList.map(deck => (
                    <option key={deck.id} value={deck.id}>
                      {deck.name}
                    </option>
                  ))}
                </select>
                <select
                  className={`${styles.select} ${styles.selectSection}`}
                  value={selectedSection}
                  onChange={e => {
                    setSelectedSection(e.target.value as DeckSection)
                  }}
                >
                  {DECK_SECTIONS.map(s => {
                    const disabled =
                      (s === 'main' && cardIsExtra) || (s === 'extra' && !cardIsExtra)
                    return (
                      <option key={s} value={s} disabled={disabled}>
                        {t(`decks.section.${s}`)}
                        {disabled
                          ? ` (${t(cardIsExtra ? 'decks.search.extraOnly' : 'decks.search.mainOnly')})`
                          : ''}
                      </option>
                    )
                  })}
                </select>
                <button type="button" className={styles.deckAddBtn} onClick={handleAddToDeck}>
                  +
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            {existing && (
              <button type="button" className={styles.removeBtn} onClick={handleRemove}>
                {t('inventory.modal.remove')}
              </button>
            )}
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              {t('inventory.modal.cancel')}
            </button>
            <button type="submit" className={styles.submitBtn}>
              {existing ? t('inventory.modal.update') : t('inventory.modal.add')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
