import { useTranslation } from 'react-i18next'
import styles from './ErrorMessage.module.css'

interface Props {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorMessage({ title, message, onRetry }: Props) {
  const { t } = useTranslation()
  const displayTitle = title ?? t('ui.error.connectionTitle')
  const displayMessage = message ?? t('ui.error.connectionMessage')

  return (
    <div className={styles.wrapper} role="alert">
      <span className={styles.icon}>⚠</span>
      <h3 className={styles.title}>{displayTitle}</h3>
      <p className={styles.message}>{displayMessage}</p>
      {onRetry && (
        <button className={styles.retry} onClick={onRetry}>
          {t('ui.error.retry')}
        </button>
      )}
    </div>
  )
}
