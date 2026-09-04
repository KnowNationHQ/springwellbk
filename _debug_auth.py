import asyncio, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.async_api import async_playwright

BASE = "https://springwellbk.com"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        # TEST 1: Customer login with console capture
        print("=" * 60)
        print("TEST 1: CUSTOMER LOGIN")
        print("=" * 60)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        
        logs = []
        page.on("console", lambda m: logs.append(f"[{m.type}] {m.text}"))
        page.on("pageerror", lambda e: logs.append(f"[PAGE_ERROR] {e}"))
        
        await page.goto(f"{BASE}/login", wait_until="networkidle")
        
        # Try filling by placeholder
        username_el = await page.query_selector("input#username, input[placeholder='Enter username']")
        pw_el = await page.query_selector("input#password, input[placeholder='Enter your password']")
        print(f"Username field: {username_el is not None}")
        print(f"Password field: {pw_el is not None}")
        
        if username_el and pw_el:
            await username_el.fill("customer")
            await pw_el.fill("Test123!@")
            print("Filled credentials")
            
            # Click submit
            btn = await page.query_selector("button[type='submit']")
            print(f"Submit button: {btn is not None}")
            if btn:
                btn_text = await btn.inner_text()
                print(f"Button text: {btn_text}")
                await btn.click()
                await page.wait_for_timeout(6000)
                
                url = page.url
                print(f"After submit URL: {url}")
                
                # Check for error messages
                error_el = await page.query_selector("[class*='red'], [class*='error'], [role='alert']")
                if error_el:
                    error_text = await error_el.inner_text()
                    print(f"ERROR displayed: {error_text}")
                else:
                    print("No error message displayed")
        
        # Print relevant console logs
        for l in logs:
            if "error" in l.lower() or "fail" in l.lower() or "invalid" in l.lower():
                print(f"Console: {l[:150]}")
        
        await page.close()

        # TEST 2: Signup with console capture
        print("\n" + "=" * 60)
        print("TEST 2: SIGNUP")
        print("=" * 60)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        
        logs2 = []
        page.on("console", lambda m: logs2.append(f"[{m.type}] {m.text}"))
        page.on("pageerror", lambda e: logs2.append(f"[PAGE_ERROR] {e}"))
        
        await page.goto(f"{BASE}/register", wait_until="networkidle")
        
        # List all inputs
        inputs = await page.query_selector_all("input")
        for i, inp in enumerate(inputs):
            name = await inp.get_attribute("name") or ""
            placeholder = await inp.get_attribute("placeholder") or ""
            typ = await inp.get_attribute("type") or ""
            print(f"Input {i}: name='{name}' placeholder='{placeholder}' type='{typ}'")
        
        # Fill by index
        vals = ["TestFirst", "TestLast", "newtestuser999", "newtest999@test.com", "", "", "", "", "TestPass123!", "TestPass123!"]
        for i, inp in enumerate(inputs):
            typ = await inp.get_attribute("type") or ""
            if typ == "submit" or typ == "checkbox":
                continue
            if i < len(vals) and vals[i]:
                await inp.fill(vals[i])
                print(f"Filled input {i} with '{vals[i]}'")
        
        # Select account type and currency from dropdowns
        selects = await page.query_selector_all("[role='combobox']")
        print(f"Comboboxes found: {len(selects)}")
        for i, sel in enumerate(selects):
            await sel.click()
            await page.wait_for_timeout(500)
            options = await page.query_selector_all("[role='option']")
            print(f"Select {i}: {len(options)} options")
            for opt in options:
                text = await opt.inner_text()
                print(f"  Option: '{text}'")
            if options:
                await options[0].click()
                await page.wait_for_timeout(300)
        
        # Check error/success before submit
        error_el = await page.query_selector("[class*='red'], [class*='error']")
        if error_el:
            print(f"Pre-submit error: {await error_el.inner_text()}")
        
        # Submit
        btn = await page.query_selector("button[type='submit']")
        if btn:
            btn_text = await btn.inner_text()
            print(f"Submit button text: {btn_text}")
            await btn.click()
            await page.wait_for_timeout(6000)
            
            url = page.url
            print(f"After submit URL: {url}")
            
            # Check for messages
            error_el = await page.query_selector("[class*='red'], [class*='error']")
            if error_el:
                error_text = await error_el.inner_text()
                print(f"ERROR: {error_text}")
            
            success_el = await page.query_selector("[class*='blue'], [class*='success']")
            if success_el:
                success_text = await success_el.inner_text()
                print(f"SUCCESS: {success_text}")
        
        for l in logs2:
            if "error" in l.lower() or "fail" in l.lower():
                print(f"Console: {l[:150]}")
        
        await page.close()
        await browser.close()

asyncio.run(main())
