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
import { useDeckImport } from '../hooks/useDeckImport'
import styles from './DeckBuilderView.module.css'

const SECTIONS: DeckSection[] = ['main', 'extra', 'side']

interface Props {
  deck: Deck
}

export function DeckBuilderView({ deck }: Props) {
  const { t } = useTranslation()
  const { importing, importRef, triggerImport, handleImportFile } = useDeckImport()
  const [searchOpen, setSearchOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  const safeName = deck.name.replace(/[^a-z0-9]/gi, '_')

  function triggerDownload(content: string, filename: string, mime: string) {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleExportJson() {
    const data = {
      name: deck.name,
      entries: deck.entries,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    }
    triggerDownload(JSON.stringify(data, null, 2), `${safeName}.json`, 'application/json')
  }

  function handleExportYdk() {
    const lines: string[] = ['#created by InvYGO', '#main']
    for (const entry of deck.entries.filter(e => e.section === 'main'))
      for (let i = 0; i < entry.quantity; i++) lines.push(entry.cardId)
    lines.push('#extra')
    for (const entry of deck.entries.filter(e => e.section === 'extra'))
      for (let i = 0; i < entry.quantity; i++) lines.push(entry.cardId)
    lines.push('!side')
    for (const entry of deck.entries.filter(e => e.section === 'side'))
      for (let i = 0; i < entry.quantity; i++) lines.push(entry.cardId)
    triggerDownload(lines.join('\n'), `${safeName}.ydk`, 'text/plain')
  }

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
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={handleExportJson}>
            ↓ {t('decks.builder.exportJson')}
          </button>
          <button className={styles.actionBtn} onClick={handleExportYdk}>
            ↓ {t('decks.builder.exportYdk')}
          </button>
          <button className={styles.actionBtn} onClick={triggerImport} disabled={importing}>
            {importing ? t('decks.builder.importing') : `↑ ${t('decks.builder.import')}`}
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".json,.ydk,text/plain"
            className={styles.importInput}
            onChange={handleImportFile}
          />
          <button className={styles.addCardBtn} onClick={() => setSearchOpen(true)}>
            + {t('decks.builder.addCard')}
          </button>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.sections}>
          {SECTIONS.map(section => {
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
                {viewMode === 'gallery' ? (
                  entries.length === 0 ? (
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
                  )
                ) : entries.length === 0 ? (
                  <p className={styles.emptySection}>{t('decks.builder.emptySection')}</p>
                ) : (
                  <div className={styles.entries}>
                    {entries.map(entry => (
                      <DeckEntryRow
                        key={`${entry.cardId}_${entry.section}`}
                        entry={entry}
                        deckId={deck.id}
                      />
                    ))}
                  </div>
                )}
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
