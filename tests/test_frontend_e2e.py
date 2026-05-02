from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import unittest

class TestJobDashboard(unittest.TestCase):
    def setUp(self):
        # Set up Chrome in headless mode for CI/CD
        options = webdriver.ChromeOptions()
        # options.add_argument('--headless')
        self.driver = webdriver.Chrome(options=options)
        self.driver.get("http://localhost:5173") # Assuming local dev server is running

    def tearDown(self):
        self.driver.quit()

    def test_mark_applied_hides_job(self):
        """Verify that clicking 'Mark Applied' hides the job card."""
        wait = WebDriverWait(self.driver, 10)
        
        # 1. Find the first job card and its title
        job_card = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "group")))
        job_title = job_card.find_element(By.TAG_NAME, "h3").text
        print(f"Found job: {job_title}")

        # 2. Click 'MARK APPLIED'
        mark_applied_btn = job_card.find_element(By.XPATH, ".//button[contains(text(), 'MARK APPLIED')]")
        mark_applied_btn.click()
        
        # 3. Verify the job is no longer visible (since showApplied is false by default)
        time.sleep(1) # Wait for animation/re-render
        remaining_titles = [h3.text for h3 in self.driver.find_elements(By.TAG_NAME, "h3")]
        self.assertNotIn(job_title, remaining_titles)
        print("Success: Job hidden after marking applied.")

    def test_show_applied_toggle(self):
        """Verify that 'Show Applied' toggle shows previously hidden jobs."""
        wait = WebDriverWait(self.driver, 10)
        
        # 1. Mark a job as applied
        job_card = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "group")))
        job_title = job_card.find_element(By.TAG_NAME, "h3").text
        mark_applied_btn = job_card.find_element(By.XPATH, ".//button[contains(text(), 'MARK APPLIED')]")
        mark_applied_btn.click()
        
        # 2. Toggle 'Show Applied'
        toggle = self.driver.find_element(By.XPATH, "//span[contains(text(), 'Show Applied')]")
        toggle.click()
        
        # 3. Verify the job is visible again
        time.sleep(1)
        remaining_titles = [h3.text for h3 in self.driver.find_elements(By.TAG_NAME, "h3")]
        self.assertIn(job_title, remaining_titles)
        
        # 4. Verify it has the applied style (opacity/grayscale)
        applied_card = self.driver.find_element(By.XPATH, f"//h3[contains(text(), '{job_title}')]/ancestor::div[contains(@class, 'opacity-60')]")
        self.assertIsNotNone(applied_card)
        print("Success: Applied job visible after toggle.")

if __name__ == "__main__":
    unittest.main()
