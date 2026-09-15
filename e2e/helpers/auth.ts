import { expect, type Page } from '@playwright/test'

type E2eUser = 'admin' | 'commercial'

function credentialsFor(user: E2eUser) {
  const email =
    user === 'admin'
      ? process.env.E2E_ADMIN_EMAIL
      : process.env.E2E_COMMERCIAL_EMAIL

  const password =
    user === 'admin'
      ? process.env.E2E_ADMIN_PASSWORD
      : process.env.E2E_COMMERCIAL_PASSWORD

  if (!email || !password) {
    throw new Error(
      `Identifiants E2E absents pour ${user}. Configurez les variables E2E_${user.toUpperCase()}_EMAIL et E2E_${user.toUpperCase()}_PASSWORD.`,
    )
  }

  return { email, password }
}

export async function loginAs(page: Page, user: E2eUser) {
  const credentials = credentialsFor(user)

  await page.goto('/login')

  await page.getByLabel('Adresse email', { exact: true }).fill(credentials.email)

  await page
    .locator('input[name="password"]')
    .fill(credentials.password)

  const loginResponse = page.waitForResponse(
    (res) => res.url().includes('/auth/login') && res.request().method() === 'POST',
  )

  await page.getByRole('button', { name: 'Se connecter' }).click()
  await loginResponse

  await page.waitForURL(/\/dashboard$/, { timeout: 10_000 })
}

export async function logout(page: Page) {
  const logoutButton = page.getByRole('button', { name: 'Déconnexion' })

  if (await logoutButton.count()) {
    await logoutButton.click()
    await expect(page).toHaveURL(/\/login/)
  }
}