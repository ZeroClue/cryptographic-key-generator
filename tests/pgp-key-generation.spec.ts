import { test, expect } from '@playwright/test';

test.describe('PGP Key Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should generate PGP ECC key pair successfully', async ({ page }) => {
    // Select PGP / GPG usage
    await page.getByLabel('Select Intended Usage').selectOption('PGP / GPG');

    // Fill user information
    await page.getByLabel('Name (Required)').fill('John Doe');
    await page.getByLabel('Email (Required)').fill('john.doe@example.com');
    await page.getByLabel('Passphrase (Recommended)').fill('securePassphrase123!');
    await page.getByLabel('Confirm Passphrase').fill('securePassphrase123!');

    // Select PGP-ECC algorithm (should be auto-selected)
    await expect(page.getByLabel('Choose Algorithm')).toHaveValue('PGP-ECC-curve25519');

    // Click Generate Key
    await page.getByRole('button', { name: 'Generate Key' }).click();

    // Wait for generation to complete (button text changes back to "Generate Key")
    await expect(page.getByRole('button', { name: 'Generate Key' })).toBeVisible();

    // Verify public key is generated (PGP armored format)
    const publicKeyTextarea = page.locator('textarea').first();
    await expect(publicKeyTextarea).toBeVisible();
    await expect(publicKeyTextarea).toHaveValue(/^-----BEGIN PGP PUBLIC KEY BLOCK-----/);

    // Verify private key is generated (PGP armored format)
    const privateKeyTextarea = page.locator('textarea').nth(1);
    await expect(privateKeyTextarea).toBeVisible();
    await expect(privateKeyTextarea).toHaveValue(/^-----BEGIN PGP PRIVATE KEY BLOCK-----/);

    // Verify key ID is displayed
    await expect(page.getByText('PGP Key ID')).toBeVisible();

    // Verify command line equivalent is shown
    await expect(page.getByText('Command-Line Equivalent')).toBeVisible();
    await expect(page.getByText('gpg --expert --full-generate-key (select ECC > Curve25519)')).toBeVisible();
  });

  test('should generate PGP RSA key pair successfully', async ({ page }) => {
    // Select PGP / GPG usage
    await page.getByLabel('Select Intended Usage').selectOption('PGP / GPG');

    // Fill user information
    await page.getByLabel('Name (Required)').fill('Jane Smith');
    await page.getByLabel('Email (Required)').fill('jane.smith@example.com');
    await page.getByLabel('Passphrase (Recommended)').fill('anotherSecurePass123!');
    await page.getByLabel('Confirm Passphrase').fill('anotherSecurePass123!');

    // Select PGP-RSA algorithm
    await page.getByLabel('Choose Algorithm').selectOption('PGP-RSA');

    // Select 4096 bits
    await page.getByLabel('Key Size / Curve').selectOption('4096');

    // Click Generate Key
    await page.getByRole('button', { name: 'Generate Key' }).click();

    // Wait for generation to complete (button text changes back to "Generate Key")
    await expect(page.getByRole('button', { name: 'Generate Key' })).toBeVisible();

    // Verify public key is generated
    const publicKeyTextarea = page.locator('textarea').first();
    await expect(publicKeyTextarea).toBeVisible();
    await expect(publicKeyTextarea).toHaveValue(/^-----BEGIN PGP PUBLIC KEY BLOCK-----/);

    // Verify private key is generated
    const privateKeyTextarea = page.locator('textarea').nth(1);
    await expect(privateKeyTextarea).toBeVisible();
    await expect(privateKeyTextarea).toHaveValue(/^-----BEGIN PGP PRIVATE KEY BLOCK-----/);

    // Verify key ID is displayed
    await expect(page.getByText('PGP Key ID')).toBeVisible();

    // Verify command line equivalent is shown
    await expect(page.getByText('Command-Line Equivalent')).toBeVisible();
    await expect(page.getByText('gpg --full-generate-key (select RSA > 4096 bits)')).toBeVisible();
  });

  test('should validate PGP user information', async ({ page }) => {
    // Select PGP / GPG usage
    await page.getByLabel('Select Intended Usage').selectOption('PGP / GPG');

    // Try to generate without required fields
    await page.getByRole('button', { name: 'Generate Key' }).click();

    // Should show error message
    await expect(page.getByText('Please fix the errors in the PGP information form.')).toBeVisible();

    // Fill name and email
    await page.getByLabel('Name (Required)').fill('Test User');
    await page.getByLabel('Email (Required)').fill('invalid-email');
    await page.getByRole('button', { name: 'Generate Key' }).click();

    // Should show email validation error
    await expect(page.getByText('Please enter a valid email address.')).toBeVisible();

    // Fix email
    await page.getByLabel('Email (Required)').fill('test@example.com');
    await page.getByLabel('Passphrase (Recommended)').fill('pass');
    await page.getByLabel('Confirm Passphrase').fill('different');

    // Try to generate with mismatched passphrases
    await page.getByRole('button', { name: 'Generate Key' }).click();

    // Should show passphrase mismatch error
    await expect(page.getByText('Passphrases do not match.')).toBeVisible();
  });

  test('should allow exporting PGP keys', async ({ page }) => {
    // Select PGP / GPG usage
    await page.getByLabel('Select Intended Usage').selectOption('PGP / GPG');

    // Fill user information
    await page.getByLabel('Name (Required)').fill('Export Test');
    await page.getByLabel('Email (Required)').fill('export@example.com');
    await page.getByLabel('Passphrase (Recommended)').fill('exportPass123!');
    await page.getByLabel('Confirm Passphrase').fill('exportPass123!');

    // Generate key
    await page.getByRole('button', { name: 'Generate Key' }).click();
    await expect(page.getByRole('button', { name: 'Generate Key' })).not.toBeDisabled();

    // Verify export options are visible
    await expect(page.getByText('PGP Armored Keys')).toBeVisible();

    // Test public key export
    const exportPublicButton = page.getByRole('button', { name: 'Export Public Key (.asc)' });
    await expect(exportPublicButton).toBeVisible();

    // Test private key export (should show security warning)
    const exportPrivateButton = page.getByRole('button', { name: 'Export Private Key (.asc)' });
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

  test('should show correct key titles for PGP', async ({ page }) => {
    // Select PGP / GPG usage
    await page.getByLabel('Select Intended Usage').selectOption('PGP / GPG');

    // Fill user information
    await page.getByLabel('Name (Required)').fill('Title Test');
    await page.getByLabel('Email (Required)').fill('title@example.com');

    // Generate key
    await page.getByRole('button', { name: 'Generate Key' }).click();
    await expect(page.getByRole('button', { name: 'Generate Key' })).toBeVisible();

    // Verify correct titles
    await expect(page.getByRole('heading', { name: 'Public Key (PGP)' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Private Key (PGP)' })).toBeVisible();
  });
});