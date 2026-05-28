import { useTranslation } from 'react-i18next'
import styles from './LoadingSpinner.module.css'

interface Props {
  label?: string
  variant?: 'scanner' | 'targeting' | 'datastream'
}

export function LoadingSpinner({ label, variant = 'scanner' }: Props) {
  const { t } = useTranslation()
  const displayLabel = label ?? t('ui.loading')

  return (
    <div className={styles.wrapper} role="status" aria-label={displayLabel}>
      <div className={styles.loaderContainer}>
        {variant === 'scanner' && (
          <>
            <div className={styles.ringOuter} />
            <div className={styles.ringMiddle} />
            <div className={styles.ringInner} />
            <div className={styles.scanLine} />
            <div className={styles.coreDot} />
          </>
        )}
        {variant === 'targeting' && (
          <>
            <div className={styles.targetRing} />
            <div className={styles.targetBrackets}>
              <span className={styles.bracket} />
              <span className={styles.bracket} />
              <span className={styles.bracket} />
              <span className={styles.bracket} />
            </div>
            <div className={styles.targetCrosshair} />
          </>
        )}
        {variant === 'datastream' && (
          <>
            <div className={styles.datastream}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className={styles.dataBar} style={{ '--bar-index': i } as React.CSSProperties} />
              ))}
            </div>
            <div className={styles.dataPulse} />
          </>
        )}
      </div>
      <span className={styles.label}>{displayLabel}</span>
    </div>
  )
}
