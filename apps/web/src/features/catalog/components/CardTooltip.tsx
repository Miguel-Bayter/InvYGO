import { useTranslation } from 'react-i18next'
import type { Card } from '../types'
import { ATTRIBUTE_COLOR } from '../constants'
import styles from './CardTooltip.module.css'

interface Props {
  card: Card
  anchorRect: DOMRect
  /** Force tooltip to appear on the right side of the viewport (use in list view) */
  preferRight?: boolean
}

const TOOLTIP_W = 380
const TOOLTIP_MAX_H = 520
const GAP = 14
const EDGE_PAD = 8

function formatStatValue(value: number): string {
  if (value === -1) return '?'
  return String(value)
}

function getPosition(rect: DOMRect, preferRight: boolean): { left: number; top: number } {
  let left: number

  if (preferRight) {
    // List view: items are full-width so there is no space to the right of the anchor.
    // Place the tooltip anchored to the right edge of the viewport instead.
    left = window.innerWidth - TOOLTIP_W - EDGE_PAD
  } else {
    // Gallery view: prefer right of the card, fall back to left.
    const spaceRight = window.innerWidth - rect.right - GAP
    if (spaceRight >= TOOLTIP_W) {
      left = rect.right + GAP
    } else {
      left = Math.max(EDGE_PAD, rect.left - TOOLTIP_W - GAP)
    }
  }

  // Vertical: align tooltip top with anchor top, clamp so it never exits the viewport.
  const top = Math.max(EDGE_PAD, Math.min(rect.top, window.innerHeight - TOOLTIP_MAX_H - EDGE_PAD))

  return { left, top }
}

export function CardTooltip({ card, anchorRect, preferRight = false }: Props) {
  const { t } = useTranslation()
  const image = card.images[0]
  const price = card.prices[0]?.cardmarketPrice
  const attrColor = card.attribute ? (ATTRIBUTE_COLOR[card.attribute] ?? '#7a8fa0') : undefined
  const { left, top } = getPosition(anchorRect, preferRight)

  return (
    <div className={styles.tooltip} style={{ left, top }}>
      {/* ── Header: image + identity ── */}
      <div className={styles.header}>
        <div className={styles.imageCol}>
          {image ? (
            <img src={image.imageUrlSmall} alt={card.name} className={styles.image} />
          ) : (
            <div className={styles.imageFallback}>⬡</div>
          )}
        </div>

        <div className={styles.meta}>
          <div className={styles.nameRow}>
            <h3 className={styles.name}>{card.name}</h3>
            <div className={styles.badges}>
              {card.attribute && (
                <span className={styles.attribute} style={{ background: attrColor }}>
                  {card.attribute}
                </span>
              )}
              {card.level !== undefined && <span className={styles.level}>★ {card.level}</span>}
            </div>
          </div>

          <p className={styles.type}>
            [{card.race} / {card.type}]
          </p>

          {card.archetype && (
            <p className={styles.archetype}>
              {t('cardTooltip.archetype')}: {card.archetype}
            </p>
          )}
        </div>
      </div>

      {/* ── Body: description + stats + price ── */}
      <div className={styles.body}>
        <p className={styles.description}>{card.description}</p>

        {(card.attack !== undefined || card.defense !== undefined) && (
          <>
            <div className={styles.divider} />
            <div className={styles.stats}>
              {card.attack !== undefined && (
                <span className={styles.stat}>ATK / {formatStatValue(card.attack)}</span>
              )}
              {card.defense !== undefined && (
                <span className={styles.stat}>DEF / {formatStatValue(card.defense)}</span>
              )}
            </div>
          </>
        )}

        {price !== undefined && price > 0 && (
          <>
            <div className={styles.divider} />
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>{t('cardTooltip.marketPrice')}</span>
              <span className={styles.priceValue}>${price.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
