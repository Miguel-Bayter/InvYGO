import { useTranslation } from 'react-i18next'
import styles from './HomePage.module.css'

export function HomePage() {
  const { t } = useTranslation()

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>
          <span className={styles.titleAccent}>Inv</span>Ygo
        </h1>
        <p className={styles.subtitle}>{t('home.subtitle')}</p>
        <div className={styles.grid}>
          <StatusCard
            label={t('home.stats.catalog')}
            value="~12K+"
            description={t('home.stats.cardsAvailable')}
          />
          <StatusCard
            label={t('home.stats.inventory')}
            value="0"
            description={t('home.stats.cardsRegistered')}
          />
          <StatusCard
            label={t('home.stats.decks')}
            value="0"
            description={t('home.stats.activeDecks')}
          />
          <StatusCard
            label={t('home.stats.missing')}
            value="—"
            description={t('home.stats.noActiveDeck')}
          />
        </div>
      </div>
    </div>
  )
}

function StatusCard({
  label,
  value,
  description,
}: {
  label: string
  value: string
  description: string
}) {
  return (
    <div className={styles.card}>
      <span className={styles.cardLabel}>{label}</span>
      <span className={styles.cardValue}>{value}</span>
      <span className={styles.cardDesc}>{description}</span>
    </div>
  )
}
