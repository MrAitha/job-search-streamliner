import os
import json
from datetime import date
from jobspy import scrape_jobs
from google import genai
from google.genai import types

def get_gemini_score(client, profile_text, job_title, job_desc):
    """Uses Gemini to score a job based on the candidate profile."""
    prompt = f"""
You are an expert IT/HR recruiter evaluating a job match.
Candidate Profile:
{profile_text}

Job Title: {job_title}
Job Description:
{job_desc}

Provide your analysis in JSON format exactly like this:
{{
  "score": <number 0-100 based on alignment with the profile core tools and experience level>,
  "reason": "<one short sentence explaining why it's a good or bad match>"
}}
"""
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        data = json.loads(response.text)
        return data.get("score", 0), data.get("reason", "Failed to parse reasoning.")
    except Exception as e:
        print(f"Error scoring job {job_title}: {e}")
        return 0, "LLM Evaluation Error"

def scrape_and_score():
    print("Scraping Remote jobs via JobSpy...")
    remote_df = scrape_jobs(
        site_name=["linkedin", "indeed"],
        search_term="IT Support HRIS Analyst",
        location="Remote-US",
        results_wanted=5,
        country_employer="usa"
    )
    remote_records = remote_df.to_dict('records') if not remote_df.empty else []

    print("Scraping Pittsburgh, PA jobs via JobSpy...")
    pittsburgh_df = scrape_jobs(
        site_name=["linkedin", "indeed"],
        search_term="IT Support HRIS Analyst",
        location="Pittsburgh, PA",
        results_wanted=5,
        country_employer="usa"
    )
    pittsburgh_records = pittsburgh_df.to_dict('records') if not pittsburgh_df.empty else []
    
    jobs_records = remote_records + pittsburgh_records

    if not jobs_records:
        print("No jobs found today.")
        return []

    print(f"Found {len(jobs_records)} jobs total. Initializing Gemini scoring...")

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("WARNING: GEMINI_API_KEY not found. Skipping scoring.")
        return []

    client = genai.Client(api_key=api_key)

    # Read profile from GEMINI.md
    profile_text = ""
    try:
        with open("GEMINI.md", "r") as f:
            profile_text = f.read()
    except FileNotFoundError:
        profile_text = "IT Support, HRIS, Workday, Power BI, SQL. Entry/Mid-level."

    scored_jobs = []
    for index, row in enumerate(jobs_records):
        title = row.get("title", "Unknown Title")
        company = row.get("company", "Unknown Company")
        url = row.get("job_url", "")
        desc = row.get("description", "")
        
        print(f"Scoring [{index+1}/{len(jobs_records)}]: {title} at {company}...")
        
        score, reason = get_gemini_score(client, profile_text, title, desc)
        
        # Only keep jobs with score >= 60 to keep dashboard clean
        if score >= 60:
            scored_jobs.append({
                "id": str(row.get("id", f"{index}_{date.today()}")),
                "title": title,
                "company": company,
                "url": url,
                "score": score,
                "reason": reason,
                "date": str(date.today())
            })

    return scored_jobs

if __name__ == "__main__":
    new_jobs = scrape_and_score()
    
    jobs_file = "public/jobs.json"
    existing_jobs = []
    
    if os.path.exists(jobs_file):
        with open(jobs_file, "r") as f:
            try:
                existing_jobs = json.load(f)
            except json.JSONDecodeError:
                pass
                
    # Basic deduplication by URL
    existing_urls = {job.get("url") for job in existing_jobs}
    added_jobs = [job for job in new_jobs if job.get("url") not in existing_urls]
    
    existing_jobs.extend(added_jobs)
    
    with open(jobs_file, "w") as f:
        json.dump(existing_jobs, f, indent=2)
        
    print(f"Successfully appended {len(added_jobs)} high-quality jobs to {jobs_file}")
