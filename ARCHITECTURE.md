# High-Level Technical Architecture

The **Job Search Streamliner** is built on a "Serverless Static Data" architecture. It completely avoids the need for a traditional backend server or database (like Express or PostgreSQL), resulting in zero hosting costs while maintaining dynamic daily updates.

## 1. Core Components
- **Automation Engine:** GitHub Actions
- **Data Scraper:** Python + `python-jobspy`
- **AI Evaluator:** Google Gemini (`google-genai`)
- **Data Store:** Static JSON (`public/jobs.json`)
- **Frontend UI:** React + Vite + Tailwind CSS v4
- **Hosting:** GitHub Pages

## 2. The Data Pipeline (Daily Workflow)
The entire application logic is orchestrated by `.github/workflows/main.yml`, which triggers automatically every day at 9:00 AM (or on manual push).

### Phase A: Data Ingestion (`scripts/scrape.py`)
1. **Scraping:** The script executes `jobspy` to asynchronously search LinkedIn and Indeed for specific keywords (e.g., "IT Support HRIS Analyst") across defined locations (e.g., "Remote", "Pittsburgh, PA").
2. **AI Processing:** For every job found, the script reads the candidate profile from `GEMINI.md`. It sends the profile and the job description to the Gemini 2.5 LLM.
3. **Filtering:** Gemini returns a JSON object containing a score (0-100) and a reason. The script discards any job scoring below 60.
4. **Data Mutability:** The script opens the existing `public/jobs.json` file, checks for duplicate URLs, appends the new high-scoring jobs, and saves the file.

### Phase B: Notification (`scripts/send_email.py`)
1. The workflow reads the newly updated `jobs.json`.
2. Using the Resend API, it constructs an HTML email containing the titles, companies, scores, and application links of the latest high-quality jobs.
3. The email is dispatched to the configured `TO_EMAIL_ADDRESS`.

### Phase C: Git Persistence
Because the scraping script modified `public/jobs.json`, the GitHub Action uses a bot account to execute a `git commit` and push the new data back into the `main` branch. This permanently saves the data without needing a database.

### Phase D: Frontend Build & Deployment
1. The Action spins up a Node.js environment.
2. It runs `npm run build`, which compiles the React source code (`App.jsx`) and the newly updated `jobs.json` into a highly optimized static `dist` folder.
3. Finally, it forcefully pushes only the contents of the `dist` folder to a special branch named `gh-pages`.

## 3. The Frontend Client
When a user visits the GitHub Pages URL, they are served the compiled React app.
1. `App.jsx` executes a lightweight `fetch('jobs.json')` request.
2. It parses the JSON and renders it into a responsive 2-column card grid, sorted by date (newest first) then score (highest first).
3. Each card shows the job title, company, AI match reason, score (color-coded green ≥90 / blue ≥80 / yellow otherwise), and a "New" badge for jobs posted within the last 2 days.
4. Users can click **Mark Applied** to hide a job from the default view. Applied state is persisted in **LocalStorage**, so it survives page refreshes without needing a backend.

## Security Considerations
- All sensitive API keys (`GEMINI_API_KEY`, `RESEND_API_KEY`) are stored securely as GitHub Actions Secrets and are **never** exposed to the frontend or committed to the codebase.
