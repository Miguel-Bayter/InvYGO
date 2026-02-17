import { useTranslation } from 'react-i18next'
import styles from './PlaceholderPage.module.css'

interface Props {
  titleKey: string
  sprint: string
}

export function PlaceholderPage({ titleKey, sprint }: Props) {
  const { t } = useTranslation()

  return (
    <div className={styles.container}>
      <div className={styles.badge}>{sprint}</div>
      <h2 className={styles.title}>{t(titleKey)}</h2>
      <p className={styles.desc}>{t('placeholder.comingSoon')}</p>
    </div>
  )
}
