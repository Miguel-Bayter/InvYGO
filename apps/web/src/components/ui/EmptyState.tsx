import { useTranslation } from 'react-i18next'
import styles from './EmptyState.module.css'

interface Props {
  title?: string
  description?: string
}

export function EmptyState({ title, description }: Props) {
  const { t } = useTranslation()
  const displayTitle = title ?? t('ui.empty.title')
  const displayDesc = description ?? t('ui.empty.default')

  return (
    <div className={styles.wrapper}>
      <span className={styles.icon}>⬡</span>
      <h3 className={styles.title}>{displayTitle}</h3>
      <p className={styles.description}>{displayDesc}</p>
    </div>
  )
}
