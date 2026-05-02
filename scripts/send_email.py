import os
import json
from datetime import date
import requests

RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
TO_EMAIL_ADDRESS_RAW = os.environ.get("TO_EMAIL_ADDRESS", "delivered@resend.dev")
# Support comma-separated list of emails
TO_EMAIL_LIST = [email.strip() for email in TO_EMAIL_ADDRESS_RAW.split(",") if email.strip()]

DASHBOARD_URL = os.environ.get("DASHBOARD_URL", "https://mraitha.github.io/job-search-streamliner/")

def send_email(high_score_jobs):
    if not RESEND_API_KEY:
        print("No RESEND_API_KEY found, skipping email.")
        return

    html_content = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #1e40af; color: white; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🚀 Daily Job Matches</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.8;">Your top opportunities for {date.today()}</p>
        </div>
        
        <div style="padding: 24px; background-color: #f8fafc; text-align: center; border-bottom: 1px solid #e2e8f0;">
            <a href="{DASHBOARD_URL}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                Open Job Tracker Dashboard
            </a>
        </div>

        <div style="padding: 24px;">
    """
    
    for job in high_score_jobs:
        score_color = "#16a34a" if job['score'] >= 90 else "#2563eb"
        html_content += f"""
            <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: white;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <h3 style="margin: 0; color: #0f172a;">{job['title']}</h3>
                    <span style="background-color: #f1f5f9; color: {score_color}; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 14px;">
                        Score: {job['score']}
                    </span>
                </div>
                <p style="margin: 0 0 12px 0; color: #64748b; font-weight: bold; font-size: 14px;">{job['company']}</p>
                <div style="background-color: #f8fafc; padding: 12px; border-radius: 6px; margin-bottom: 16px; border-left: 4px solid #cbd5e1;">
                    <p style="margin: 0; font-size: 13px; color: #475569; font-style: italic;">"{job['reason']}"</p>
                </div>
                <div style="text-align: right;">
                    <a href="{job['url']}" style="color: #2563eb; text-decoration: none; font-size: 14px; font-weight: bold;">Apply Now →</a>
                </div>
            </div>
        """
    
    html_content += f"""
        </div>
        <div style="background-color: #f1f5f9; padding: 24px; text-align: center; color: #64748b; font-size: 12px;">
            <p style="margin: 0;">You are receiving this because of your Job Search Streamliner automation.</p>
            <p style="margin: 8px 0 0 0;">Mark jobs as <b>Applied</b> on the <a href="{DASHBOARD_URL}" style="color: #2563eb;">dashboard</a> to keep your feed clean.</p>
        </div>
    </div>
    """

    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "from": "Job Streamliner <onboarding@resend.dev>",
        "to": TO_EMAIL_LIST,
        "subject": f"Daily Job Matches ({date.today()})",
        "html": html_content
    }

    response = requests.post("https://api.resend.com/emails", json=data, headers=headers)
    print("Email response:", response.status_code)

if __name__ == "__main__":
    jobs_file = "public/jobs.json"
    if os.path.exists(jobs_file):
        with open(jobs_file, "r") as f:
            jobs = json.load(f)
            
        today_str = str(date.today())
        high_score_jobs = [j for j in jobs if j.get("score", 0) >= 80 and j.get("date") == today_str]
        
        # Sort by score descending and take only the top 5
        high_score_jobs.sort(key=lambda x: x.get("score", 0), reverse=True)
        top_jobs = high_score_jobs[:5]
        
        if top_jobs:
            print(f"Sending top {len(top_jobs)} jobs from today.")
            send_email(top_jobs)
        else:
            print(f"No high-score jobs found for today ({today_str}).")
