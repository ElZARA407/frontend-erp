import { expect, test } from '@playwright/test'
import { loginAs } from './helpers/auth'

test.describe('ERP CMP — parcours de lecture critiques', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin')
  })

  test('les listes principales s’ouvrent sans erreur visible', async ({
    page,
  }) => {
    const pages = [
      { url: '/catalogue', title: /Catalogue/i },
      { url: '/stocks', title: /Stock/i },
      { url: '/clients', title: /^Clients$/i },
      { url: '/fournisseurs', title: /Fournisseurs/i },
      { url: '/commandes', title: /Commandes/i },
      { url: '/ventes-directes', title: /Ventes directes/i },
      { url: '/achats', title: /Achats|Bons de réception/i },
      { url: '/production', title: /Ordre de fabrication/i },
      { url: '/recyclage', title: /Recyclage/i },
      { url: '/livraisons', title: /Livraisons/i },
      { url: '/bons-sortie', title: /Bons de sortie/i },
      { url: '/factures', title: /Factures/i },
      { url: '/rapports', title: /Rapports/i },
    ]

    for (const current of pages) {
      await page.goto(current.url)
      await page.waitForLoadState('domcontentloaded')

      await expect(
        page.getByRole('heading', { name: current.title }).first(),
        ).toBeVisible()

      await expect(page.locator('body')).not.toContainText(
        'Impossible de joindre le service ERP.',
      )
    }
  })

  test('la recherche et les filtres restent utilisables sur les clients', async ({
    page,
  }) => {
    await page.goto('/clients')

    const search = page.getByPlaceholder('Rechercher un client...')

    await expect(search).toBeVisible()

    await search.fill('test')
    await page.getByRole('button', { name: 'Inactifs' }).click()
    await page.getByRole('button', { name: 'Tous' }).click()

    await expect(search).toHaveValue('test')
  })

    test('les filtres de ventes directes restent utilisables', async ({
        page,
        }) => {
        await page.goto('/ventes-directes')

        await page.getByRole('button', { name: 'Brouillons' }).click()

        await expect(
            page.getByRole('button', { name: 'Brouillons' }),
        ).toHaveClass(/bg-steel-700/)

        const dateDebut = page.locator('input#du')
        const dateFin = page.locator('input#au')

        await dateDebut.fill('2026-01-01')
        await dateFin.fill('2026-01-31')

        await expect(dateDebut).toHaveValue('2026-01-01')
        await expect(dateFin).toHaveValue('2026-01-31')
    })

    test('les formulaires critiques peuvent être ouverts puis fermés sans écrire de données', async ({
        page,
        }) => {
        await page.goto('/clients')

        await page.getByRole('button', { name: 'Nouveau client' }).click()

        const clientDialog = page.getByRole('dialog')

        await expect(
            clientDialog.getByRole('heading', { name: 'Nouveau client' }),
        ).toBeVisible()

        await clientDialog.getByRole('button', { name: 'Fermer' }).click()

        await expect(page.getByRole('dialog')).toHaveCount(0)

        await page.goto('/ventes-directes')

        await page.getByRole('button', { name: 'Nouvelle vente' }).click()

        const venteDialog = page.getByRole('dialog')

        await expect(
            venteDialog.getByRole('heading', {
            name: 'Nouvelle vente directe',
            }),
        ).toBeVisible()

        await venteDialog.getByRole('button', { name: 'Fermer' }).click()

        await expect(page.getByRole('dialog')).toHaveCount(0)
    })
})