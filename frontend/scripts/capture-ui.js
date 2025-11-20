const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function captureScreenshots() {
  console.log('📸 Capturing UI screenshots...\n');
  
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const screenshotsDir = path.join(__dirname, '../screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  try {
    // 0. Home Page
    console.log('0️⃣  Navigating to Home page...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '00-home.png'),
      fullPage: true 
    });
    console.log('   ✓ Home page captured\n');

    // 1. Login Page
    console.log('1️⃣  Navigating to Login page...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-login.png'),
      fullPage: true 
    });
    console.log('   ✓ Login page captured\n');

    // 2. Register Page
    console.log('2️⃣  Navigating to Register page...');
    await page.goto('http://localhost:3000/register');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '02-register.png'),
      fullPage: true 
    });
    console.log('   ✓ Register page captured\n');

    // 3. Login as client
    console.log('3️⃣  Logging in as client...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Fill in credentials
    await page.fill('input[type="email"]', 'soporte@concrecol.com');
    await page.fill('input[type="password"]', 'Demo123!');
    
    // Click login button and wait for navigation
    await Promise.race([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ timeout: 5000 }).catch(() => {
        console.log('   ⚠️  Navigation timeout, continuing...');
      })
    ]);
    
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '03-after-login.png'),
      fullPage: true 
    });
    console.log('   ✓ After login captured\n');

    // 4. Client Dashboard
    const currentUrl = page.url();
    if (!currentUrl.includes('/client-dashboard')) {
      console.log('   ℹ️  Not on dashboard, navigating manually...');
      await page.goto('http://localhost:3000/client-dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
    }
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '04-client-dashboard.png'),
      fullPage: true 
    });
    console.log('   ✓ Client Dashboard captured\n');

    // 5. Pro Dashboard - Login as Pro first
    console.log('5️⃣  Logging in as Pro...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await page.fill('input[type="email"]', 'carlos.pintor@gmail.com');
    await page.fill('input[type="password"]', 'Demo123!');
    
    await Promise.race([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ timeout: 5000 }).catch(() => {})
    ]);
    
    await page.waitForTimeout(2000);
    await page.goto('http://localhost:3000/pro-dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '05-pro-dashboard.png'),
      fullPage: true 
    });
    console.log('   ✓ Pro Dashboard captured\n');

    // 6. New Job Form - Go back to client
    console.log('6️⃣  Navigating to New Job Form...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await page.fill('input[type="email"]', 'soporte@concrecol.com');
    await page.fill('input[type="password"]', 'Demo123!');
    
    await Promise.race([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ timeout: 5000 }).catch(() => {})
    ]);
    
    await page.waitForTimeout(2000);
    
    try {
      await page.goto('http://localhost:3000/jobs-new');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      await page.screenshot({ 
        path: path.join(screenshotsDir, '06-new-job-form.png'),
        fullPage: true 
      });
      console.log('   ✓ New Job Form captured\n');
    } catch (e) {
      console.log('   ⚠️  New Job Form not accessible:', e.message);
      await page.screenshot({ 
        path: path.join(screenshotsDir, '06-new-job-error.png'),
        fullPage: true 
      });
    }

    console.log('✅ All screenshots captured successfully!');
    console.log('\n📁 Screenshots saved in: frontend/screenshots/\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'error.png'), 
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

captureScreenshots();
