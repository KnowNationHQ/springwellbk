import asyncio, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.async_api import async_playwright

BASE = "https://springwellbk.com"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        # DEBUG SIGNUP
        print("=== SIGNUP DEBUG ===")
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        logs = []
        page.on("console", lambda m: logs.append(f"[{m.type}] {m.text}"))
        page.on("pageerror", lambda e: logs.append(f"[PAGE_ERR] {e}"))
        
        await page.goto(f"{BASE}/register", wait_until="networkidle")
        
        # List all inputs and their current state
        inputs = await page.query_selector_all("input")
        for i, inp in enumerate(inputs):
            name = await inp.get_attribute("name") or ""
            placeholder = await inp.get_attribute("placeholder") or ""
            typ = await inp.get_attribute("type") or ""
            val = await inp.get_attribute("value") or ""
            print(f"  Input[{i}]: name='{name}' ph='{placeholder}' type='{typ}' value='{val}'")
        
        # Fill by name/placeholder
        fn = await page.query_selector("input:first-of-type")
        if fn:
            await fn.fill("Alice")
            print("Filled first name: Alice")
        
        # Fill all required fields via labels
        all_inputs = await page.query_selector_all("input")
        field_values = {
            0: "Alice",       # first name
            1: "Wonder",      # last name
            2: f"alice{int(asyncio.get_event_loop().time())}",  # username
            3: f"alice{int(asyncio.get_event_loop().time())}@test.com",  # email
        }
        
        for idx, val in field_values.items():
            if idx < len(all_inputs):
                await all_inputs[idx].fill(val)
                print(f"Filled input[{idx}] = {val}")
        
        # Phone (optional, input 4)
        if len(all_inputs) > 4:
            await all_inputs[4].fill("5551234567")
            print("Filled phone")
        
        # Select dropdowns
        selects = await page.query_selector_all("[role='combobox']")
        for i, sel in enumerate(selects):
            await sel.click()
            await page.wait_for_timeout(500)
            opts = await page.query_selector_all("[role='option']")
            print(f"  Dropdown {i}: {len(opts)} options")
            if opts:
                text = await opts[0].inner_text()
                await opts[0].click()
                await page.wait_for_timeout(300)
                print(f"  Selected: {text}")
        
        # Passwords
        pwds = await page.query_selector_all("input[type='password']")
        for pw in pwds:
            await pw.fill("AlicePass123!")
        print(f"Filled {len(pwds)} password fields")
        
        # Check form state before submit
        form_data = await page.evaluate("""
            (() => {
                const form = document.querySelector('form');
                if (!form) return 'no form';
                const data = {};
                const inputs = form.querySelectorAll('input');
                inputs.forEach((inp, i) => {
                    data['input_' + i] = { type: inp.type, value: inp.value, required: inp.required, name: inp.name };
                });
                const btns = form.querySelectorAll('button');
                data.submitDisabled = btns.length > 0 ? btns[btns.length-1].disabled : 'no btn';
                return JSON.stringify(data);
            })()
        """)
        print(f"Form state: {form_data[:300]}")
        
        # Submit
        btn = await page.query_selector("button[type='submit']")
        if btn:
            disabled = await btn.get_attribute("disabled")
            print(f"Submit disabled: {disabled}")
            await btn.click()
            
            # Watch for navigation
            await page.wait_for_timeout(8000)
            print(f"After submit URL: {page.url}")
            
            # Check for error
            error = await page.query_selector("[class*='red'], [class*='error']")
            if error:
                t = await error.inner_text()
                print(f"ERROR: {t[:150]}")
            
            success = await page.query_selector("[class*='blue'], [class*='success']")
            if success:
                t = await success.inner_text()
                print(f"SUCCESS MSG: {t[:150]}")
        
        print(f"\nConsole logs ({len(logs)}):")
        for l in logs:
            if "error" in l.lower() or "fail" in l.lower() or "reject" in l.lower():
                print(f"  {l[:200]}")
        
        await page.close()

        # CHECK DASHBOARD BUTTON TEXT
        print("\n=== DASHBOARD BUTTONS ===")
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        await page.goto(f"{BASE}/login", wait_until="networkidle")
        await page.fill("input#username", "customer")
        await page.fill("input#password", "Test123!@")
        await page.click("button[type='submit']")
        await page.wait_for_timeout(5000)
        
        if "/dashboard" in page.url:
            btns = await page.query_selector_all("button")
            for btn in btns:
                try:
                    t = (await btn.inner_text()).strip()
                    if t and len(t) < 60:
                        print(f"  Button: '{t}'")
                except:
                    pass
        
        await page.close()
        await browser.close()

asyncio.run(main())
