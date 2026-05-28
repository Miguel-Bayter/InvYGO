import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Card } from '../types'
import { ATTRIBUTE_COLOR } from '../constants'
import { CardTooltip } from './CardTooltip'
import { AddToInventoryModal } from '../../inventory/components/AddToInventoryModal'
import { useInventory } from '../../inventory/context'
import { ImageScanner } from '@/components/ui/ImageScanner'
import styles from './CardListItem.module.css'

interface Props {
  card: Card
}

const HOVER_DELAY_MS = 500
const CLOSE_DELAY_MS = 300
const IS_TOUCH_DEVICE = window.matchMedia('(hover: none)').matches

export function CardListItem({ card }: Props) {
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
  const [showModal, setShowModal] = useState(false)
  const articleRef = useRef<HTMLElement>(null)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { getItem } = useInventory()

  const image = card.images[0]
  const attrColor = card.attribute ? (ATTRIBUTE_COLOR[card.attribute] ?? '#7a8fa0') : undefined
  const inInventory = !!getItem(card.id)

  function cancelClose() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  function scheduleClose() {
    cancelClose()
    closeTimerRef.current = setTimeout(() => setAnchorRect(null), CLOSE_DELAY_MS)
  }

  function handleMouseEnter() {
    if (IS_TOUCH_DEVICE) return
    cancelClose()
    hoverTimerRef.current = setTimeout(() => {
      if (articleRef.current) {
        setAnchorRect(articleRef.current.getBoundingClientRect())
      }
    }, HOVER_DELAY_MS)
  }

  function handleMouseLeave(e: React.MouseEvent) {
    if (IS_TOUCH_DEVICE) return
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
    const related = e.relatedTarget as Element | null
    if (related?.closest('[data-card-tooltip]')) return
    scheduleClose()
  }

  function handleTouchStart() {
    cancelClose()
    if (articleRef.current) {
      setAnchorRect(articleRef.current.getBoundingClientRect())
    }
  }

  function handleAddClick(e: React.MouseEvent | React.TouchEvent) {
    e.stopPropagation()
    setAnchorRect(null)
    cancelClose()
    setShowModal(true)
  }

  useEffect(() => {
    if (!anchorRect) return
    function onDocTouch(e: TouchEvent) {
      const target = e.target as Element
      if (target.closest('[data-card-tooltip]')) return
      if (articleRef.current?.contains(target)) return
      setAnchorRect(null)
    }
    document.addEventListener('touchstart', onDocTouch, { passive: true })
    return () => document.removeEventListener('touchstart', onDocTouch)
  }, [anchorRect])

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  return (
    <>
      <article
        ref={articleRef}
        className={styles.item}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
      >
        {/* Thumbnail */}
        <div className={styles.thumb}>
          {!imgLoaded && !imgError && <ImageScanner aspectRatio="59 / 86" />}
          
          {image && !imgError ? (
            <img
              src={image.imageUrlSmall}
              alt={card.name}
              className={`${styles.img} ${imgLoaded ? styles.imgLoaded : ''}`}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={styles.imgFallback}></div>
          )}
          
          {/* Targeting reticle overlay */}
          <div className={styles.targetingOverlay}>
            <div className={styles.targetBorder} />
            <div className={styles.cornerBrackets}>
              <span className={styles.bracket} />
              <span className={styles.bracket} />
              <span className={styles.bracket} />
              <span className={styles.bracket} />
            </div>
            <div className={styles.scannerSystem}>
              <div className={styles.scanBeam} />
              <div className={styles.scanBeamVertical} />
              <div className={styles.dataPoints}>
                <span className={styles.dataPoint} />
                <span className={styles.dataPoint} />
                <span className={styles.dataPoint} />
                <span className={styles.dataPoint} />
                <span className={styles.dataPoint} />
              </div>
              <div className={styles.scanGrid} />
              <div className={styles.cornerMarkers}>
                <span className={styles.cornerMarker} />
                <span className={styles.cornerMarker} />
                <span className={styles.cornerMarker} />
                <span className={styles.cornerMarker} />
              </div>
            </div>
            <div className={styles.trackingDots}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
            <div className={styles.crosshair} />
            <div className={styles.digitalFlicker} />
          </div>
        </div>

        {/* Name + type */}
        <div className={styles.main}>
          <p className={styles.name}>{card.name}</p>
          <p className={styles.type}>
            {card.type} — {card.race}
            {card.archetype && <span className={styles.archetype}> · {card.archetype}</span>}
          </p>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          {card.level !== undefined && <span className={styles.stat}>Lv.{card.level}</span>}
          {card.attack !== undefined && <span className={styles.stat}>ATK {card.attack}</span>}
          {card.defense !== undefined && <span className={styles.stat}>DEF {card.defense}</span>}
        </div>

        {/* Attribute badge */}
        {card.attribute && (
          <span className={styles.attr} style={{ background: attrColor }}>
            {card.attribute}
          </span>
        )}

        {/* Add to inventory */}
        <button
          className={`${styles.addBtn} ${inInventory ? styles.addBtnActive : ''}`}
          onClick={handleAddClick}
          onTouchStart={e => {
            e.stopPropagation()
            handleAddClick(e)
          }}
          aria-label="Add to inventory"
        >
          {inInventory ? '✓' : '+'}
        </button>

        {anchorRect &&
          createPortal(
            <CardTooltip
              card={card}
              anchorRect={anchorRect}
              onClose={() => setAnchorRect(null)}
              onCancelClose={cancelClose}
            />,
            document.body
          )}
      </article>

      {showModal && <AddToInventoryModal card={card} onClose={() => setShowModal(false)} />}
    </>
  )
}
