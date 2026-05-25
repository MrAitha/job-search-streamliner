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

def generate_market_stats(client):
    """Uses Gemini to synthesize overall job market stats for the day."""
    today_str = str(date.today())
    prompt = f"""
    You are a labor market analyst specializing in national (US) and local (Pittsburgh, PA) job openings.
    Generate a JSON object estimating the current total job openings and growth trends for today, {today_str}.
    
    The target sectors to track are:
    1. Healthcare & Medical Services (e.g. Medical Assistant, Medical Coder)
    2. IT & Software Engineering
    3. HR & Business Operations
    4. Sales & Customer Service
    5. Administrative & Clerical
    
    For each sector:
    - Provide estimated national (US) active openings today.
    - Provide estimated Pittsburgh local active openings today.
    - Provide estimated daily growth trend (e.g., "+3.2%", "-0.5%", "+1.8%").
    
    Also, list the top 5 overall most in-demand roles across these sectors right now, indicating their demand level (e.g., "Very High", "High", "Medium") and the top required skill or certification.
    
    Provide your analysis in JSON format exactly matching this schema:
    {{
      "date": "{today_str}",
      "us_stats": [
        {{ "category": "Healthcare & Medical Services", "count": <integer>, "growth": "<string>" }},
        {{ "category": "IT & Software Engineering", "count": <integer>, "growth": "<string>" }},
        {{ "category": "HR & Business Operations", "count": <integer>, "growth": "<string>" }},
        {{ "category": "Sales & Customer Service", "count": <integer>, "growth": "<string>" }},
        {{ "category": "Administrative & Clerical", "count": <integer>, "growth": "<string>" }}
      ],
      "pgh_stats": [
        {{ "category": "Healthcare & Medical Services", "count": <integer>, "growth": "<string>" }},
        {{ "category": "IT & Software Engineering", "count": <integer>, "growth": "<string>" }},
        {{ "category": "HR & Business Operations", "count": <integer>, "growth": "<string>" }},
        {{ "category": "Sales & Customer Service", "count": <integer>, "growth": "<string>" }},
        {{ "category": "Administrative & Clerical", "count": <integer>, "growth": "<string>" }}
      ],
      "top_roles": [
        {{ "role": "<string>", "demand": "<string>", "top_skill": "<string>" }},
        ... (exactly 5 items)
      ]
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
        data["date"] = today_str
        return data
    except Exception as e:
        print(f"Error generating market stats via Gemini: {e}")
        return None

def save_market_stats(client, api_key):
    today_str = str(date.today())
    stats_file = "public/market_stats.json"
    stats_data = None
    
    if api_key and client:
        print("Generating daily market statistics via Gemini...")
        stats_data = generate_market_stats(client)
        
    if not stats_data:
        print("Using/updating fallback market statistics...")
        if os.path.exists(stats_file):
            try:
                with open(stats_file, "r") as f:
                    stats_data = json.load(f)
                stats_data["date"] = today_str
            except Exception:
                stats_data = None
                
        if not stats_data:
            stats_data = {
              "date": today_str,
              "us_stats": [
                { "category": "Healthcare & Medical Services", "count": 28450, "growth": "+5.8%" },
                { "category": "IT & Software Engineering", "count": 18230, "growth": "+4.2%" },
                { "category": "HR & Business Operations", "count": 8940, "growth": "+3.1%" },
                { "category": "Sales & Customer Service", "count": 24150, "growth": "+2.4%" },
                { "category": "Administrative & Clerical", "count": 15680, "growth": "+1.9%" }
              ],
              "pgh_stats": [
                { "category": "Healthcare & Medical Services", "count": 612, "growth": "+6.3%" },
                { "category": "IT & Software Engineering", "count": 385, "growth": "+2.8%" },
                { "category": "HR & Business Operations", "count": 194, "growth": "+3.5%" },
                { "category": "Sales & Customer Service", "count": 520, "growth": "+1.7%" },
                { "category": "Administrative & Clerical", "count": 312, "growth": "+0.8%" }
              ],
              "top_roles": [
                { "role": "Medical Assistant", "demand": "Very High", "top_skill": "Clinical Support & EHR" },
                { "role": "Medical Coder", "demand": "High", "top_skill": "ICD-10 & Medical Billing" },
                { "role": "HRIS Analyst (Workday)", "demand": "High", "top_skill": "Workday & HR Operations" },
                { "role": "IT Support Technician", "demand": "Very High", "top_skill": "CompTIA A+ & Troubleshooting" },
                { "role": "Software Engineer", "demand": "High", "top_skill": "React, Node.js & SQL" }
              ]
            }
            
    with open(stats_file, "w") as f:
        json.dump(stats_data, f, indent=2)
    print(f"Successfully saved market stats to {stats_file}")

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

    # Generate and save daily market stats
    api_key = os.environ.get("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key) if api_key else None
    save_market_stats(client, api_key)
