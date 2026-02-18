import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import type { Card } from '../../catalog/types'
import type { CardCondition, CardEdition } from '../types'
import { useInventory } from '../context'
import styles from './AddToInventoryModal.module.css'

interface Props {
  card: Card
  onClose: () => void
}

const CONDITIONS: CardCondition[] = [
  'mint',
  'near-mint',
  'excellent',
  'good',
  'light-played',
  'played',
  'poor',
]

const EDITIONS: CardEdition[] = ['first', 'unlimited']

export function AddToInventoryModal({ card, onClose }: Props) {
  const { t } = useTranslation()
  const { getItem, addOrUpdate, remove } = useInventory()
  const existing = getItem(card.id)

  const [quantity, setQuantity] = useState(existing?.quantity ?? 1)
  const [condition, setCondition] = useState<CardCondition>(existing?.condition ?? 'near-mint')
  const [edition, setEdition] = useState<CardEdition>(existing?.edition ?? 'unlimited')

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
    addOrUpdate({ card, quantity, condition, edition })
    onClose()
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
              <button type="button" className={styles.stepBtn} onClick={decrement} disabled={quantity <= 1}>
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

          {/* Condition */}
          <div className={styles.field}>
            <label className={styles.label}>{t('inventory.modal.condition')}</label>
            <select
              className={styles.select}
              value={condition}
              onChange={e => setCondition(e.target.value as CardCondition)}
            >
              {CONDITIONS.map(c => (
                <option key={c} value={c}>
                  {t(`inventory.conditions.${c}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Edition */}
          <div className={styles.field}>
            <label className={styles.label}>{t('inventory.modal.edition')}</label>
            <select
              className={styles.select}
              value={edition}
              onChange={e => setEdition(e.target.value as CardEdition)}
            >
              {EDITIONS.map(ed => (
                <option key={ed} value={ed}>
                  {t(`inventory.editions.${ed}`)}
                </option>
              ))}
            </select>
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
