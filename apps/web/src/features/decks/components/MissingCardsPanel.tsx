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

const SECTION_ORDER: DeckSection[] = ['main', 'extra', 'side']

interface Props {
  deck: Deck
}

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

    list.sort((a, b) => b.missing - a.missing)

    return { missingList: list, totalCards: total, ownedCards: owned, totalMissing: missingSum }
  }, [deck.entries, getItem])

  const grouped = useMemo(
    () =>
      SECTION_ORDER.map(section => ({
        section,
        items: missingList.filter(e => e.section === section),
      })).filter(g => g.items.length > 0),
    [missingList]
  )

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
            {grouped.map(({ section, items }) => (
              <div key={section} className={styles.group}>
                <div className={styles.groupHeader}>
                  {t(`decks.section.${section}`)}
                  <span className={styles.groupCount}>
                    {items.reduce((sum, i) => sum + i.missing, 0)}
                  </span>
                </div>
                {items.map(item => {
                  const isCritical = item.owned === 0
                  return (
                    <div key={`${item.cardId}_${item.section}`} className={styles.rowWrapper}>
                      <button
                        className={styles.row}
                        onClick={() => handleRowClick(item.name)}
                        title={t('decks.missing.searchInCatalog')}
                      >
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
            ))}
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
