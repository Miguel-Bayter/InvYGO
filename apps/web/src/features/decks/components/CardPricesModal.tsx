import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CardPrice } from '../../catalog/types'
import styles from './CardPricesModal.module.css'

interface MarketplaceConfig {
  key: keyof CardPrice
  label: string
  urlFn: (name: string) => string
}

const MARKETPLACE_CONFIG: MarketplaceConfig[] = [
  {
    key: 'tcgplayerPrice',
    label: 'TCGPlayer',
    urlFn: name =>
      `https://www.tcgplayer.com/search/yugioh/product?productLineName=yugioh&q=${encodeURIComponent(name)}`,
  },
  {
    key: 'cardmarketPrice',
    label: 'CardMarket',
    urlFn: name =>
      `https://www.cardmarket.com/en/YuGiOh/Products/Search?searchString=${encodeURIComponent(name)}`,
  },
  {
    key: 'ebayPrice',
    label: 'eBay',
    urlFn: name => `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent('yugioh ' + name)}`,
  },
  {
    key: 'amazonPrice',
    label: 'Amazon',
    urlFn: name => `https://www.amazon.com/s?k=${encodeURIComponent('yugioh ' + name)}`,
  },
  {
    key: 'coolstuffincPrice',
    label: 'CoolStuffInc',
    urlFn: name => `https://www.coolstuffinc.com/sc/Yu-Gi-Oh!?terms=${encodeURIComponent(name)}`,
  },
]

const STORAGE_KEY = 'ygo_marketplace_clicks'

function recordClick(cardId: string, marketplace: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const data: Record<string, number> = raw ? (JSON.parse(raw) as Record<string, number>) : {}
    const key = `${cardId}_${marketplace}`
    data[key] = (data[key] ?? 0) + 1
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // silently ignore storage errors
  }
}

type SortDir = 'asc' | 'desc'

interface Props {
  cardId: string
  cardName: string
  prices: CardPrice[]
  onClose: () => void
}

export function CardPricesModal({ cardId, cardName, prices, onClose }: Props) {
  const { t } = useTranslation()
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const priceData = prices[0] ?? null

  const rows = MARKETPLACE_CONFIG.map(cfg => ({
    marketplace: cfg.label,
    price: priceData ? (priceData[cfg.key] as number) : 0,
    url: cfg.urlFn(cardName),
  }))

  const sorted = [...rows].sort((a, b) =>
    sortDir === 'asc' ? a.price - b.price : b.price - a.price
  )

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.cardName}>{cardName}</span>
          <div className={styles.headerActions}>
            <button
              className={styles.sortBtn}
              onClick={() => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))}
              title={
                sortDir === 'asc' ? t('decks.prices.sortHighLow') : t('decks.prices.sortLowHigh')
              }
            >
              {sortDir === 'asc' ? '↑' : '↓'} {t('decks.prices.price')}
            </button>
            <button className={styles.closeBtn} onClick={onClose} aria-label={t('ui.close')}>
              ✕
            </button>
          </div>
        </div>

        <div className={styles.subtitle}>{t('decks.prices.subtitle')}</div>

        <div className={styles.list}>
          {sorted.map(row => (
            <div key={row.marketplace} className={styles.row}>
              <span className={styles.marketplaceName}>{row.marketplace}</span>
              <span className={`${styles.price} ${row.price === 0 ? styles.priceNone : ''}`}>
                {row.price > 0 ? `$${row.price.toFixed(2)}` : t('decks.prices.noPrice')}
              </span>
              <a
                href={row.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shopLink}
                onClick={() => recordClick(cardId, row.marketplace)}
              >
                {t('decks.prices.searchInStore')} →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
