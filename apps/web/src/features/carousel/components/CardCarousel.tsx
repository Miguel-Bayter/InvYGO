import type { CSSProperties } from 'react'
import type { CarouselCard, CarouselInnerStyle, CarouselOuterFace } from '../types'
import reverseClassic from '@/assets/reverse/reverse-classic.jpg'
import reverseAnime from '@/assets/reverse/reverse-anime.jpg'
import styles from './CardCarousel.module.css'

interface Props {
  cards: CarouselCard[]
  innerStyle: CarouselInnerStyle
  outerFace: CarouselOuterFace
}

export function CardCarousel({ cards, innerStyle, outerFace }: Props) {
  const reverseTexture = innerStyle === 'anime' ? reverseAnime : reverseClassic

  return (
    <div
      className={styles.slider}
      style={{ ['--quantity' as string]: cards.length } as CSSProperties}
    >
      {cards.map((card, index) => (
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
          {outerFace === 'reverse' ? (
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
  )
}
