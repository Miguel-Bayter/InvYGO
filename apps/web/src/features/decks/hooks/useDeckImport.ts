import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useDecks } from '../context'
import { useToast } from '../../../components/ui/ToastProvider'
import { fetchCardByPasscode } from '../../catalog/api'
import type { Card } from '../../catalog/types'
import type { DeckEntry, DeckSection } from '../types'
import type { Deck } from '../types'

const BATCH = 5
const BATCH_DELAY_MS = 150

export function useDeckImport() {
  const { t } = useTranslation()
  const { importDeck } = useDecks()
  const { showToast } = useToast()
  const [importing, setImporting] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)

  function triggerImport() {
    importRef.current?.click()
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

    const allIds = [...new Set([...main, ...extra, ...side])]
    const cardMap = new Map<string, Card>()

    for (let i = 0; i < allIds.length; i += BATCH) {
      await Promise.allSettled(
        allIds.slice(i, i + BATCH).map(async id => {
          const card = await fetchCardByPasscode(id)
          if (card) cardMap.set(id, card)
        })
      )
      if (i + BATCH < allIds.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS))
      }
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

  return { importing, importRef, triggerImport, handleImportFile }
}
