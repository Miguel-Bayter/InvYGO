import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { Deck, DeckSection } from '../types'
import type { CardPrice } from '../../catalog/types'
import { useInventory } from '../../inventory/context'
import { CardPricesModal } from './CardPricesModal'
import styles from './MissingCardsPanel.module.css'

interface MissingEntry {
  cardId: string
  name: string
  section: DeckSection
  missing: number
  owned: number
  needed: number
  prices: CardPrice[]
}

interface PricesTarget {
  cardId: string
  name: string
  prices: CardPrice[]
}

interface Props {
  deck: Deck
}

const SECTION_LABEL: Record<DeckSection, string> = { main: 'M', extra: 'E', side: 'S' }

export function MissingCardsPanel({ deck }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getItem } = useInventory()
  const [pricesTarget, setPricesTarget] = useState<PricesTarget | null>(null)

  function handleRowClick(cardName: string) {
    navigate(`/catalog?name=${encodeURIComponent(cardName)}`)
  }

  function handlePricesClick(e: React.MouseEvent, entry: MissingEntry) {
    e.stopPropagation()
    setPricesTarget({ cardId: entry.cardId, name: entry.name, prices: entry.prices })
  }

  const { missingList, totalCards, ownedCards, totalMissing } = useMemo(() => {
    const list: MissingEntry[] = []
    let total = 0
    let owned = 0
    let missingSum = 0

    for (const entry of deck.entries) {
      const inventoryQty = getItem(entry.cardId)?.quantity ?? 0
      const missing = Math.max(0, entry.quantity - inventoryQty)
      total += entry.quantity
      owned += Math.min(entry.quantity, inventoryQty)
      missingSum += missing
      if (missing > 0) {
        list.push({
          cardId: entry.cardId,
          name: entry.card.name,
          section: entry.section,
          missing,
          owned: Math.min(entry.quantity, inventoryQty),
          needed: entry.quantity,
          prices: entry.card.prices,
        })
      }
    }

    list.sort(
      (a, b) =>
        b.missing - a.missing ||
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true })
    )

    return { missingList: list, totalCards: total, ownedCards: owned, totalMissing: missingSum }
  }, [deck.entries, getItem])

  const pct = totalCards > 0 ? Math.round((ownedCards / totalCards) * 100) : 100
  const isComplete = missingList.length === 0

  return (
    <>
      <div className={styles.panel}>
        <div className={`${styles.header} ${isComplete ? styles.completeHeader : ''}`}>
          <div className={styles.titleGroup}>
            <span className={`${styles.icon} ${isComplete ? styles.completeIcon : ''}`}>
              {isComplete ? '✓' : '⚠'}
            </span>
            <span className={`${styles.title} ${isComplete ? styles.completeTitle : ''}`}>
              {t('decks.missing.title')}
            </span>
          </div>
          <span className={`${styles.badge} ${isComplete ? styles.completeBadge : ''}`}>
            {isComplete ? t('decks.missing.complete') : `−${totalMissing}`}
          </span>
        </div>

        {isComplete ? (
          <div className={styles.allGood}>{t('decks.missing.allGood')}</div>
        ) : (
          <div className={styles.list}>
            {missingList.map(item => {
              const isCritical = item.owned === 0
              return (
                <div key={`${item.cardId}_${item.section}`} className={styles.rowWrapper}>
                  <button
                    className={styles.row}
                    onClick={() => handleRowClick(item.name)}
                    title={t('decks.missing.searchInCatalog')}
                  >
                    <span
                      className={`${styles.sectionTag} ${styles[`sectionTag_${item.section}`]}`}
                    >
                      {SECTION_LABEL[item.section]}
                    </span>
                    <span className={styles.cardName}>{item.name}</span>
                    <span
                      className={`${styles.ratio} ${isCritical ? styles.ratioCritical : styles.ratioPartial}`}
                    >
                      {item.owned}/{item.needed}
                    </span>
                  </button>
                  <button
                    className={styles.priceBtn}
                    onClick={e => handlePricesClick(e, item)}
                    title={t('decks.prices.viewPrices')}
                  >
                    $
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <div className={styles.completionBar}>
          <div className={styles.completionLabel}>
            <span>{t('decks.missing.coverage')}</span>
            <span className={styles.completionPct}>{pct}%</span>
          </div>
          <div className={styles.barTrack}>
            <div className={styles.barFill} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {pricesTarget && (
        <CardPricesModal
          cardId={pricesTarget.cardId}
          cardName={pricesTarget.name}
          prices={pricesTarget.prices}
          onClose={() => setPricesTarget(null)}
        />
      )}
    </>
  )
}
