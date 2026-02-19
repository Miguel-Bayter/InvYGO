import { useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import carruselBg from '@/assets/carrusel.jpg'
import carruselModel from '@/assets/carrusel-removebg.png'
import reverseClassic from '@/assets/reverse/reverse-classic.jpg'
import reverseAnime from '@/assets/reverse/reverse-anime.jpg'
import { useCarousel } from '@/features/carousel/context'
import { CAROUSEL_MIN_ITEMS } from '@/features/carousel/defaults'
import styles from './HomePage.module.css'

export function HomePage() {
  const { t } = useTranslation()
  const { state, moveCard, removeCard, resetDefaults, setInnerStyle, setOuterFace } = useCarousel()
  const [isConfigOpen, setIsConfigOpen] = useState(false)

  const reverseTexture = state.innerStyle === 'anime' ? reverseAnime : reverseClassic

  return (
    <div className={styles.page}>
      <div
        className={styles.banner}
        style={{ ['--hero-bg' as string]: `url(${carruselBg})` } as CSSProperties}
      >
        <div
          className={styles.slider}
          style={{ ['--quantity' as string]: state.cards.length } as CSSProperties}
        >
          {state.cards.map((card, index) => (
            <div
              key={card.id}
              className={styles.item}
              style={
                {
                  ['--position' as string]: index + 1,
                  ['--reverse-bg' as string]: `url(${reverseTexture})`,
                } as CSSProperties
              }
            >
              {state.outerFace === 'reverse' ? (
                <>
                  <div className={`${styles.cardFace} ${styles.faceFront} ${styles.reverseFace}`} />
                  <div className={`${styles.cardFace} ${styles.faceBack} ${styles.artFace}`}>
                    <img src={card.imageUrl} alt={card.name} />
                  </div>
                </>
              ) : (
                <>
                  <div className={`${styles.cardFace} ${styles.faceFront} ${styles.artFace}`}>
                    <img src={card.imageUrl} alt={card.name} />
                  </div>
                  <div className={`${styles.cardFace} ${styles.faceBack} ${styles.reverseFace}`} />
                </>
              )}
            </div>
          ))}
        </div>

        <div className={styles.content}>
          <img src={carruselModel} alt="Hero model" className={styles.model} />

          <h1 className={styles.logoText}>
            <span className={styles.logoAccent}>INV</span>YGO
          </h1>
        </div>

        <div className={styles.panel}>
          <h2>
            <span className={styles.panelAccent}>Inv</span>YGO
          </h2>
          <p>{t('home.subtitle')}</p>
          <div className={styles.actions}>
            <Link to="/catalog" className={styles.primaryBtn}>
              {t('nav.catalog')}
            </Link>
            <Link to="/inventory" className={styles.ghostBtn}>
              {t('nav.inventory')}
            </Link>
            <button
              type="button"
              className={styles.configBtn}
              onClick={() => setIsConfigOpen(v => !v)}
            >
              {isConfigOpen ? t('home.carousel.closeConfig') : t('home.carousel.openConfig')}
            </button>
          </div>

          {isConfigOpen && (
            <div className={styles.configPanel}>
              <div className={styles.configRow}>
                <p>{t('home.carousel.innerStyle')}</p>
                <div className={styles.chips}>
                  <button
                    type="button"
                    className={`${styles.chip} ${state.innerStyle === 'classic' ? styles.chipActive : ''}`}
                    onClick={() => setInnerStyle('classic')}
                  >
                    {t('home.carousel.classic')}
                  </button>
                  <button
                    type="button"
                    className={`${styles.chip} ${state.innerStyle === 'anime' ? styles.chipActive : ''}`}
                    onClick={() => setInnerStyle('anime')}
                  >
                    {t('home.carousel.anime')}
                  </button>
                </div>
              </div>

              <div className={styles.configRow}>
                <p>{t('home.carousel.outerSide')}</p>
                <div className={styles.chips}>
                  <button
                    type="button"
                    className={`${styles.chip} ${state.outerFace === 'reverse' ? styles.chipActive : ''}`}
                    onClick={() => setOuterFace('reverse')}
                  >
                    {t('home.carousel.reverse')}
                  </button>
                  <button
                    type="button"
                    className={`${styles.chip} ${state.outerFace === 'art' ? styles.chipActive : ''}`}
                    onClick={() => setOuterFace('art')}
                  >
                    {t('home.carousel.art')}
                  </button>
                </div>
              </div>

              <div className={styles.configList}>
                {state.cards.map((card, index) => (
                  <div key={`cfg-${card.id}`} className={styles.configItem}>
                    <span className={styles.configName}>{card.name}</span>
                    <div className={styles.itemActions}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => moveCard(card.id, 'up')}
                        disabled={index === 0}
                        aria-label="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => moveCard(card.id, 'down')}
                        disabled={index === state.cards.length - 1}
                        aria-label="Move down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => removeCard(card.id)}
                        disabled={state.cards.length <= CAROUSEL_MIN_ITEMS}
                        aria-label="Remove card"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" className={styles.resetBtn} onClick={resetDefaults}>
                {t('home.carousel.reset')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
