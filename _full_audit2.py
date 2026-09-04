import asyncio, sys, io, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.async_api import async_playwright

BASE = "https://springwellbk.com"
RESULTS = []

def log(icon, msg):
    line = f"{icon} {msg}"
    RESULTS.append(line)
    print(line, flush=True)

async def safe_click(page, text_query, timeout=3000):
    """Click an element and handle DOM detachment"""
    try:
        el = await page.wait_for_selector(text_query, timeout=timeout)
        if el:
            await el.click()
            return True
    except:
        pass
    return False

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        # ========================================
        # PART 1: HOMEPAGE
        # ========================================
        print("\n" + "="*60)
        print("PART 1: HOMEPAGE")
        print("="*60)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        
        console_errors = []
        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        
        resp = await page.goto(BASE, wait_until="networkidle")
        log("✅" if resp.status == 200 else "❌", f"Homepage loads: {resp.status}")
        
        # Check nav
        nav_links = await page.query_selector_all("nav a, header a")
        log("✅" if len(nav_links) >= 3 else "❌", f"Nav links: {len(nav_links)}")
        
        # Check hero
        hero = await page.query_selector("h1")
        hero_text = await hero.inner_text() if hero else ""
        log("✅" if hero_text else "❌", f"Hero h1: '{hero_text[:40]}'")
        
        # Check sections
        body_text = (await page.content()).lower()
        for s in ["services", "about", "contact"]:
            log("✅" if s in body_text else "❌", f"Section '{s}': present")
        
        # Check footer
        footer = await page.query_selector("footer")
        log("✅" if footer else "❌", "Footer present")
        
        # Smartsupp
        has_ss = await page.evaluate("typeof window.smartsupp !== 'undefined'")
        log("✅" if has_ss else "⚠️", f"Smartsupp loaded: {has_ss}")
        
        errs = [e for e in console_errors if "smartsupp" not in e.lower() and "third-party" not in e.lower()]
        log("✅" if len(errs) == 0 else "⚠️", f"Console errors: {len(errs)}")
        
        await page.close()

        # ========================================
        # PART 2: SIGNUP
        # ========================================
        print("\n" + "="*60)
        print("PART 2: SIGNUP FLOW")
        print("="*60)
        
        test_user = f"testuser{int(time.time())}"
        test_email = f"{test_user}@test.com"
        
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        resp = await page.goto(f"{BASE}/register", wait_until="networkidle")
        log("✅" if resp.status == 200 else "❌", f"Register page: {resp.status}")
        
        # Fill all required fields
        try:
            await page.fill("input[value=''] >> nth=0", "John")  # First Name
            await page.fill("input[value=''] >> nth=1", "Doe")   # Last Name
            await page.fill("input[placeholder*='username' i], input[value=''] >> nth=2", test_user)
            await page.fill("input[type='email'], input[value=''] >> nth=3", test_email)
            
            # Select account type
            triggers = await page.query_selector_all("[role='combobox']")
            if len(triggers) >= 2:
                await triggers[0].click()
                await page.wait_for_timeout(500)
                checking = await page.query_selector("[role='option']:has-text('Checking'), [data-value='checking']")
                if checking:
                    await checking.click()
                    await page.wait_for_timeout(300)
                log("✅", "Account type selected")
                
                await triggers[1].click()
                await page.wait_for_timeout(500)
                usd = await page.query_selector("[role='option']:has-text('USD'), [data-value='USD']")
                if usd:
                    await usd.click()
                    await page.wait_for_timeout(300)
                log("✅", "Currency selected")
            
            # Passwords
            pw_fields = await page.query_selector_all("input[type='password']")
            if len(pw_fields) >= 2:
                await pw_fields[0].fill("TestPass123!")
                await pw_fields[1].fill("TestPass123!")
                log("✅", "Passwords filled")
            
            # Submit
            submit = await page.query_selector("button[type='submit']")
            if submit:
                await submit.click()
                await page.wait_for_timeout(5000)
                url = page.url
                success_msg = await page.query_selector("text='Account created'")
                redirect = "/login" in url or "/dashboard" in url
                log("✅" if redirect or success_msg else "❌", f"After signup: url={url[:60]}, success_msg={success_msg is not None}")
            else:
                log("❌", "No submit button")
        except Exception as e:
            log("❌", f"Signup error: {str(e)[:80]}")
        
        await page.close()

        # ========================================
        # PART 3: CUSTOMER LOGIN & PORTAL
        # ========================================
        print("\n" + "="*60)
        print("PART 3: CUSTOMER PORTAL")
        print("="*60)
        
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        await page.goto(f"{BASE}/login", wait_until="networkidle")
        
        await page.fill("input[name='username'], input[placeholder*='username' i], input[value=''] >> nth=0", "customer")
        await page.fill("input[type='password']", "Test123!@")
        await page.click("button[type='submit']")
        await page.wait_for_timeout(5000)
        
        url = page.url
        log("✅" if "/dashboard" in url else "❌", f"Customer login → {url[:60]}")
        
        if "/dashboard" in page.url:
            body = (await page.content()).lower()
            for item in ["balance", "transaction", "profile", "transfer", "statement"]:
                log("✅" if item in body else "❌", f"Dashboard has '{item}'")
            
            # Check sidebar / nav items
            sidebar_items = await page.query_selector_all("aside a, [class*='sidebar'] a, nav a")
            log("✅", f"Sidebar/nav links: {len(sidebar_items)}")
            
            # Check activity cards
            cards = await page.query_selector_all("[class*='card'], [class*='Card']")
            log("✅" if len(cards) > 3 else "⚠️", f"Dashboard cards: {len(cards)}")
        
        await page.close()

        # ========================================
        # PART 4: ADMIN LOGIN & PORTAL
        # ========================================
        print("\n" + "="*60)
        print("PART 4: ADMIN PORTAL")
        print("="*60)
        
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        await page.goto(f"{BASE}/login", wait_until="networkidle")
        
        await page.fill("input[name='username'], input[placeholder*='username' i], input[value=''] >> nth=0", "admin")
        await page.fill("input[type='password']", "Admin123!@")
        await page.click("button[type='submit']")
        await page.wait_for_timeout(5000)
        
        url = page.url
        log("✅" if "/admin" in url else "❌", f"Admin login → {url[:60]}")
        
        if "/admin" in page.url:
            body = (await page.content()).lower()
            for item in ["user management", "credit", "debit", "transfer", "transaction"]:
                log("✅" if item in body else "❌", f"Admin has '{item}'")
            
            # Count buttons
            buttons = await page.query_selector_all("button")
            btn_texts = []
            for btn in buttons:
                try:
                    t = (await btn.inner_text()).strip()
                    if t and len(t) < 40:
                        btn_texts.append(t)
                except:
                    pass
            log("✅", f"Admin buttons ({len(btn_texts)}): {', '.join(btn_texts[:10])}...")
            
            # Test Credit/Debit modal
            credit_btn = await page.query_selector("button:has-text('Credit/Debit')")
            if credit_btn:
                await credit_btn.click()
                await page.wait_for_timeout(2000)
                modal = await page.query_selector("[role='dialog'], [class*='modal' i], [class*='Modal']")
                log("✅" if modal else "❌", f"Credit/Debit modal opens: {modal is not None}")
                if modal:
                    await page.keyboard.press("Escape")
                    await page.wait_for_timeout(500)
            
            # Test Fund Transfer modal
            transfer_btn = await page.query_selector("button:has-text('Fund Transfer')")
            if transfer_btn:
                await transfer_btn.click()
                await page.wait_for_timeout(2000)
                modal = await page.query_selector("[role='dialog'], [class*='modal' i], [class*='Modal']")
                log("✅" if modal else "❌", f"Fund Transfer modal opens: {modal is not None}")
                if modal:
                    await page.keyboard.press("Escape")
                    await page.wait_for_timeout(500)
            
            # Check user list
            user_rows = await page.query_selector_all("tr, [class*='user-row'], [class*='UserCard']")
            log("✅" if len(user_rows) > 0 else "❌", f"User list rows: {len(user_rows)}")
            
            # Check if users are listed
            has_users = "john" in body or "customer" in body or "admin" in body
            log("✅" if has_users else "❌", f"Users visible in admin: {has_users}")
        
        await page.close()

        # ========================================
        # PART 5: MOBILE RESPONSIVE
        # ========================================
        print("\n" + "="*60)
        print("PART 5: MOBILE (iPhone 14)")
        print("="*60)
        
        page = await browser.new_page(viewport={"width": 390, "height": 844})
        await page.goto(BASE, wait_until="networkidle")
        
        # Check hamburger menu
        hamburger = await page.query_selector("button[aria-label*='menu' i], button:has-text('☰'), [class*='hamburger'], button:has(svg)")
        log("✅" if hamburger else "⚠️", f"Mobile hamburger: {hamburger is not None}")
        
        # Check hero is visible
        h1 = await page.query_selector("h1")
        log("✅" if h1 else "❌", "Mobile hero h1 visible")
        
        await page.close()
        
        # Mobile admin
        page = await browser.new_page(viewport={"width": 390, "height": 844})
        await page.goto(f"{BASE}/login", wait_until="networkidle")
        await page.fill("input[name='username'], input[placeholder*='username' i], input[value=''] >> nth=0", "admin")
        await page.fill("input[type='password']", "Admin123!@")
        await page.click("button[type='submit']")
        await page.wait_for_timeout(5000)
        
        if "/admin" in page.url:
            hamburger = await page.query_selector("button[aria-label*='menu' i], button:has-text('☰'), [class*='hamburger']")
            log("✅" if hamburger else "⚠️", f"Mobile admin hamburger: {hamburger is not None}")
            
            if hamburger:
                await hamburger.click()
                await page.wait_for_timeout(1000)
                sidebar = await page.query_selector("[class*='sidebar'], [class*='mobile-menu'], nav:visible, [class*='drawer']")
                log("✅" if sidebar else "⚠️", f"Mobile admin sidebar opens: {sidebar is not None}")
        
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
        total = passed + failed + warnings
        print(f"Total: {total} | ✅ {passed} | ❌ {failed} | ⚠️ {warnings}")
        
        await browser.close()

asyncio.run(main())
