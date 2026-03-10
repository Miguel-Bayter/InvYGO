import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDecks } from '../context'
import type { Deck, DeckSection } from '../types'
import { DECK_LIMITS } from '../types'
import styles from './DeckSidebar.module.css'

export function DeckSidebar() {
  const { t } = useTranslation()
  const { decks, activeDeckId, createDeck, cloneDeck, deleteDeck, renameDeck, setActiveDeck } =
    useDecks()
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)

  const deckList = Object.values(decks).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

  useEffect(() => {
    if (renamingId) renameInputRef.current?.focus()
  }, [renamingId])

  function handleCreate() {
    createDeck(t('decks.sidebar.newDeckName'))
  }

  function handleRenameStart(deck: Deck) {
    setRenamingId(deck.id)
    setRenameValue(deck.name)
  }

  function handleRenameCommit(deckId: string) {
    if (renameValue.trim()) renameDeck(deckId, renameValue)
    setRenamingId(null)
  }

  function handleRenameKey(e: React.KeyboardEvent, deckId: string) {
    if (e.key === 'Enter') handleRenameCommit(deckId)
    if (e.key === 'Escape') setRenamingId(null)
  }

  function handleDeleteRequest(e: React.MouseEvent, deckId: string) {
    e.stopPropagation()
    setConfirmingDeleteId(deckId)
  }

  function handleDeleteConfirm(e: React.MouseEvent, deckId: string) {
    e.stopPropagation()
    deleteDeck(deckId)
    setConfirmingDeleteId(null)
  }

  function handleDeleteCancel(e: React.MouseEvent) {
    e.stopPropagation()
    setConfirmingDeleteId(null)
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.title}>{t('decks.sidebar.title')}</span>
        <button className={styles.newBtn} onClick={handleCreate}>
          + {t('decks.sidebar.new')}
        </button>
      </div>

      <div className={styles.list}>
        {deckList.length === 0 ? (
          <p className={styles.emptyHint}>{t('decks.sidebar.emptyHint')}</p>
        ) : (
          deckList.map(deck => {
            const totalCards = deck.entries.reduce((sum, e) => sum + e.quantity, 0)
            const isActive = deck.id === activeDeckId
            const isRenaming = renamingId === deck.id
            const sectionCounts = (['main', 'extra', 'side'] as DeckSection[]).reduce<
              Record<DeckSection, number>
            >(
              (acc, s) => {
                acc[s] = deck.entries
                  .filter(e => e.section === s)
                  .reduce((sum, e) => sum + e.quantity, 0)
                return acc
              },
              { main: 0, extra: 0, side: 0 }
            )
            const hasOverflow = (['main', 'extra', 'side'] as DeckSection[]).some(
              s => sectionCounts[s] > DECK_LIMITS[s].max
            )
            const isValid =
              !hasOverflow &&
              sectionCounts.main >= DECK_LIMITS.main.min &&
              sectionCounts.main <= DECK_LIMITS.main.max
            const countClass = hasOverflow
              ? styles.deckCountWarn
              : isValid
                ? styles.deckCountOk
                : styles.deckCount

            const isConfirmingDelete = confirmingDeleteId === deck.id

            return (
              <div
                key={deck.id}
                className={`${styles.deckItem} ${isActive ? styles.deckItemActive : ''} ${isConfirmingDelete ? styles.deckItemDanger : ''}`}
                onClick={() => !isRenaming && !isConfirmingDelete && setActiveDeck(deck.id)}
              >
                {isRenaming ? (
                  <input
                    ref={renameInputRef}
                    className={styles.renameInput}
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onBlur={() => handleRenameCommit(deck.id)}
                    onKeyDown={e => handleRenameKey(e, deck.id)}
                    onClick={e => e.stopPropagation()}
                  />
                ) : isConfirmingDelete ? (
                  <>
                    <span className={styles.confirmLabel}>{t('decks.sidebar.confirmDelete')}</span>
                    <div className={styles.deckActions}>
                      <button
                        className={`${styles.iconBtn} ${styles.iconBtnConfirm}`}
                        onClick={e => handleDeleteConfirm(e, deck.id)}
                        title={t('decks.sidebar.delete')}
                      >
                        ✓
                      </button>
                      <button
                        className={styles.iconBtn}
                        onClick={handleDeleteCancel}
                        title={t('decks.sidebar.cancelDelete')}
                      >
                        ✕
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className={styles.deckName}>{deck.name}</span>
                    <span className={countClass}>{totalCards}</span>
                    <div className={styles.deckActions}>
                      <button
                        className={styles.iconBtn}
                        onClick={e => {
                          e.stopPropagation()
                          handleRenameStart(deck)
                        }}
                        title={t('decks.sidebar.rename')}
                      >
                        ✎
                      </button>
                      <button
                        className={styles.iconBtn}
                        onClick={e => {
                          e.stopPropagation()
                          cloneDeck(deck.id)
                        }}
                        title={t('decks.sidebar.clone')}
                      >
                        ⎘
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                        onClick={e => handleDeleteRequest(e, deck.id)}
                        title={t('decks.sidebar.delete')}
                      >
                        ✕
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })
        )}
      </div>
    </aside>
  )
}
