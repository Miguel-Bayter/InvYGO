import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Deck, DeckSection } from '../types'
import { DECK_LIMITS } from '../types'
import { DeckEntryRow } from './DeckEntryRow'
import { DeckCardTile } from './DeckCardTile'
import { MissingCardsPanel } from './MissingCardsPanel'
import { CardSearchModal } from './CardSearchModal'
import { ViewToggle } from '../../catalog/components/ViewToggle'
import type { ViewMode } from '../../catalog/components/ViewToggle'
import styles from './DeckBuilderView.module.css'

const SECTIONS: DeckSection[] = ['main', 'extra', 'side']

interface Props {
  deck: Deck
}

export function DeckBuilderView({ deck }: Props) {
  const { t } = useTranslation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  const sectionCounts = SECTIONS.reduce<Record<DeckSection, number>>(
    (acc, s) => {
      acc[s] = deck.entries.filter(e => e.section === s).reduce((sum, e) => sum + e.quantity, 0)
      return acc
    },
    { main: 0, extra: 0, side: 0 }
  )

  function getCountColor(section: DeckSection): string {
    const count = sectionCounts[section]
    const { min, max } = DECK_LIMITS[section]
    if (count > max) return styles.sectionLimitWarn
    if (section === 'main') return count >= min ? styles.sectionLimitOk : ''
    return count > 0 ? styles.sectionLimitOk : ''
  }

  const deckStatus: 'valid' | 'incomplete' | 'invalid' = (() => {
    const hasOverflow = SECTIONS.some(s => sectionCounts[s] > DECK_LIMITS[s].max)
    if (hasOverflow) return 'invalid'
    const mainCount = sectionCounts['main']
    if (mainCount >= DECK_LIMITS['main'].min && mainCount <= DECK_LIMITS['main'].max) return 'valid'
    return 'incomplete'
  })()

  const statusClass =
    deckStatus === 'valid'
      ? styles.statusValid
      : deckStatus === 'invalid'
        ? styles.statusInvalid
        : styles.statusIncomplete

  return (
    <div className={styles.container}>
      <div className={styles.deckHeader}>
        <h2 className={styles.deckName}>{deck.name}</h2>
        <span className={`${styles.statusChip} ${statusClass}`}>
          {t(`decks.status.${deckStatus}`)}
        </span>
        <span className={styles.updatedAt}>
          {t('decks.builder.updated', {
            date: new Date(deck.updatedAt).toLocaleDateString(),
          })}
        </span>
        <ViewToggle view={viewMode} onViewChange={setViewMode} />
        <button className={styles.addCardBtn} onClick={() => setSearchOpen(true)}>
          + {t('decks.builder.addCard')}
        </button>
      </div>

      <div className={styles.layout}>
        <div className={styles.sections}>
          {viewMode === 'gallery'
            ? /* Gallery mode: flat grid grouped by section */
              SECTIONS.map(section => {
                const entries = deck.entries.filter(e => e.section === section)
                const count = sectionCounts[section]
                const { max } = DECK_LIMITS[section]
                return (
                  <div key={section} className={styles.sectionBlock}>
                    <div className={styles.sectionHeader}>
                      <span className={styles.sectionLabel}>{t(`decks.section.${section}`)}</span>
                      <span className={`${styles.sectionCount} ${getCountColor(section)}`}>
                        {count}/{max}
                      </span>
                    </div>
                    {entries.length === 0 ? (
                      <p className={styles.emptySection}>{t('decks.builder.emptySection')}</p>
                    ) : (
                      <div className={styles.tileGrid}>
                        {entries.map(entry => (
                          <DeckCardTile
                            key={`${entry.cardId}_${entry.section}`}
                            entry={entry}
                            deckId={deck.id}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            : /* List mode */
              SECTIONS.map(section => {
                const entries = deck.entries.filter(e => e.section === section)
                const count = sectionCounts[section]
                const { max } = DECK_LIMITS[section]
                return (
                  <div key={section} className={styles.sectionBlock}>
                    <div className={styles.sectionHeader}>
                      <span className={styles.sectionLabel}>{t(`decks.section.${section}`)}</span>
                      <span className={`${styles.sectionCount} ${getCountColor(section)}`}>
                        {count}/{max}
                      </span>
                    </div>
                    <div className={styles.entries}>
                      {entries.length === 0 ? (
                        <p className={styles.emptySection}>{t('decks.builder.emptySection')}</p>
                      ) : (
                        entries.map(entry => (
                          <DeckEntryRow
                            key={`${entry.cardId}_${entry.section}`}
                            entry={entry}
                            deckId={deck.id}
                          />
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
        </div>

        <MissingCardsPanel deck={deck} />
      </div>

      {searchOpen && <CardSearchModal deckId={deck.id} onClose={() => setSearchOpen(false)} />}
    </div>
  )
}
