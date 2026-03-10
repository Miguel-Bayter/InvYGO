import { useTranslation } from 'react-i18next'
import { useDecks } from '../features/decks/context'
import { DeckSidebar } from '../features/decks/components/DeckSidebar'
import { DeckBuilderView } from '../features/decks/components/DeckBuilderView'
import styles from './DecksPage.module.css'

export function DecksPage() {
  const { t } = useTranslation()
  const { activeDeck, decks } = useDecks()
  const deckCount = Object.keys(decks).length

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('nav.decks')}</h1>
        {deckCount > 0 && (
          <span className={styles.deckCount}>{t('decks.page.count', { count: deckCount })}</span>
        )}
      </div>

      <div className={styles.body}>
        <DeckSidebar />

        <div className={styles.builderArea}>
          {activeDeck ? (
            <DeckBuilderView deck={activeDeck} />
          ) : deckCount === 0 ? (
            <div className={styles.noDeckSelected}>
              <span className={styles.noDeckIcon}>⬡</span>
              <h2 className={styles.noDeckTitle}>{t('decks.page.emptyTitle')}</h2>
              <p className={styles.noDeckDesc}>{t('decks.page.emptyDesc')}</p>
            </div>
          ) : (
            <div className={styles.noDeckSelected}>
              <span className={styles.noDeckIcon}>⬡</span>
              <h2 className={styles.noDeckTitle}>{t('decks.page.noDeckTitle')}</h2>
              <p className={styles.noDeckDesc}>{t('decks.page.noDeckDesc')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
