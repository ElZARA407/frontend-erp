import { expect, test } from '@playwright/test'
import { loginAs } from './helpers/auth'

function uniqueSuffix() {
  return `${Date.now()}-${Math.floor(Math.random() * 100_000)}`
}

test.describe('ERP CMP — écriture contrôlée client', () => {
  test('un administrateur peut créer, modifier puis archiver un client', async ({
    page,
  }) => {
    const suffix = uniqueSuffix()
    const reference = `E2E-CL-${suffix}`
    const nomInitial = `Client E2E ${suffix}`
    const nomModifie = `Client E2E Modifié ${suffix}`

    await loginAs(page, 'admin')
    await page.goto('/clients')

    await page.getByRole('button', { name: 'Nouveau client' }).click()

    const createDialog = page.getByRole('dialog')

    await expect(
      createDialog.getByRole('heading', { name: 'Nouveau client' }),
    ).toBeVisible()

    await createDialog.locator('input[name="nom"]').fill(nomInitial)
    await createDialog.locator('input[name="reference"]').fill(reference)
    await createDialog
      .locator('input[name="adresse"]')
      .fill('Andraharo, Antananarivo')
    await createDialog
      .locator('input[name="contact"]')
      .fill('+261 34 00 000 00')
    await createDialog
      .locator('input[name="email"]')
      .fill(`e2e-${suffix}@cmp.test`)

    const createResponse = page.waitForResponse((response) => {
    return (
        response.url().includes('/api/backend/v1/commercial/clients') &&
        response.request().method() === 'POST'
    )
    })

    await createDialog
    .getByRole('button', { name: 'Créer le client' })
    .click()

    const response = await createResponse

    expect(
    response.status(),
    `Création client refusée : ${await response.text()}`,
    ).toBe(201)

    await expect(page.getByRole('dialog')).toHaveCount(0)

    const search = page.getByPlaceholder('Rechercher un client...')

    await search.fill(reference)

    const createdRow = page.locator('tbody tr', {
      hasText: reference,
    })

    await expect(createdRow).toBeVisible()
    await expect(createdRow).toContainText(nomInitial)

    await createdRow.getByRole('button', { name: 'Modifier' }).click()

    const updateDialog = page.getByRole('dialog')

    await expect(
      updateDialog.getByRole('heading', { name: 'Modifier le client' }),
    ).toBeVisible()

    const nomInput = updateDialog.locator('input[name="nom"]')

    await expect(nomInput).toHaveValue(nomInitial)

    await nomInput.fill(nomModifie)

    const updateResponse = page.waitForResponse((response) => {
    return (
        response.url().includes('/api/backend/v1/commercial/clients/') &&
        response.request().method() === 'PUT'
    )
    })

    await updateDialog
    .getByRole('button', { name: 'Mettre à jour' })
    .click()

    const response1 = await updateResponse

    expect(
    response1.status(),
    `Mise à jour client refusée : ${await response1.text()}`,
    ).toBe(200)

    await expect(page.getByRole('dialog')).toHaveCount(0)

    await expect(createdRow).toContainText(nomModifie)

    await createdRow.getByRole('button', { name: 'Archiver' }).click()

    const confirmationDialog = page.getByRole('dialog')

    await expect(
      confirmationDialog.getByText('Voulez vous vraiment archiver ce client ?'),
    ).toBeVisible()

    await confirmationDialog.getByRole('button', { name: 'Oui' }).click()

    await expect(createdRow).toHaveCount(0)
  })

  test('un client avec une référence déjà existante est refusé', async ({
    page,
  }) => {
    const suffix = uniqueSuffix()
    const reference = `E2E-DUP-${suffix}`

    await loginAs(page, 'admin')
    await page.goto('/clients')

    async function createClient(nom: string) {
      await page.getByRole('button', { name: 'Nouveau client' }).click()

      const dialog = page.getByRole('dialog')

      await dialog.locator('input[name="nom"]').fill(nom)
      await dialog.locator('input[name="reference"]').fill(reference)
      await dialog
        .locator('input[name="adresse"]')
        .fill('Ankorondrano, Antananarivo')
      await dialog
        .locator('input[name="contact"]')
        .fill('+261 32 00 000 00')

      await dialog.getByRole('button', { name: 'Créer le client' }).click()
    }

    await createClient(`Client E2E Unique ${suffix}`)

    await expect(page.getByRole('dialog')).toHaveCount(0)

    await createClient(`Client E2E Doublon ${suffix}`)

    await expect(page.getByRole('dialog')).toBeVisible()

    await expect(
      page.getByText(/référence.*déjà|reference.*already|already been taken/i),
    ).toBeVisible()
  })
})