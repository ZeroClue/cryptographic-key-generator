import { test, expect } from '@playwright/test';

test.describe('Success Toast', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Wait for React to hydrate
    await page.waitForSelector('button', { timeout: 10000 });
  });

  test('should show success toast in top-right corner after key generation', async ({ page }) => {
    // Select Symmetric Encryption usage (fastest to generate)
    await page.getByLabel('Select Intended Usage').selectOption('Symmetric Encryption');

    // Select AES algorithm
    await page.getByLabel('Choose Algorithm').selectOption('AES-256-GCM');

    // Click Generate Key
    await page.getByRole('button', { name: 'Generate Key' }).click();

    // Wait for generation to complete
    await expect(page.getByRole('button', { name: 'Generate Key' })).not.toBeDisabled();

    // Verify success toast appears
    const successToast = page.locator('.fixed.top-4.right-4.z-50');
    await expect(successToast).toBeVisible();

    // Verify toast has correct styling (green background)
    await expect(successToast.locator('.bg-green-600')).toBeVisible();

    // Verify toast shows success message
    await expect(successToast.getByText('Key generated successfully!')).toBeVisible();

    // Verify toast has checkmark icon
    await expect(successToast.locator('svg')).toBeVisible();

    // Verify toast auto-dismisses after 3 seconds
    await expect(successToast).not.toBeVisible({ timeout: 4000 });
  });

  test('should show success toast for asymmetric key generation', async ({ page }) => {
    // Select Asymmetric Encryption usage
    await page.getByLabel('Select Intended Usage').selectOption('Asymmetric Encryption');

    // Wait for algorithm options to update
    await page.waitForTimeout(100);

    // Select RSA algorithm (smaller key size for faster test)
    await page.getByLabel('Choose Algorithm').selectOption('RSA-OAEP (SHA-256)');

    // Wait for key size options to update
    await page.waitForTimeout(100);

    // Select 2048 bits (smaller than default)
    await page.getByLabel('Key Size / Curve').selectOption('2048');

    // Click Generate Key
    await page.getByRole('button', { name: 'Generate Key' }).click();

    // Wait for generation to complete (RSA takes longer)
    await expect(page.getByRole('button', { name: 'Generate Key' })).not.toBeDisabled({ timeout: 30000 });

    // Verify success toast appears
    const successToast = page.locator('.fixed.top-4.right-4.z-50');
    await expect(successToast).toBeVisible();

    // Verify toast shows success message
    await expect(successToast.getByText('Key generated successfully!')).toBeVisible();

    // Verify toast is in top-right corner
    const box = await successToast.boundingBox();
    expect(box?.x).toBeGreaterThan(0); // Not on left edge
    expect(box?.y).toBeLessThan(100); // Near top
  });

  test('should show success toast for PGP key generation', async ({ page }) => {
    // Select PGP usage
    await page.getByLabel('Select Intended Usage').selectOption('PGP / GPG');

    // Fill in required PGP information
    await page.getByLabel('Name (Required)').fill('Test User');
    await page.getByLabel('Email (Required)').fill('test@example.com');

    // Click Generate Key
    await page.getByRole('button', { name: 'Generate Key' }).click();

    // Wait for generation to complete (PGP takes longer)
    await expect(page.getByRole('button', { name: 'Generate Key' })).not.toBeDisabled({ timeout: 30000 });

    // Verify success toast appears
    const successToast = page.locator('.fixed.top-4.right-4.z-50');
    await expect(successToast).toBeVisible();

    // Verify toast shows success message
    await expect(successToast.getByText('Key generated successfully!')).toBeVisible();
  });
});
