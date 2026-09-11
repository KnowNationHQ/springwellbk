const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  // Login as admin
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.fill('#username', 'admin');
  await page.fill('#password', 'Admin123!@');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);
  await page.waitForLoadState('networkidle');
  console.log('1. URL:', page.url());

  // Click Profile in Quick Actions or nav
  const profileBtn = page.locator('text=Profile').first();
  console.log('2. Profile button count:', await profileBtn.count());
  if (await profileBtn.count() > 0) {
    await profileBtn.click();
    await page.waitForTimeout(1500);
  }

  await page.screenshot({ path: '/tmp/admin-pw-modal.png', fullPage: true });
  console.log('3. Screenshot taken');

  // Find password inputs
  const pwInputs = await page.locator('input[placeholder*="Password" i], input[placeholder*="password" i]').all();
  console.log('4. Password inputs found:', pwInputs.length);

  for (const input of pwInputs) {
    const ph = await input.getAttribute('placeholder');
    const type = await input.getAttribute('type');
    console.log(`   - "${ph}" type="${type}"`);
  }

  // Find eye toggle buttons near password fields
  const allBtns = await page.locator('button').all();
  console.log('5. Total buttons:', allBtns.length);
  for (let i = 0; i < allBtns.length; i++) {
    const text = await allBtns[i].innerText();
    const svg = await allBtns[i].locator('svg').count();
    if (svg > 0 && text.trim() === '') {
      const box = await allBtns[i].boundingBox();
      console.log(`   Button ${i}: empty SVG button at y=${box?.y?.toFixed(0)}`);
    }
  }

  // Try clicking the first eye toggle near password
  const toggleBtns = page.locator('button:has(svg.lucide-eye), button:has(svg.lucide-eye-off)');
  const toggleCount = await toggleBtns.count();
  console.log('6. Eye toggle buttons:', toggleCount);

  if (toggleCount > 0) {
    await toggleBtns.first().click();
    await page.waitForTimeout(500);
    const pwType = await pwInputs[0].getAttribute('type');
    console.log('7. After toggle, first pw type:', pwType);
    await page.screenshot({ path: '/tmp/admin-pw-toggled.png' });
  } else {
    // Check for any small button near password fields
    const pwField = page.locator('input[placeholder*="Current Password" i]').first();
    if (await pwField.count() > 0) {
      const box = await pwField.boundingBox();
      console.log('7. Current Password field at:', box);
      // Click right side of the field where toggle should be
      if (box) {
        await page.mouse.click(box.x + box.width - 20, box.y + box.height / 2);
        await page.waitForTimeout(500);
        const pwType = await pwField.getAttribute('type');
        console.log('8. After click near field, type:', pwType);
        await page.screenshot({ path: '/tmp/admin-pw-clicked.png' });
      }
    }
  }

  await browser.close();
  console.log('\nDone!');
})();
