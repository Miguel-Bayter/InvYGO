import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Card } from '../types'
import styles from './CardTooltip.module.css'
import darkIcon from '@/assets/icons/Dark.png'
import divineIcon from '@/assets/icons/Divine.png'
import earthIcon from '@/assets/icons/Earth.png'
import fireIcon from '@/assets/icons/fire.png'
import lightIcon from '@/assets/icons/Light.png'
import spellIcon from '@/assets/icons/Spell.png'
import trapIcon from '@/assets/icons/Trap.png'
import waterIcon from '@/assets/icons/water.png'
import windIcon from '@/assets/icons/Wind.png'

interface Props {
  card: Card
  anchorRect: DOMRect
  /** Force tooltip to appear on the right side of the viewport */
  preferRight?: boolean
  /** Immediate close — called when mouse leaves the tooltip */
  onClose: () => void
  /** Cancel a scheduled close — called when mouse enters the tooltip */
  onCancelClose?: () => void
}

const TOOLTIP_W = 500
const TOOLTIP_MAX_H = 356
const GAP = 14
const EDGE_PAD = 8

const TYPE_ICON: Record<string, string> = {
  DARK: darkIcon,
  DIVINE: divineIcon,
  EARTH: earthIcon,
  FIRE: fireIcon,
  LIGHT: lightIcon,
  SPELL: spellIcon,
  TRAP: trapIcon,
  WATER: waterIcon,
  WIND: windIcon,
}

function formatStatValue(value: number): string {
  if (value === -1) return '?'
  return String(value)
}

/**
 * Parses a YGO `type` string into display parts.
 * "Tuner/Effect Monster" → ["Tuner", "Effect"]
 * "Spell Card"           → ["Spell"]
 * "Ritual Effect Monster"→ ["Ritual", "Effect"]
 */
function parseTypeParts(type: string): string[] {
  const stripped = type
    .replace(/ Monster$/, '')
    .replace(/ Card$/, '')
    .trim()
  if (!stripped) return [type]
  return stripped
    .split('/')
    .flatMap(p => p.trim().split(' '))
    .filter(Boolean)
}

function getPosition(
  rect: DOMRect,
  preferRight: boolean
): { left: number; top: number; width: number } {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const maxW = vw - 2 * EDGE_PAD
  const effectiveW = Math.min(TOOLTIP_W, maxW)

  // ── Mobile / narrow viewports: center horizontally, anchor below or above the card ──
  if (vw < 540) {
    const left = Math.max(EDGE_PAD, (vw - effectiveW) / 2)
    const belowTop = rect.bottom + GAP
    const aboveTop = rect.top - TOOLTIP_MAX_H - GAP
    let top: number
    if (belowTop + TOOLTIP_MAX_H <= vh - EDGE_PAD) {
      top = belowTop
    } else if (aboveTop >= EDGE_PAD) {
      top = aboveTop
    } else {
      top = Math.max(EDGE_PAD, (vh - TOOLTIP_MAX_H) / 2)
    }
    return { left, top, width: effectiveW }
  }

  // ── Desktop: smart side positioning — right if space, left otherwise ──
  let left: number
  if (preferRight) {
    // List view: always pinned to the right edge of the viewport
    left = vw - effectiveW - EDGE_PAD
  } else {
    // Gallery view: right of card when there is room, left of card otherwise
    const spaceRight = vw - rect.right - GAP
    if (spaceRight >= effectiveW) {
      left = rect.right + GAP
    } else {
      left = Math.max(EDGE_PAD, rect.left - effectiveW - GAP)
    }
  }

  const top = Math.max(EDGE_PAD, Math.min(rect.top, vh - TOOLTIP_MAX_H - EDGE_PAD))
  return { left, top, width: effectiveW }
}

export function CardTooltip({ card, anchorRect, preferRight = false, onClose, onCancelClose }: Props) {
  const { t } = useTranslation()
  const [closing, setClosing] = useState(false)
  const image = card.images[0]
  const price = card.prices[0]?.cardmarketPrice
  const { left, top, width } = getPosition(anchorRect, preferRight)

  const typeParts = parseTypeParts(card.type)
  const typeLineText = [card.race, ...typeParts].join('/')
  const typeLabel =
    card.attribute ??
    (card.frameType === 'spell' ? 'SPELL' : card.frameType === 'trap' ? 'TRAP' : undefined)
  const typeIcon = typeLabel ? TYPE_ICON[typeLabel] : undefined

  const hasStats = card.attack !== undefined || card.defense !== undefined
  const hasPrice = price !== undefined && price > 0

  function handleClose() {
    if (closing) return
    setClosing(true)
    setTimeout(onClose, 110)
  }

  return (
    // data-card-tooltip lets parent handleMouseLeave detect when mouse moved here
    <div
      className={`${styles.tooltip}${closing ? ` ${styles.tooltipClosing}` : ''}`}
      style={{ left, top, width }}
      data-card-tooltip
      onMouseEnter={onCancelClose}
      onMouseLeave={handleClose}
    >
      {/* Mobile close button — visible only on touch screens */}
      <button className={styles.mobileCloseBtn} onClick={handleClose} aria-label={t('ui.close')}>
        ✕
      </button>

      {/* ── Main layout: image | content ── */}
      <div className={styles.layout}>
        {/* Image */}
        <div className={styles.imageCol}>
          {image ? (
            <img src={image.imageUrlSmall} alt={card.name} className={styles.image} />
          ) : (
            <div className={styles.imageFallback}>⬡</div>
          )}
        </div>

        {/* Content */}
        <div className={styles.contentCol}>
          {/* Name row */}
          <div className={styles.nameRow}>
            <h3 className={styles.name}>{card.name}</h3>
            <div className={styles.badges}>
              {typeLabel && (
                <span className={styles.attribute}>
                  {typeIcon && <img src={typeIcon} alt={typeLabel} className={styles.attrIcon} />}
                  {typeLabel}
                </span>
              )}
              {card.level !== undefined && <span className={styles.level}>⭐ {card.level}</span>}
            </div>
          </div>

          {/* Type line */}
          <p className={styles.typeLine}>[ {typeLineText} ]</p>

          {/* Archetype */}
          {card.archetype && (
            <p className={styles.archetype}>
              {t('cardTooltip.archetype')}: {card.archetype}
            </p>
          )}

          {/* Description — scrollable */}
          <div className={styles.descriptionWrap}>
            <p className={styles.description}>{card.description}</p>
          </div>
        </div>
      </div>

      {/* ── Footer: ATK/DEF + price ── */}
      {(hasStats || hasPrice) && (
        <div className={styles.footer}>
          <div className={styles.stats}>
            {card.attack !== undefined && (
              <span className={styles.stat}>ATK/ {formatStatValue(card.attack)}</span>
            )}
            {card.defense !== undefined && (
              <span className={styles.stat}>DEF/ {formatStatValue(card.defense)}</span>
            )}
          </div>
          {hasPrice && (
            <span className={styles.price}>
              {t('cardTooltip.marketPrice')}: ${price!.toFixed(2)}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
