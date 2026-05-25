import os
import json
from datetime import date, timedelta

def simulate_pipeline():
    print("Starting pipeline simulation...")
    
    today_str = str(date.today())
    yesterday_str = str(date.today() - timedelta(days=1))
    older_str = str(date.today() - timedelta(days=3))
    
    # 1. Generate Simulated Jobs (including matching and healthcare/popular roles)
    simulated_jobs = [
        {
            "id": "sim-1",
            "title": "HRIS Specialist (Workday)",
            "company": "Steel City Health Systems",
            "url": "https://example.com/jobs/1",
            "score": 95,
            "reason": "Perfect match for the Workday and HR operations profile, with entry/mid-level experience and SQL/Power BI preferred.",
            "date": today_str
        },
        {
            "id": "sim-2",
            "title": "IT Support Analyst",
            "company": "Pittsburgh Tech Solutions",
            "url": "https://example.com/jobs/2",
            "score": 88,
            "reason": "Strong match for IT Support and troubleshooting, matching the CompTIA A+ background and mid-level requirements.",
            "date": today_str
        },
        {
            "id": "sim-3",
            "title": "Data Analyst (Power BI & SQL)",
            "company": "Duquesne Analytics Group",
            "url": "https://example.com/jobs/3",
            "score": 90,
            "reason": "High match leveraging the candidate's core SQL and Power BI visualization skills at a mid-level experience tier.",
            "date": yesterday_str
        },
        {
            "id": "sim-4",
            "title": "HR Operations Coordinator",
            "company": "Allegheny Corporate Services",
            "url": "https://example.com/jobs/4",
            "score": 82,
            "reason": "Good functional match for HR operations background, though SQL/Power BI core tools are not explicitly listed in the description.",
            "date": yesterday_str
        },
        {
            "id": "sim-5",
            "title": "Medical Assistant",
            "company": "UPMC Clinic",
            "url": "https://example.com/jobs/5",
            "score": 62,
            "reason": "Clinical healthcare role. Matches entry-level support profile but lacks core IT/HR systems and tools overlap.",
            "date": older_str
        },
        {
            "id": "sim-6",
            "title": "People Analytics Specialist",
            "company": "Gateway Financial",
            "url": "https://example.com/jobs/6",
            "score": 94,
            "reason": "Excellent match combining HRIS, Workday, and data analysis (SQL/Power BI) competencies for a People Operations team.",
            "date": older_str
        }
    ]
    
    jobs_file = "public/jobs.json"
    print(f"Writing {len(simulated_jobs)} simulated jobs to {jobs_file}...")
    with open(jobs_file, "w") as f:
        json.dump(simulated_jobs, f, indent=2)
        
    # 2. Generate Simulated Market Stats (US vs. Pittsburgh with popular sectors)
    simulated_stats = {
        "date": today_str,
        "us_stats": [
          { "category": "Healthcare & Medical Services", "count": 29120, "growth": "+6.1%" },
          { "category": "IT & Software Engineering", "count": 18450, "growth": "+4.5%" },
          { "category": "HR & Business Operations", "count": 9110, "growth": "+3.4%" },
          { "category": "Sales & Customer Service", "count": 24280, "growth": "+2.1%" },
          { "category": "Administrative & Clerical", "count": 15820, "growth": "+1.7%" }
        ],
        "pgh_stats": [
          { "category": "Healthcare & Medical Services", "count": 642, "growth": "+6.8%" },
          { "category": "IT & Software Engineering", "count": 395, "growth": "+3.1%" },
          { "category": "HR & Business Operations", "count": 204, "growth": "+4.2%" },
          { "category": "Sales & Customer Service", "count": 535, "growth": "+1.9%" },
          { "category": "Administrative & Clerical", "count": 318, "growth": "+1.1%" }
        ],
        "top_roles": [
          { "role": "Medical Assistant", "demand": "Very High", "top_skill": "Clinical Support & EHR" },
          { "role": "Medical Coder", "demand": "High", "top_skill": "ICD-10 & Medical Billing" },
          { "role": "HRIS Analyst (Workday)", "demand": "High", "top_skill": "Workday & HR Operations" },
          { "role": "IT Support Technician", "demand": "Very High", "top_skill": "CompTIA A+ & Troubleshooting" },
          { "role": "Software Engineer", "demand": "High", "top_skill": "React, Node.js & SQL" }
        ]
    }
    
    stats_file = "public/market_stats.json"
    print(f"Writing simulated market stats to {stats_file}...")
    with open(stats_file, "w") as f:
        json.dump(simulated_stats, f, indent=2)
        
    print("Simulation complete! You can now run the app to view the dashboard with simulated data.")

if __name__ == "__main__":
    simulate_pipeline()
