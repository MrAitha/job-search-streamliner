# Job Search Streamliner

A zero-cost, automated, and serverless Progressive Web App (PWA) designed to streamline the job search process. This tool automatically scrapes job boards, uses AI to grade jobs against a candidate's specific profile, emails the best matches, and displays them on a mobile-friendly Kanban dashboard.

## Features
- **Automated Scraping:** Runs daily to find new job postings from LinkedIn and Indeed.
- **AI-Powered Filtering:** Uses Google's Gemini LLM to read job descriptions and assign a 0-100 "Approval Chance" score based on the candidate's skills.
- **Email Notifications:** Automatically sends an email summarizing the highest-scoring jobs.
- **Job Tracker Dashboard:** A responsive React/Tailwind card grid to browse matches, mark jobs as Applied, and filter your view.
- **Serverless Architecture:** 100% free to host using GitHub Actions and GitHub Pages.

## Technical Architecture
For a deep dive into how the data pipeline and automated workflows operate, please read the [High-Level Technical Document (ARCHITECTURE.md)](./ARCHITECTURE.md).

## Local Development Setup

### Prerequisites
- Node.js (v20+)
- Python (v3.10+)

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Install Backend Dependencies
```bash
python -m pip install -r requirements.txt
```

### 3. Run the App Locally
Start the React development server:
```bash
npm run dev
```

### 4. Run the Scraper Locally
You must set your Gemini API key in your terminal before running the python script:
```powershell
# Windows PowerShell
$env:GEMINI_API_KEY="your_api_key_here"
python scripts/scrape.py
```

## GitHub Deployment Setup
To host this yourself for free:
1. Fork or push this repository to your GitHub account.
2. Go to **Settings > Secrets and variables > Actions** and add:
   - `GEMINI_API_KEY` (From Google AI Studio)
   - `RESEND_API_KEY` (From Resend)
   - `TO_EMAIL_ADDRESS` (Where you want daily emails sent)
3. Go to **Settings > Actions > General > Workflow permissions** and select **Read and write permissions**.
4. Trigger the "Daily Job Scraper" workflow manually in the **Actions** tab.
5. Go to **Settings > Pages**, set the source to `gh-pages` branch, and save.
