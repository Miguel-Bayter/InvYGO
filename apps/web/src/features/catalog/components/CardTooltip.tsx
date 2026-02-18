import { useTranslation } from 'react-i18next'
import type { Card } from '../types'
import { ATTRIBUTE_COLOR } from '../constants'
import styles from './CardTooltip.module.css'

interface Props {
  card: Card
  anchorRect: DOMRect
}

const TOOLTIP_W = 380
const TOOLTIP_MAX_H = 520
const GAP = 14

function getPosition(rect: DOMRect): { left: number; top: number } {
  const spaceRight = window.innerWidth - rect.right - GAP
  const left = spaceRight >= TOOLTIP_W ? rect.right + GAP : Math.max(8, rect.left - TOOLTIP_W - GAP)

  const top = Math.max(8, Math.min(rect.top, window.innerHeight - TOOLTIP_MAX_H - 8))

  return { left, top }
}

export function CardTooltip({ card, anchorRect }: Props) {
  const { t } = useTranslation()
  const image = card.images[0]
  const price = card.prices[0]?.cardmarketPrice
  const attrColor = card.attribute ? (ATTRIBUTE_COLOR[card.attribute] ?? '#7a8fa0') : undefined
  const { left, top } = getPosition(anchorRect)

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
                <span className={styles.stat}>ATK / {card.attack}</span>
              )}
              {card.defense !== undefined && (
                <span className={styles.stat}>DEF / {card.defense}</span>
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
