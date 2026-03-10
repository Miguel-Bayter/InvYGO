import { useTranslation } from 'react-i18next'
import type { DeckEntry } from '../types'
import { MAX_COPIES_PER_DECK } from '../types'
import { useDecks } from '../context'
import { useInventory } from '../../inventory/context'
import darkIcon from '@/assets/icons/Dark.png'
import divineIcon from '@/assets/icons/Divine.png'
import earthIcon from '@/assets/icons/Earth.png'
import fireIcon from '@/assets/icons/fire.png'
import lightIcon from '@/assets/icons/Light.png'
import spellIcon from '@/assets/icons/Spell.png'
import trapIcon from '@/assets/icons/Trap.png'
import waterIcon from '@/assets/icons/water.png'
import windIcon from '@/assets/icons/Wind.png'
import styles from './DeckCardItem.module.css'

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
  return value === -1 ? '?' : String(value)
}

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

interface Props {
  entry: DeckEntry
  deckId: string
}

export function DeckCardItem({ entry, deckId }: Props) {
  const { t } = useTranslation()
  const { updateQuantity, removeCard } = useDecks()
  const { getItem } = useInventory()

  const card = entry.card
  const image = card.images[0]
  const price = card.prices[0]?.cardmarketPrice

  const inventoryQty = getItem(card.id)?.quantity ?? 0
  const missing = Math.max(0, entry.quantity - inventoryQty)

  const typeParts = parseTypeParts(card.type)
  const typeLineText = [card.race, ...typeParts].join('/')
  const typeLabel =
    card.attribute ??
    (card.frameType === 'spell' ? 'SPELL' : card.frameType === 'trap' ? 'TRAP' : undefined)
  const typeIcon = typeLabel ? TYPE_ICON[typeLabel] : undefined

  const hasStats = card.attack !== undefined || card.defense !== undefined
  const hasPrice = price !== undefined && price > 0

  return (
    <div className={styles.card}>
      <div className={styles.layout}>
        {/* Image */}
        <div className={styles.imageCol}>
          {image ? (
            <img
              src={image.imageUrlSmall}
              alt={card.name}
              className={styles.image}
              loading="lazy"
            />
          ) : (
            <div className={styles.imageFallback}>⬡</div>
          )}
        </div>

        {/* Content */}
        <div className={styles.contentCol}>
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

          <p className={styles.typeLine}>[ {typeLineText} ]</p>

          {card.archetype && (
            <p className={styles.archetype}>
              {t('cardTooltip.archetype')}: {card.archetype}
            </p>
          )}

          <div className={styles.descriptionWrap}>
            <p className={styles.description}>{card.description}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.statsAndPrice}>
          {hasStats && (
            <div className={styles.stats}>
              {card.attack !== undefined && (
                <span className={styles.stat}>ATK/ {formatStatValue(card.attack)}</span>
              )}
              {card.defense !== undefined && (
                <span className={styles.stat}>DEF/ {formatStatValue(card.defense)}</span>
              )}
            </div>
          )}
          {hasPrice && (
            <span className={styles.price}>
              {t('cardTooltip.marketPrice')}: ${price!.toFixed(2)}
            </span>
          )}
          {missing > 0 && (
            <span className={styles.missingBadge}>
              {t('decks.entry.missing', { count: missing })}
            </span>
          )}
        </div>

        <div className={styles.actions}>
          <div className={styles.stepper}>
            <button
              className={styles.stepBtn}
              onClick={() => updateQuantity(deckId, card.id, entry.section, entry.quantity - 1)}
              disabled={entry.quantity <= 1}
              title={t('decks.entry.decrease')}
            >
              −
            </button>
            <span className={styles.qty}>{entry.quantity}</span>
            <button
              className={styles.stepBtn}
              onClick={() => updateQuantity(deckId, card.id, entry.section, entry.quantity + 1)}
              disabled={entry.quantity >= MAX_COPIES_PER_DECK}
              title={t('decks.entry.increase')}
            >
              +
            </button>
          </div>
          <button
            className={styles.removeBtn}
            onClick={() => removeCard(deckId, card.id, entry.section)}
            title={t('decks.entry.remove')}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
