import { useTranslation } from 'react-i18next'
import styles from './LanguageToggle.module.css'

export function LanguageToggle() {
  const { i18n } = useTranslation()
  const isEs = i18n.language.startsWith('es')

  return (
    <button
      className={styles.btn}
      onClick={() => void i18n.changeLanguage(isEs ? 'en' : 'es')}
      aria-label={isEs ? 'Switch to English' : 'Cambiar a Español'}
    >
      {isEs ? 'EN' : 'ES'}
    </button>
  )
}
