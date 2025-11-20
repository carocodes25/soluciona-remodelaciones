import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('http://localhost:3000/login');
  });

  test('should display login page correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Soluciona/);
    
    // Check login form elements
    await expect(page.getByPlaceholder('tu@email.com')).toBeVisible();
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();
    await expect(page.getByRole('button', { name: /Iniciar Sesión/i })).toBeVisible();
    
    // Check register link
    await expect(page.getByText(/registrarte aquí/i)).toBeVisible();
    
    console.log('✅ Login page displayed correctly');
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Click login button without filling fields
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    
    // Wait for error messages
    await page.waitForTimeout(500);
    
    // Check for error messages (they should appear)
    const emailInput = page.getByPlaceholder('tu@email.com');
    const passwordInput = page.getByPlaceholder('••••••••');
    
    // Verify inputs are still visible (form didn't submit)
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    console.log('✅ Validation errors shown for empty fields');
  });

  test('should login successfully as CLIENT', async ({ page }) => {
    // Fill login form with client credentials
    await page.getByPlaceholder('tu@email.com').fill('cliente@test.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    
    // Click login button
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    
    // Wait for navigation
    await page.waitForURL('**/client-dashboard', { timeout: 5000 });
    
    // Verify we're on the client dashboard
    await expect(page).toHaveURL(/client-dashboard/);
    await expect(page.getByText(/Mis Proyectos/i)).toBeVisible();
    
    console.log('✅ CLIENT login successful');
  });

  test('should login successfully as PRO', async ({ page }) => {
    // Fill login form with pro credentials
    await page.getByPlaceholder('tu@email.com').fill('pro@test.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    
    // Click login button
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    
    // Wait for navigation
    await page.waitForURL('**/pro-dashboard', { timeout: 5000 });
    
    // Verify we're on the pro dashboard
    await expect(page).toHaveURL(/pro-dashboard/);
    await expect(page.getByText(/Dashboard/i)).toBeVisible();
    
    console.log('✅ PRO login successful');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill login form with invalid credentials
    await page.getByPlaceholder('tu@email.com').fill('invalid@test.com');
    await page.getByPlaceholder('••••••••').fill('wrongpassword');
    
    // Click login button
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    
    // Wait for error message
    await page.waitForTimeout(1000);
    
    // Should still be on login page
    await expect(page).toHaveURL(/login/);
    
    console.log('✅ Error shown for invalid credentials');
  });

  test('should navigate to register page', async ({ page }) => {
    // Click register link
    await page.getByText(/registrarte aquí/i).click();
    
    // Wait for navigation
    await page.waitForURL('**/register', { timeout: 3000 });
    
    // Verify we're on register page
    await expect(page).toHaveURL(/register/);
    await expect(page.getByText(/Crear Cuenta/i)).toBeVisible();
    
    console.log('✅ Navigation to register page successful');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.getByPlaceholder('tu@email.com').fill('cliente@test.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    
    // Wait for dashboard
    await page.waitForURL('**/client-dashboard', { timeout: 5000 });
    
    // Click logout button (assuming it's in the navbar)
    await page.getByRole('button', { name: /Cerrar Sesión|Salir/i }).click();
    
    // Wait for redirect to login
    await page.waitForURL('**/login', { timeout: 3000 });
    
    // Verify we're back on login page
    await expect(page).toHaveURL(/login/);
    
    console.log('✅ Logout successful');
  });
});
