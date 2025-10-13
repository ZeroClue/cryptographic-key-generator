import { test, expect } from '@playwright/test';

test.describe('SSH Key Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should generate SSH RSA key pair successfully', async ({ page }) => {
    // Ensure we're in generate mode (default)
    await expect(page.getByRole('button', { name: 'Generate New Key' })).toHaveAttribute('aria-pressed', 'true');

    // Select SSH Authentication usage
    await page.getByLabel('Select Intended Usage').selectOption('SSH Authentication');

    // Select SSH-RSA algorithm
    await page.getByLabel('Choose Algorithm').selectOption('SSH-RSA');

    // Select 2048 bits key size
    await page.getByLabel('Key Size / Curve').selectOption('2048');

    // Click Generate Key
    await page.getByRole('button', { name: 'Generate Key' }).click();

    // Wait for generation to complete
    await expect(page.getByRole('button', { name: 'Generate Key' })).not.toBeDisabled();

    // Verify public key is generated and contains 'ssh-rsa'
    const publicKeyTextarea = page.locator('textarea').first();
    await expect(publicKeyTextarea).toBeVisible();
    await expect(publicKeyTextarea).toHaveValue(/ssh-rsa/);

    // Verify private key is generated (default is PEM format for SSH)
    const privateKeyTextarea = page.locator('textarea').nth(1);
    await expect(privateKeyTextarea).toBeVisible();
    await expect(privateKeyTextarea).toHaveValue(/^-----BEGIN PRIVATE KEY-----/);

    // Verify command line equivalent is shown
    await expect(page.getByText('Command-Line Equivalent')).toBeVisible();
    await expect(page.getByText('ssh-keygen -t rsa -b 2048 -C "user@hostname"')).toBeVisible();
  });

  test('should generate SSH ECDSA key pair successfully', async ({ page }) => {
    // Select SSH Authentication usage
    await page.getByLabel('Select Intended Usage').selectOption('SSH Authentication');

    // Select SSH-ECDSA algorithm
    await page.getByLabel('Choose Algorithm').selectOption('SSH-ECDSA');

    // Select P256 curve
    await page.getByLabel('Key Size / Curve').selectOption('P256');

    // Click Generate Key
    await page.getByRole('button', { name: 'Generate Key' }).click();

    // Wait for generation to complete
    await expect(page.getByRole('button', { name: 'Generate Key' })).not.toBeDisabled();

    // Verify public key is generated and contains 'ecdsa-sha2-nistp256'
    const publicKeyTextarea = page.locator('textarea').first();
    await expect(publicKeyTextarea).toBeVisible();
    await expect(publicKeyTextarea).toHaveValue(/ecdsa-sha2-nistp256/);

    // Verify private key is generated (default is PEM format for SSH)
    const privateKeyTextarea = page.locator('textarea').nth(1);
    await expect(privateKeyTextarea).toBeVisible();
    await expect(privateKeyTextarea).toHaveValue(/^-----BEGIN PRIVATE KEY-----/);

    // Verify command line equivalent is shown
    await expect(page.getByText('Command-Line Equivalent')).toBeVisible();
    await expect(page.getByText('ssh-keygen -t ecdsa -b 256 -C "user@hostname"')).toBeVisible();
  });

  test('should allow exporting SSH keys', async ({ page }) => {
    // Select SSH Authentication usage
    await page.getByLabel('Select Intended Usage').selectOption('SSH Authentication');

    // Select SSH-RSA algorithm
    await page.getByLabel('Choose Algorithm').selectOption('SSH-RSA');

    // Select 2048 bits
    await page.getByLabel('Key Size / Curve').selectOption('2048');

    // Generate key
    await page.getByRole('button', { name: 'Generate Key' }).click();
    await expect(page.getByRole('button', { name: 'Generate Key' })).not.toBeDisabled();

    // Verify export options are visible
    await expect(page.getByText('Export Options')).toBeVisible();

    // Test public key export (should not show warning)
    const exportPublicButton = page.getByRole('button', { name: 'Export Public Key (.pub)' });
    await expect(exportPublicButton).toBeVisible();

    // Test private key export (should show warning modal)
    const exportPrivateButton = page.getByRole('button', { name: 'Export Private Key (.pem)' });
    await expect(exportPrivateButton).toBeVisible();

    // Click private key export to trigger warning
    await exportPrivateButton.click();

    // Verify security warning modal appears
    await expect(page.getByText('Security Warning')).toBeVisible();
    await expect(page.getByText('You are about to export a private key')).toBeVisible();

    // Cancel the export
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Verify modal is closed
    await expect(page.getByText('Security Warning')).not.toBeVisible();
  });

  test('should show correct key titles for SSH', async ({ page }) => {
    // Select SSH Authentication usage
    await page.getByLabel('Select Intended Usage').selectOption('SSH Authentication');

    // Select SSH-RSA
    await page.getByLabel('Choose Algorithm').selectOption('SSH-RSA');

    // Generate key
    await page.getByRole('button', { name: 'Generate Key' }).click();
    await expect(page.getByRole('button', { name: 'Generate Key' })).not.toBeDisabled();

    // Verify correct titles using role selectors to avoid ambiguity
    await expect(page.getByRole('heading', { name: 'Public Key (SSH Format)' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Private Key' })).toBeVisible();
  });
});