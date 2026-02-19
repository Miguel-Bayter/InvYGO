import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import carruselBg from '@/assets/carrusel.jpg'
import carruselModel from '@/assets/carrusel-removebg.png'
import reverseClassic from '@/assets/reverse/reverse-classic.jpg'
import styles from './HomePage.module.css'

export function HomePage() {
  const { t } = useTranslation()

  const slides = [
    'https://images.ygoprodeck.com/images/cards/14558127.jpg',
    'https://images.ygoprodeck.com/images/cards/46986414.jpg',
    'https://images.ygoprodeck.com/images/cards/89631139.jpg',
    'https://images.ygoprodeck.com/images/cards/74677422.jpg',
    'https://images.ygoprodeck.com/images/cards/6150044.jpg',
    'https://images.ygoprodeck.com/images/cards/44508094.jpg',
    'https://images.ygoprodeck.com/images/cards/23995346.jpg',
    'https://images.ygoprodeck.com/images/cards/9753964.jpg',
    'https://images.ygoprodeck.com/images/cards/40908371.jpg',
    'https://images.ygoprodeck.com/images/cards/6983839.jpg',
  ]

  return (
    <div className={styles.page}>
      <div
        className={styles.banner}
        style={{ ['--hero-bg' as string]: `url(${carruselBg})` } as CSSProperties}
      >
        <div className={styles.slider} style={{ ['--quantity' as string]: slides.length } as CSSProperties}>
          {slides.map((src, index) => (
            <div
              key={src}
              className={styles.item}
              style={{ ['--position' as string]: index + 1, ['--reverse-bg' as string]: `url(${reverseClassic})` } as CSSProperties}
            >
              <div className={`${styles.cardFace} ${styles.faceFront}`} />
              <div className={`${styles.cardFace} ${styles.faceBack}`}>
                <img src={src} alt={`YGO showcase ${index + 1}`} />
              </div>
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
          <h2>InvYGO</h2>
          <p>{t('home.subtitle')}</p>
          <div className={styles.actions}>
            <Link to="/catalog" className={styles.primaryBtn}>
              {t('nav.catalog')}
            </Link>
            <Link to="/inventory" className={styles.ghostBtn}>
              {t('nav.inventory')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
