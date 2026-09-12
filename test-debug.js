const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push('PAGE: ' + err.message));

  // Login as customer (works reliably)
  await page.goto('https://springwellbk.vercel.app/login');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.fill('#username', 'customer');
  await page.fill('#password', 'Test123!@');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(3000);
  console.log('1. On dashboard');

  // Open profile
  const profileBtn = page.locator('button:has-text("Profile"):visible').first();
  await profileBtn.click();
  await page.waitForTimeout(2000);
  console.log('2. Profile opened');

  // Get full HTML of Security section
  const securitySection = await page.evaluate(() => {
    const h4 = Array.from(document.querySelectorAll('h4')).find(h => h.textContent?.includes('Security'));
    if (!h4) return 'NO SECURITY SECTION FOUND';
    const form = h4.nextElementSibling;
    if (!form) return 'NO FORM FOUND';
    return form.outerHTML;
  });
  console.log('3. Security section HTML:\n', securitySection);

  // Check all input types
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map(i => ({
      placeholder: i.placeholder,
      type: i.type,
      className: i.className.substring(0, 80),
    }));
  });
  console.log('4. All inputs:', JSON.stringify(inputs, null, 2));

  // Check all buttons with SVG
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.textContent?.trim().substring(0, 30),
      hasSvg: b.querySelector('svg') !== null,
      svgClass: b.querySelector('svg')?.className?.baseVal?.substring(0, 40) || '',
      visible: b.offsetParent !== null,
      rect: b.getBoundingClientRect(),
    })).filter(b => b.hasSvg);
  });
  console.log('5. SVG buttons:', JSON.stringify(buttons, null, 2));

  // Try clicking the first eye button
  const eyeResult = await page.evaluate(() => {
    const pwInput = document.querySelector('input[placeholder="Current Password"]');
    if (!pwInput) return 'NO CURRENT PASSWORD INPUT';
    
    const parent = pwInput.parentElement;
    const btn = parent?.querySelector('button');
    if (!btn) return 'NO BUTTON IN PARENT';
    
    // Check computed styles
    const inputStyles = window.getComputedStyle(pwInput);
    const btnStyles = window.getComputedStyle(btn);
    
    return {
      inputType: pwInput.type,
      inputPaddingRight: inputStyles.paddingRight,
      inputWidth: inputStyles.width,
      btnPosition: btnStyles.position,
      btnRight: btnStyles.right,
      btnZIndex: btnStyles.zIndex,
      btnDisplay: btnStyles.display,
      btnVisibility: btnStyles.visibility,
      btnPointerEvents: btnStyles.pointerEvents,
      btnWidth: btn.offsetWidth,
      btnHeight: btn.offsetHeight,
      btnRect: btn.getBoundingClientRect(),
    };
  });
  console.log('6. Eye button analysis:', JSON.stringify(eyeResult, null, 2));

  // Click the actual button
  const clickResult = await page.evaluate(() => {
    const pwInput = document.querySelector('input[placeholder="Current Password"]');
    const parent = pwInput?.parentElement;
    const btn = parent?.querySelector('button');
    if (!btn) return 'NO BUTTON';
    
    btn.click();
    
    return { newType: pwInput.type };
  });
  console.log('7. After programmatic click:', clickResult);

  await page.screenshot({ path: '/tmp/debug-admin-pw.png' });

  if (errors.length > 0) {
    console.log('\nConsole errors:', errors);
  }

  await browser.close();
  console.log('\nDone!');
})();
