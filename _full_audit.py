import asyncio, sys, io, json, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.async_api import async_playwright

BASE = "https://springwellbk.com"
RESULTS = []

def log(icon, msg):
    line = f"{icon} {msg}"
    RESULTS.append(line)
    print(line, flush=True)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        # ========================================
        # PART 1: HOMEPAGE SMOKE TEST
        # ========================================
        print("\n" + "="*60)
        print("PART 1: HOMEPAGE")
        print("="*60)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        
        console_errors = []
        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        
        resp = await page.goto(BASE, wait_until="networkidle")
        log("✅" if resp.status == 200 else "❌", f"Homepage loads: {resp.status}")
        
        # Check key sections
        for section in ["hero", "services", "about", "contact"]:
            el = await page.query_selector(f"[class*='{section}'], #{section}, section:has-text('{section.title()}')")
            log("✅" if el else "⚠️", f"Section '{section}' present: {'yes' if el else 'no'}")
        
        # Check nav links
        nav_links = await page.query_selector_all("nav a")
        log("✅" if len(nav_links) > 3 else "❌", f"Nav links: {len(nav_links)}")
        
        # Check for Smartsupp loader
        has_smartsupp = await page.evaluate("typeof window.smartsupp !== 'undefined'")
        log("✅" if has_smartsupp else "⚠️", f"Smartsupp loaded: {has_smartsupp}")
        
        console_errors_home = [e for e in console_errors if "smartsupp" not in e.lower()]
        log("✅" if len(console_errors_home) == 0 else "⚠️", f"Console errors: {len(console_errors_home)}")
        for e in console_errors_home[:3]:
            log("  ", e[:120])
        
        await page.close()

        # ========================================
        # PART 2: SIGNUP FLOW
        # ========================================
        print("\n" + "="*60)
        print("PART 2: SIGNUP")
        print("="*60)
        
        test_user = f"testuser_{int(time.time())}"
        test_email = f"{test_user}@test.com"
        test_pass = "TestPass123!"
        
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        resp = await page.goto(f"{BASE}/register", wait_until="networkidle")
        log("✅" if resp.status == 200 else "❌", f"Register page loads: {resp.status}")
        
        # Check form fields
        username_input = await page.query_selector("input[name='username'], input[placeholder*='username' i], input[placeholder*='name' i]")
        email_input = await page.query_selector("input[name='email'], input[type='email']")
        password_input = await page.query_selector("input[name='password'], input[type='password']")
        
        log("✅" if username_input else "❌", f"Username field: {'yes' if username_input else 'no'}")
        log("✅" if email_input else "❌", f"Email field: {'yes' if email_input else 'no'}")
        log("✅" if password_input else "❌", f"Password field: {'yes' if password_input else 'no'}")
        
        # Fill and submit signup
        if username_input and email_input and password_input:
            await username_input.fill(test_user)
            await email_input.fill(test_email)
            await password_input.fill(test_pass)
            
            # Check for confirm password
            confirm = await page.query_selector("input[name='confirmPassword'], input[name='confirm-password'], input[placeholder*='confirm' i]")
            if confirm:
                await confirm.fill(test_pass)
                log("✅", "Confirm password field found and filled")
            
            # Find submit button
            submit = await page.query_selector("button[type='submit']")
            if submit:
                await submit.click()
                await page.wait_for_timeout(5000)
                url = page.url
                log("✅" if "/login" in url or "/dashboard" in url or url == BASE + "/" else "❌", 
                    f"After signup, URL: {url[:80]}")
            else:
                log("❌", "No submit button found")
        else:
            log("❌", "Missing signup form fields")
        
        await page.close()

        # ========================================
        # PART 3: LOGIN FLOW (CUSTOMER)
        # ========================================
        print("\n" + "="*60)
        print("PART 3: LOGIN (CUSTOMER)")
        print("="*60)
        
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        resp = await page.goto(f"{BASE}/login", wait_until="networkidle")
        log("✅" if resp.status == 200 else "❌", f"Login page loads: {resp.status}")
        
        # Check login form
        username_input = await page.query_selector("input[name='username'], input[placeholder*='username' i]")
        password_input = await page.query_selector("input[name='password'], input[type='password']")
        
        log("✅" if username_input else "❌", f"Username field: {'yes' if username_input else 'no'}")
        log("✅" if password_input else "❌", f"Password field: {'yes' if password_input else 'no'}")
        
        if username_input and password_input:
            await username_input.fill("customer")
            await password_input.fill("Test123!@")
            
            submit = await page.query_selector("button[type='submit']")
            if submit:
                await submit.click()
                await page.wait_for_timeout(5000)
                url = page.url
                log("✅" if "/dashboard" in url else "❌", f"After login URL: {url[:80]}")
                
                if "/dashboard" in url:
                    # Check dashboard content
                    content = await page.content()
                    checks = [
                        ("Balance", "balance" in content.lower() or "Balance" in content),
                        ("Transactions", "transaction" in content.lower()),
                        ("Profile", "profile" in content.lower()),
                        ("Transfer", "transfer" in content.lower()),
                    ]
                    for name, ok in checks:
                        log("✅" if ok else "⚠️", f"Dashboard has '{name}': {ok}")
            else:
                log("❌", "No submit button found")
        
        await page.close()

        # ========================================
        # PART 4: CUSTOMER PORTAL BUTTONS
        # ========================================
        print("\n" + "="*60)
        print("PART 4: CUSTOMER PORTAL - BUTTONS & MODALS")
        print("="*60)
        
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        await page.goto(f"{BASE}/login", wait_until="networkidle")
        
        username_input = await page.query_selector("input[name='username'], input[placeholder*='username' i]")
        password_input = await page.query_selector("input[name='password'], input[type='password']")
        
        if username_input and password_input:
            await username_input.fill("customer")
            await password_input.fill("Test123!@")
            submit = await page.query_selector("button[type='submit']")
            if submit:
                await submit.click()
                await page.wait_for_timeout(5000)
        
        if "/dashboard" in page.url:
            # Test activity center buttons
            buttons = await page.query_selector_all("button")
            log("✅", f"Total buttons on dashboard: {len(buttons)}")
            
            # Look for modal trigger buttons
            modal_buttons = []
            for btn in buttons:
                text = (await btn.inner_text()).strip()
                if text and len(text) < 50:
                    modal_buttons.append((text, btn))
            
            for text, btn in modal_buttons[:8]:
                try:
                    await btn.click()
                    await page.wait_for_timeout(1500)
                    modal = await page.query_selector("[role='dialog'], [class*='modal'], [class*='Modal']")
                    log("✅" if modal else "⚠️", f"Button '{text[:30]}' → modal: {'yes' if modal else 'no'}")
                    if modal:
                        close = await modal.query_selector("button[aria-label*='close' i], button:has-text('Close'), button:has-text('×')")
                        if close:
                            await close.click()
                            await page.wait_for_timeout(500)
                        else:
                            await page.keyboard.press("Escape")
                            await page.wait_for_timeout(500)
                except Exception as e:
                    log("⚠️", f"Button '{text[:30]}' error: {str(e)[:60]}")
        
        await page.close()

        # ========================================
        # PART 5: ADMIN LOGIN & PORTAL
        # ========================================
        print("\n" + "="*60)
        print("PART 5: ADMIN PORTAL")
        print("="*60)
        
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        await page.goto(f"{BASE}/login", wait_until="networkidle")
        
        username_input = await page.query_selector("input[name='username'], input[placeholder*='username' i]")
        password_input = await page.query_selector("input[name='password'], input[type='password']")
        
        if username_input and password_input:
            await username_input.fill("admin")
            await password_input.fill("Admin123!@")
            submit = await page.query_selector("button[type='submit']")
            if submit:
                await submit.click()
                await page.wait_for_timeout(5000)
                url = page.url
                log("✅" if "/admin" in url or "/dashboard" in url else "❌", f"Admin login URL: {url[:80]}")
        
        if "/admin" in page.url or "/dashboard" in page.url:
            content = await page.content()
            
            # Check admin-specific elements
            admin_checks = [
                ("User Management", "user" in content.lower() and ("manage" in content.lower() or "admin" in content.lower())),
                ("Transactions", "transaction" in content.lower()),
                ("Credit/Debit", "credit" in content.lower() or "debit" in content.lower()),
                ("Transfer", "transfer" in content.lower()),
            ]
            for name, ok in admin_checks:
                log("✅" if ok else "⚠️", f"Admin has '{name}': {ok}")
            
            # Test admin buttons
            buttons = await page.query_selector_all("button")
            log("✅", f"Admin total buttons: {len(buttons)}")
            
            admin_modal_buttons = []
            for btn in buttons:
                try:
                    text = (await btn.inner_text()).strip()
                    if text and len(text) < 50:
                        admin_modal_buttons.append((text, btn))
                except:
                    pass
            
            for text, btn in admin_modal_buttons[:10]:
                try:
                    await btn.click()
                    await page.wait_for_timeout(1500)
                    modal = await page.query_selector("[role='dialog'], [class*='modal'], [class*='Modal']")
                    log("✅" if modal else "⚠️", f"Admin button '{text[:30]}' → modal: {'yes' if modal else 'no'}")
                    if modal:
                        close = await modal.query_selector("button[aria-label*='close' i], button:has-text('Close'), button:has-text('×')")
                        if close:
                            await close.click()
                            await page.wait_for_timeout(500)
                        else:
                            await page.keyboard.press("Escape")
                            await page.wait_for_timeout(500)
                except Exception as e:
                    log("⚠️", f"Admin button '{text[:30]}' error: {str(e)[:60]}")
        
        await page.close()

        # ========================================
        # SUMMARY
        # ========================================
        print("\n" + "="*60)
        print("SUMMARY")
        print("="*60)
        passed = sum(1 for r in RESULTS if r.startswith("✅"))
        failed = sum(1 for r in RESULTS if r.startswith("❌"))
        warnings = sum(1 for r in RESULTS if r.startswith("⚠️"))
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"⚠️ Warnings: {warnings}")
        
        await browser.close()

asyncio.run(main())
