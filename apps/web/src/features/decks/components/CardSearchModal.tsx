import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDecks } from '../context'
import type { DeckSection } from '../types'
import { DECK_LIMITS, isExtraDeckCard } from '../types'
import { fetchCards } from '../../catalog/api'
import type { Card } from '../../catalog/types'
import { useToast } from '../../../components/ui/ToastProvider'
import styles from './CardSearchModal.module.css'

interface Props {
  deckId: string
  onClose: () => void
}

const SECTIONS: DeckSection[] = ['main', 'extra', 'side']
const SEARCH_DEBOUNCE_MS = 350
const RESULTS_LIMIT = 15

export function CardSearchModal({ deckId, onClose }: Props) {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const { addCard, decks } = useDecks()
  const [query, setQuery] = useState('')
  const [section, setSection] = useState<DeckSection>('main')
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const deck = decks[deckId]

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setCards([])
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    try {
      const result = await fetchCards(
        { fuzzyName: q.trim(), limit: RESULTS_LIMIT, page: 1 },
        controller.signal
      )
      setCards(result.cards)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setCards([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query), SEARCH_DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, search])

  function handleAdd(card: Card) {
    const extra = isExtraDeckCard(card)
    let targetSection = section
    if (extra && section === 'main') targetSection = 'extra'
    else if (!extra && section === 'extra') targetSection = 'main'
    if (targetSection !== section) setSection(targetSection)

    if (targetSection !== section) {
      const key = extra ? 'decks.search.extraAutoRedirect' : 'decks.search.mainAutoRedirect'
      showToast(t(key), 'info')
    }

    const result = addCard(deckId, card, targetSection)
    if (result === 'maxCopies') {
      const copies = deck
        ? deck.entries.filter(e => e.cardId === card.id).reduce((sum, e) => sum + e.quantity, 0)
        : 0
      showToast(t('decks.toast.maxCopies', { name: card.name, count: copies }), 'warning')
    } else if (result === 'sectionFull') {
      const sectionTotal = deck
        ? deck.entries
            .filter(e => e.section === targetSection)
            .reduce((sum, e) => sum + e.quantity, 0)
        : 0
      showToast(
        t('decks.toast.sectionFull', {
          section: t(`decks.section.${targetSection}`),
          current: sectionTotal,
          max: DECK_LIMITS[targetSection].max,
        }),
        'error'
      )
    }
  }

  function getTotalCopies(cardId: string): number {
    if (!deck) return 0
    return deck.entries.filter(e => e.cardId === cardId).reduce((sum, e) => sum + e.quantity, 0)
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <input
            ref={inputRef}
            className={styles.searchInput}
            type="text"
            placeholder={t('decks.search.placeholder')}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <select
            className={styles.sectionSelect}
            value={section}
            onChange={e => setSection(e.target.value as DeckSection)}
          >
            {SECTIONS.map(s => {
              const sTotal = deck
                ? deck.entries.filter(e => e.section === s).reduce((sum, e) => sum + e.quantity, 0)
                : 0
              const sMax = DECK_LIMITS[s].max
              return (
                <option key={s} value={s}>
                  {t(`decks.section.${s}`)} ({sTotal}/{sMax})
                </option>
              )
            })}
          </select>
          <button className={styles.closeBtn} onClick={onClose} aria-label={t('ui.close')}>
            ✕
          </button>
        </div>

        <div className={styles.results}>
          {loading ? (
            <div className={styles.status}>{t('ui.loading')}</div>
          ) : !query.trim() ? (
            <div className={styles.status}>{t('decks.search.typeToSearch')}</div>
          ) : cards.length === 0 ? (
            <div className={styles.status}>{t('ui.empty.withSearch')}</div>
          ) : (
            cards.map(card => {
              const copies = getTotalCopies(card.id)
              const maxed = copies >= 3
              const isExtra = isExtraDeckCard(card)
              const image = card.images[0]

              return (
                <div key={card.id} className={styles.resultRow}>
                  {image ? (
                    <img
                      src={image.imageUrlSmall}
                      alt={card.name}
                      className={styles.thumb}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.thumbFallback}>⬡</div>
                  )}
                  <div className={styles.cardInfo}>
                    <div className={styles.cardName}>{card.name}</div>
                    <div className={styles.cardMeta}>
                      {card.type}
                      {isExtra && (
                        <span className={styles.extraBadge}>{t('decks.search.extraDeck')}</span>
                      )}
                    </div>
                  </div>
                  <button
                    className={`${styles.addBtn} ${maxed ? styles.addBtnDisabled : ''}`}
                    onClick={() => handleAdd(card)}
                    disabled={maxed}
                    title={maxed ? t('decks.search.maxCopies') : t('decks.search.add')}
                  >
                    {maxed ? `×${copies}` : `+ ${copies > 0 ? copies : ''}`}
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
