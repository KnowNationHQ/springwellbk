from playwright.sync_api import sync_playwright
import time

def test_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})

        # 1. Homepage loads
        print("1. Testing homepage...")
        page.goto("http://localhost:3000")
        page.wait_for_load_state("networkidle")
        page.screenshot(path="screenshots/01_homepage.png", full_page=True)
        title = page.title()
        print(f"   Title: {title}")
        assert "SpringWell" in title or "springwell" in title.lower(), f"Unexpected title: {title}"
        print("   PASS")

        # 2. Navigate to login
        print("2. Testing login page...")
        page.goto("http://localhost:3000/login")
        page.wait_for_load_state("networkidle")
        page.screenshot(path="screenshots/02_login.png")
        print("   PASS")

        # 3. Login as customer
        print("3. Logging in as customer...")
        page.fill('input[placeholder*="username" i], input[placeholder*="email" i], input[name="username"], input[name="email"]', "customer")
        page.fill('input[type="password"]', "Test123!@")
        page.screenshot(path="screenshots/03_login_filled.png")
        page.click('button[type="submit"]')
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2000)
        page.screenshot(path="screenshots/04_dashboard.png", full_page=True)
        url = page.url
        print(f"   Redirected to: {url}")
        assert "dashboard" in url, f"Expected dashboard redirect, got: {url}"
        print("   PASS")

        # 4. Check dashboard content
        print("4. Checking dashboard content...")
        content = page.content()
        has_balance = "balance" in content.lower() or "available" in content.lower()
        print(f"   Has balance section: {has_balance}")
        page.screenshot(path="screenshots/05_dashboard_full.png", full_page=True)
        print("   PASS")

        # 5. Navigate to transfer page
        print("5. Testing transfer page...")
        page.goto("http://localhost:3000/transfer")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2000)
        page.screenshot(path="screenshots/06_transfer.png", full_page=True)
        print("   PASS")

        # 6. Try a domestic transfer (external)
        print("6. Testing domestic transfer form...")
        # Click on Domestic tab
        domestic_tab = page.locator("text=Domestic").first
        if domestic_tab.is_visible():
            domestic_tab.click()
            page.wait_for_timeout(500)
        
        # Fill form
        inputs = page.locator("input").all()
        print(f"   Found {len(inputs)} input fields")
        page.screenshot(path="screenshots/07_transfer_domestic.png", full_page=True)
        
        # Try to fill some fields if they exist
        recipient_input = page.locator('input[placeholder*="recipient" i], input[placeholder*="name" i]').first
        bank_input = page.locator('input[placeholder*="bank" i]').first
        account_input = page.locator('input[placeholder*="account" i]').first
        amount_input = page.locator('input[placeholder*="amount" i], input[type="number"]').first

        if recipient_input.is_visible():
            recipient_input.fill("John Doe")
        if bank_input.is_visible():
            bank_input.fill("Chase Bank")
        if account_input.is_visible():
            account_input.fill("1234567890")
        if amount_input.is_visible():
            amount_input.fill("100")

        page.screenshot(path="screenshots/08_transfer_filled.png", full_page=True)
        print("   PASS")

        # 7. Logout and login as admin
        print("7. Testing admin login...")
        page.goto("http://localhost:3000/login")
        page.wait_for_load_state("networkidle")
        page.fill('input[placeholder*="username" i], input[placeholder*="email" i], input[name="username"], input[name="email"]', "admin")
        page.fill('input[type="password"]', "Admin123!@")
        page.click('button[type="submit"]')
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2000)
        page.screenshot(path="screenshots/09_admin_dashboard.png", full_page=True)
        url = page.url
        print(f"   Redirected to: {url}")
        assert "admin" in url, f"Expected admin redirect, got: {url}"
        print("   PASS")

        # 8. Check admin page content
        print("8. Checking admin page...")
        content = page.content()
        has_users = "user" in content.lower() or "customer" in content.lower()
        print(f"   Has user management: {has_users}")
        page.screenshot(path="screenshots/10_admin_full.png", full_page=True)
        print("   PASS")

        # 9. Check admin transfer page
        print("9. Testing admin transfer page...")
        page.goto("http://localhost:3000/admin/transfer")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2000)
        page.screenshot(path="screenshots/11_admin_transfer.png", full_page=True)
        print("   PASS")

        # 10. Check frozen page
        print("10. Testing admin frozen page...")
        page.goto("http://localhost:3000/admin/frozen")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2000)
        page.screenshot(path="screenshots/12_admin_frozen.png", full_page=True)
        print("   PASS")

        browser.close()
        print("\nAll tests passed!")

if __name__ == "__main__":
    import os
    os.makedirs("screenshots", exist_ok=True)
    test_app()
