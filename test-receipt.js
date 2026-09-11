const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  // Login
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.fill('#username', 'customer');
  await page.fill('#password', 'Test123!@');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  await page.waitForLoadState('networkidle');
  console.log('1. Dashboard loaded - URL:', page.url());

  // Click first transaction row (div with cursor-pointer)
  const txRow = page.locator('div.cursor-pointer').first();
  const count = await txRow.count();
  console.log('2. Transaction rows found:', count);

  if (count > 0) {
    await txRow.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/test-receipt-modal.png' });
    console.log('3. Clicked transaction');

    // Check modal
    const receipt = await page.locator('text=Transaction Receipt').count();
    console.log('4. Receipt modal visible:', receipt > 0);

    const download = await page.locator('text=Download Receipt').count();
    console.log('5. Download button visible:', download > 0);

    // Check logo
    const logo = await page.locator('img[alt="SpringWell Bank"]').count();
    console.log('6. Logo image visible:', logo > 0);

    // Check modal width
    const modal = await page.locator('.max-w-\\[400px\\]').first();
    if (await modal.count() > 0) {
      const box = await modal.boundingBox();
      console.log('7. Modal width:', box?.width, 'px');
    } else {
      console.log('7. Modal element not found with that selector');
    }
  }

  await browser.close();
  console.log('\nDone!');
})();
