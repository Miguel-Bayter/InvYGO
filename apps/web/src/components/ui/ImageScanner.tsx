import styles from './ImageScanner.module.css'

interface Props {
  aspectRatio?: string
}

export function ImageScanner({ aspectRatio = '59 / 86' }: Props) {
  return (
    <div className={styles.scanner} style={{ aspectRatio }}>
      <div className={styles.gridOverlay} />
      <div className={styles.scanBeam} />
      <div className={styles.cornerMarkers}>
        <span className={styles.corner} />
        <span className={styles.corner} />
        <span className={styles.corner} />
        <span className={styles.corner} />
      </div>
      <div className={styles.dataLines}>
        <span className={styles.dataLine} />
        <span className={styles.dataLine} />
        <span className={styles.dataLine} />
      </div>
    </div>
  )
}
