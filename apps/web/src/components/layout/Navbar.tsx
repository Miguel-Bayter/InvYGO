import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { LanguageToggle } from './LanguageToggle'
import styles from './Navbar.module.css'

export function Navbar() {
  const { t } = useTranslation()

  const NAV_LINKS = [
    { to: '/catalog', label: t('nav.catalog') },
    { to: '/inventory', label: t('nav.inventory') },
    { to: '/decks', label: t('nav.decks') },
    { to: '/missing', label: t('nav.missing') },
  ]

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <NavLink to="/" className={styles.brand}>
          <span className={styles.brandIcon}>⬡</span>
          <span>InvYgo</span>
        </NavLink>
        <ul className={styles.links}>
          {NAV_LINKS.map(link => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  [styles.link, isActive ? styles.linkActive : ''].join(' ')
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <LanguageToggle />
      </nav>
    </header>
  )
}
