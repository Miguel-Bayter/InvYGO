import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { Deck, DeckEntry, DeckSection } from '../types'
import { DECK_LIMITS } from '../types'
import { useDecks } from '../context'
import { DeckEntryRow } from './DeckEntryRow'
import { DeckCardTile } from './DeckCardTile'
import { MissingCardsPanel } from './MissingCardsPanel'
import { CardSearchModal } from './CardSearchModal'
import { ViewToggle } from '../../catalog/components/ViewToggle'
import type { ViewMode } from '../../catalog/components/ViewToggle'
import { fetchCardByPasscode } from '../../catalog/api'
import type { Card } from '../../catalog/types'
import { useToast } from '../../../components/ui/ToastProvider'
import styles from './DeckBuilderView.module.css'

const SECTIONS: DeckSection[] = ['main', 'extra', 'side']

interface Props {
  deck: Deck
}

export function DeckBuilderView({ deck }: Props) {
  const { t } = useTranslation()
  const { importDeck } = useDecks()
  const { showToast } = useToast()
  const [searchOpen, setSearchOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [importing, setImporting] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)

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

  function handleJsonImport(content: string) {
    try {
      const raw = JSON.parse(content) as unknown
      if (
        typeof raw !== 'object' ||
        raw === null ||
        typeof (raw as Record<string, unknown>).name !== 'string' ||
        !Array.isArray((raw as Record<string, unknown>).entries)
      )
        throw new Error('invalid')
      const data = raw as Omit<Deck, 'id'>
      importDeck(data)
      showToast(t('decks.builder.importSuccess', { name: data.name }), 'success')
    } catch {
      showToast(t('decks.builder.importError'), 'error')
    }
  }

  async function handleYdkImport(content: string, fileName: string) {
    const main: string[] = []
    const extra: string[] = []
    const side: string[] = []
    let current: string[] | null = null

    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (trimmed === '#main') {
        current = main
        continue
      }
      if (trimmed === '#extra') {
        current = extra
        continue
      }
      if (trimmed === '!side') {
        current = side
        continue
      }
      if (trimmed.startsWith('#') || trimmed === '') continue
      if (current && /^\d+$/.test(trimmed)) current.push(trimmed)
    }

    if (main.length + extra.length + side.length === 0) {
      showToast(t('decks.builder.importError'), 'error')
      return
    }

    setImporting(true)

    // Fetch in batches of 5 to avoid rate limits.
    // Validate that the returned card id matches the queried id — if the API
    // does not support the `id` filter it would return a random card instead.
    const allIds = [...new Set([...main, ...extra, ...side])]
    const cardMap = new Map<string, Card>()
    const BATCH = 5

    for (let i = 0; i < allIds.length; i += BATCH) {
      await Promise.allSettled(
        allIds.slice(i, i + BATCH).map(async id => {
          const card = await fetchCardByPasscode(id)
          if (card) cardMap.set(id, card)
        })
      )
    }

    const entries: DeckEntry[] = []
    const sectionMap: [DeckSection, string[]][] = [
      ['main', main],
      ['extra', extra],
      ['side', side],
    ]
    let totalUnique = 0
    let totalResolved = 0

    for (const [section, ids] of sectionMap) {
      const counts = new Map<string, number>()
      for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1)
      for (const [id, qty] of counts) {
        totalUnique++
        const card = cardMap.get(id)
        if (card) {
          entries.push({ cardId: id, card, quantity: Math.min(qty, 3), section })
          totalResolved++
        }
      }
    }

    setImporting(false)

    if (entries.length === 0) {
      showToast(t('decks.builder.importYdkNoCards'), 'error')
      return
    }

    const deckName = fileName.replace(/\.ydk$/i, '').trim() || 'Imported Deck'
    importDeck({
      name: deckName,
      entries,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    if (totalResolved < totalUnique) {
      showToast(
        t('decks.builder.importYdkPartial', { imported: totalResolved, total: totalUnique }),
        'warning'
      )
    } else {
      showToast(t('decks.builder.importSuccess', { name: deckName }), 'success')
    }
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (importRef.current) importRef.current.value = ''
    if (!file) return
    const reader = new FileReader()
    if (file.name.toLowerCase().endsWith('.ydk')) {
      reader.onload = () => void handleYdkImport(reader.result as string, file.name)
    } else {
      reader.onload = () => handleJsonImport(reader.result as string)
    }
    reader.readAsText(file)
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
          <button
            className={styles.actionBtn}
            onClick={() => importRef.current?.click()}
            disabled={importing}
          >
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
