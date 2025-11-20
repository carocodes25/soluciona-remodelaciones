const { chromium } = require('playwright');

async function testJobsNew() {
  console.log('📸 Capturando página de crear trabajo...\n');
  
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    // Login
    console.log('1️⃣  Iniciando sesión...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', 'soporte@concrecol.com');
    await page.fill('input[type="password"]', 'Demo123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Go to jobs-new
    console.log('2️⃣  Navegando a crear trabajo...');
    await page.goto('http://localhost:3000/jobs-new');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Paso 1
    await page.screenshot({ path: 'screenshots/jobs-new-step1.png', fullPage: true });
    console.log('   ✓ Paso 1 capturado');
    
    // Llenar paso 1
    await page.fill('input[placeholder*="Remodelación"]', 'Remodelación completa de cocina moderna');
    await page.fill('textarea', 'Necesito remodelar completamente mi cocina. El espacio es de 15m2 aproximadamente. Quiero instalar gabinetes nuevos en madera, mesón en cuarzo, cambiar la grifería, pintar paredes y colocar piso porcelanato. También necesito que revisen las conexiones eléctricas.');
    await page.click('button:has-text("Siguiente")');
    await page.waitForTimeout(1500);
    
    // Paso 2 - categorías
    await page.screenshot({ path: 'screenshots/jobs-new-step2.png', fullPage: true });
    console.log('   ✓ Paso 2 capturado (categorías)');
    
    console.log('\n✅ Screenshots guardados en screenshots/');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testJobsNew();
