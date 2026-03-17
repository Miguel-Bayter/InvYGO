import { test, expect } from '@playwright/test'

// ── Homepage ───────────────────────────────────────────────────────────────────

test('homepage renders logo and nav links', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/InvYGO/)
  await expect(page.getByRole('link', { name: /catálogo|catalog/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /inventario|inventory/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /deck builder/i })).toBeVisible()
})

// ── Catalog ────────────────────────────────────────────────────────────────────

test('catalog page shows search input', async ({ page }) => {
  await page.goto('/catalog')
  // Target the name search input specifically (there are also ATK/DEF inputs)
  const searchInput = page.getByPlaceholder(/search card by name|buscar carta/i)
  await expect(searchInput).toBeVisible()
})

test('catalog search returns results for "Dark Magician"', async ({ page }) => {
  await page.goto('/catalog')
  const input = page.getByPlaceholder(/search card by name|buscar carta/i)
  await input.fill('Dark Magician')
  // Card images have alt="{card.name}" — unambiguous and only present when results render.
  // Allow up to 15s: 400ms debounce + external API response time.
  await expect(page.locator('img[alt="Dark Magician"]').first()).toBeVisible({ timeout: 15000 })
})

// ── Inventory ──────────────────────────────────────────────────────────────────

test('inventory page renders without crashing', async ({ page }) => {
  await page.goto('/inventory')
  await expect(page.locator('body')).not.toContainText('Algo salió mal')
  await expect(page.locator('body')).not.toContainText('Something went wrong')
})

// ── Deck Builder ───────────────────────────────────────────────────────────────

test('deck builder shows new deck button', async ({ page }) => {
  await page.goto('/decks')
  const newBtn = page.getByRole('button', { name: /nuevo|new/i })
  await expect(newBtn).toBeVisible()
})

test('deck builder can create a new deck', async ({ page }) => {
  await page.goto('/decks')
  const newBtn = page.getByRole('button', { name: /nuevo|new/i })
  await newBtn.click()
  // A new deck entry should appear in the sidebar
  await expect(page.getByText(/nuevo deck|new deck/i).first()).toBeVisible()
})

// ── Navigation ─────────────────────────────────────────────────────────────────

test('can navigate between all pages without errors', async ({ page }) => {
  const routes = ['/', '/catalog', '/inventory', '/decks']
  for (const route of routes) {
    await page.goto(route)
    await expect(page.locator('body')).not.toContainText('Algo salió mal')
    // Navbar renders as <header>
    await expect(page.locator('header').first()).toBeVisible()
  }
})
