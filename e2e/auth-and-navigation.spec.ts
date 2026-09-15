import { expect, test } from '@playwright/test'
import { loginAs } from './helpers/auth'

const adminRoutes = [
  '/dashboard',
  '/organisation',
  '/rh',
  '/catalogue',
  '/stocks',
  '/achats',
  '/demandes-achat',
  '/production',
  '/recyclage',
  '/clients',
  '/fournisseurs',
  '/contrats',
  '/commandes',
  '/ventes-directes',
  '/livraisons',
  '/bons-sortie',
  '/factures',
  '/rapports',
]

test.describe('ERP CMP — authentification et navigation E2E', () => {
  test('un visiteur ne voit aucune donnée client avant authentification', async ({
    page,
    }) => {
    await page.goto('/clients')

    await expect(page.getByText('Client Alpha')).toHaveCount(0)
    await expect(page.getByText('Nouveau client')).toHaveCount(0)
    })

  test('une mauvaise connexion affiche une erreur sans créer de session', async ({
    page,
    }) => {
    const email = process.env.E2E_ADMIN_EMAIL

    if (!email) {
        throw new Error('La variable E2E_ADMIN_EMAIL est requise.')
    }

    await page.goto('/login')

    await page.getByLabel('Adresse email', { exact: true }).fill(email)
    await page.locator('input[name="password"]').fill('MotDePasseE2E124')
    await page.getByRole('button', { name: 'Se connecter' }).click()

    await expect(page).toHaveURL(/\/login/)

    await expect(
        page.getByText(/Email ou mot de passe incorrect/i),
    ).toBeVisible()
    })

    test('un administrateur peut se connecter et accéder à tous les modules', async ({
    page,
    }) => {
    test.setTimeout(120_000)

    await loginAs(page, 'admin')

    for (const route of adminRoutes) {
        await page.goto(route, { waitUntil: 'domcontentloaded' })

        await expect(page).not.toHaveURL(/\/login/)
        await expect(page.getByText('Accès restreint')).toHaveCount(0)

        await expect(page.locator('body')).not.toContainText(
        'Application error',
        )
    }
    })

  test('un commercial ne peut pas ouvrir les modules finance, RH ou organisation', async ({
    page,
    }) => {
    await loginAs(page, 'commercial')

    for (const route of ['/factures', '/rh', '/organisation']) {
        await page.goto(route)

        await expect(
        page.getByRole('heading', { name: 'Accès restreint' }),
        ).toBeVisible()

        await expect(
        page.getByText(/Votre profil n.a pas accès à cette page\./),
        ).toBeVisible()
    }
    })

  test('un commercial garde accès à son périmètre métier', async ({ page }) => {
    await loginAs(page, 'commercial')

    for (const route of [
      '/clients',
      '/commandes',
      '/ventes-directes',
      '/livraisons',
      '/contrats',
      '/rapports',
    ]) {
      await page.goto(route)
      await page.waitForLoadState('domcontentloaded')

      await expect(page).not.toHaveURL(/\/login/)
      await expect(page.getByText('Accès restreint')).toHaveCount(0)
    }
  })
})