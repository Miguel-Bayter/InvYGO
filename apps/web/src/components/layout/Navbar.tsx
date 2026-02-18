import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { LanguageToggle } from './LanguageToggle'
import styles from './Navbar.module.css'

export function Navbar() {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)

  const NAV_LINKS = [
    { to: '/catalog', label: t('nav.catalog') },
    { to: '/inventory', label: t('nav.inventory') },
    { to: '/decks', label: t('nav.decks') },
  ]

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [styles.link, isActive ? styles.linkActive : ''].filter(Boolean).join(' ')

  return (
    <header className={styles.header}>
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between max-w-[1400px] mx-auto px-4 sm:px-6 h-[60px]">
        {/* Brand */}
        <NavLink to="/" className={styles.brand} onClick={() => setMenuOpen(false)}>
          <span className={styles.brandIcon}>⬡</span>
          <span>InvYGO</span>
        </NavLink>

        {/* Desktop links — hidden on mobile */}
        <ul className="hidden sm:flex items-center gap-1 list-none m-0 p-0">
          {NAV_LINKS.map(link => (
            <li key={link.to}>
              <NavLink to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right side: language toggle + hamburger */}
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <button
            className={styles.menuBtn}
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown menu — visible only on mobile when open ── */}
      {menuOpen && (
        <nav className={styles.mobileMenu} aria-label="Mobile navigation">
          <ul className="list-none m-0 p-0">
            {NAV_LINKS.map(link => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={linkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
