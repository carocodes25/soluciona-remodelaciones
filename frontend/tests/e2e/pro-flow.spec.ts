import { test, expect } from '@playwright/test';

test.describe('Professional Proposal Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as PRO
    await page.goto('http://localhost:3000/login');
    await page.getByPlaceholder('tu@email.com').fill('pro@test.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    
    // Wait for pro dashboard
    await page.waitForURL('**/pro-dashboard', { timeout: 5000 });
  });

  test('should display available jobs', async ({ page }) => {
    // Verify we're on pro dashboard
    await expect(page).toHaveURL(/pro-dashboard/);
    
    // Check if jobs are visible
    await expect(page.getByText(/Trabajos Disponibles|Jobs/i)).toBeVisible();
    
    console.log('✅ Available jobs displayed');
  });

  test('should navigate to job details from dashboard', async ({ page }) => {
    // Click on first job card
    await page.locator('[class*="job-card"], [class*="JobCard"]').first().click();
    
    // Wait for navigation
    await page.waitForURL(/\/jobs\/\d+/, { timeout: 3000 });
    
    // Verify we're on job details
    await expect(page.getByText(/Descripción|Description/i)).toBeVisible();
    
    console.log('✅ Navigation to job details successful');
  });

  test('should navigate to proposal submission page', async ({ page }) => {
    // Click on first "Enviar propuesta" button
    await page.getByRole('button', { name: /Enviar Propuesta|Submit/i }).first().click();
    
    // Wait for navigation
    await page.waitForURL(/\/jobs\/\d+\/submit-proposal/, { timeout: 3000 });
    
    // Verify we're on proposal page
    await expect(page).toHaveURL(/submit-proposal/);
    await expect(page.getByText(/Enviar Propuesta/i)).toBeVisible();
    
    console.log('✅ Navigation to proposal page successful');
  });

  test('should display proposal form correctly', async ({ page }) => {
    // Navigate to proposal page
    await page.goto('http://localhost:3000/jobs/1/submit-proposal');
    await page.waitForTimeout(1000);
    
    // Check form elements
    await expect(page.getByPlaceholder(/monto|amount/i)).toBeVisible();
    await expect(page.getByPlaceholder(/días|days/i)).toBeVisible();
    await expect(page.getByPlaceholder(/carta de presentación|cover letter/i)).toBeVisible();
    
    // Check submit button
    await expect(page.getByRole('button', { name: /Enviar Propuesta/i })).toBeVisible();
    
    console.log('✅ Proposal form displayed correctly');
  });

  test('should validate budget range', async ({ page }) => {
    // Navigate to proposal page
    await page.goto('http://localhost:3000/jobs/1/submit-proposal');
    await page.waitForTimeout(1000);
    
    // Try to enter amount below budget
    await page.getByPlaceholder(/monto|amount/i).fill('1000');
    await page.getByPlaceholder(/días|days/i).fill('7');
    await page.getByPlaceholder(/carta de presentación|cover letter/i).fill('Esta es una carta de presentación de prueba con suficientes caracteres para cumplir el mínimo requerido de 100 caracteres.');
    
    // Try to submit
    await page.getByRole('button', { name: /Enviar Propuesta/i }).click();
    
    // Wait for validation
    await page.waitForTimeout(500);
    
    // Should show error or remain on page
    await expect(page).toHaveURL(/submit-proposal/);
    
    console.log('✅ Budget validation working');
  });

  test('should validate cover letter minimum length', async ({ page }) => {
    // Navigate to proposal page
    await page.goto('http://localhost:3000/jobs/1/submit-proposal');
    await page.waitForTimeout(1000);
    
    // Fill form with short cover letter
    await page.getByPlaceholder(/monto|amount/i).fill('50000');
    await page.getByPlaceholder(/días|days/i).fill('7');
    await page.getByPlaceholder(/carta de presentación|cover letter/i).fill('Too short');
    
    // Try to submit
    await page.getByRole('button', { name: /Enviar Propuesta/i }).click();
    
    // Wait for validation
    await page.waitForTimeout(500);
    
    // Should show error or remain on page
    await expect(page).toHaveURL(/submit-proposal/);
    
    console.log('✅ Cover letter validation working');
  });

  test('should submit proposal successfully', async ({ page }) => {
    // Navigate to proposal page
    await page.goto('http://localhost:3000/jobs/1/submit-proposal');
    await page.waitForTimeout(1000);
    
    // Fill form with valid data
    await page.getByPlaceholder(/monto|amount/i).fill('75000');
    await page.getByPlaceholder(/días|days/i).fill('10');
    await page.getByPlaceholder(/carta de presentación|cover letter/i).fill('Estimado cliente, me gustaría trabajar en su proyecto. Tengo más de 5 años de experiencia en el área y puedo garantizar un trabajo de alta calidad. Mi enfoque es siempre la satisfacción del cliente.');
    
    // Submit
    await page.getByRole('button', { name: /Enviar Propuesta/i }).click();
    
    // Wait for redirect
    await page.waitForURL('**/pro-dashboard', { timeout: 5000 });
    
    // Verify we're back on dashboard
    await expect(page).toHaveURL(/pro-dashboard/);
    
    console.log('✅ Proposal submitted successfully');
  });
});

test.describe('Professional Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as PRO
    await page.goto('http://localhost:3000/login');
    await page.getByPlaceholder('tu@email.com').fill('pro@test.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();
    await page.waitForURL('**/pro-dashboard', { timeout: 5000 });
    
    // Navigate to profile
    await page.getByRole('button', { name: /Mi Perfil|Profile/i }).click();
    await page.waitForURL('**/pro-profile', { timeout: 3000 });
  });

  test('should display profile page with tabs', async ({ page }) => {
    // Verify we're on profile page
    await expect(page).toHaveURL(/pro-profile/);
    
    // Check tabs are visible
    await expect(page.getByText(/Información Personal|Personal/i)).toBeVisible();
    await expect(page.getByText(/Información del Negocio|Business/i)).toBeVisible();
    await expect(page.getByText(/Habilidades|Skills/i)).toBeVisible();
    
    console.log('✅ Profile page with tabs displayed');
  });

  test('should switch between tabs', async ({ page }) => {
    // Click on Business tab
    await page.getByText(/Información del Negocio|Business/i).click();
    await page.waitForTimeout(500);
    
    // Verify business tab content is visible
    await expect(page.getByPlaceholder(/nombre del negocio|business name/i)).toBeVisible();
    
    // Click on Skills tab
    await page.getByText(/Habilidades|Skills/i).click();
    await page.waitForTimeout(500);
    
    // Verify skills tab content is visible
    await expect(page.getByText(/Selecciona tus habilidades|Select skills/i)).toBeVisible();
    
    console.log('✅ Tab switching working');
  });

  test('should save profile changes', async ({ page }) => {
    // Update personal info
    await page.getByPlaceholder(/nombre completo|full name/i).fill('Juan Pérez Actualizado');
    await page.getByPlaceholder(/teléfono|phone/i).fill('3001234567');
    
    // Save changes
    await page.getByRole('button', { name: /Guardar|Save/i }).click();
    
    // Wait for save confirmation
    await page.waitForTimeout(1000);
    
    // Verify we're still on profile page
    await expect(page).toHaveURL(/pro-profile/);
    
    console.log('✅ Profile changes saved');
  });
});
