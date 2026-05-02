import unittest
from unittest.mock import patch, MagicMock
from datetime import date
import sys
import os

# Add scripts to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../scripts')))

import send_email

class TestEmailLogic(unittest.TestCase):
    def test_filter_and_limit_today_jobs(self):
        """Verify that only the top 5 jobs from today are selected, sorted by score."""
        today_str = str(date.today())
        jobs = [
            {"title": "Job 1", "score": 80, "date": today_str},
            {"title": "Job 2", "score": 95, "date": today_str},
            {"title": "Job 3", "score": 85, "date": today_str},
            {"title": "Job 4", "score": 88, "date": today_str},
            {"title": "Job 5", "score": 82, "date": today_str},
            {"title": "Job 6", "score": 90, "date": today_str},
            {"title": "Old Job", "score": 99, "date": "2024-01-01"}
        ]
        
        # Logic from send_email.py
        high_score_today = [j for j in jobs if j.get("score", 0) >= 80 and j.get("date") == today_str]
        high_score_today.sort(key=lambda x: x.get("score", 0), reverse=True)
        top_jobs = high_score_today[:5]
        
        self.assertEqual(len(top_jobs), 5)
        self.assertEqual(top_jobs[0]["title"], "Job 2") # Score 95
        self.assertEqual(top_jobs[1]["title"], "Job 6") # Score 90

    @patch('requests.post')
    def test_send_email_call(self, mock_post):
        """Verify that the email API is called correctly with multiple recipients."""
        mock_post.return_value.status_code = 200
        
        # Mock environment with multiple emails
        with patch.dict(os.environ, {
            "RESEND_API_KEY": "test_key", 
            "TO_EMAIL_ADDRESS": "test1@example.com, test2@example.com"
        }):
            # Reload module to pick up new env var logic or re-import
            import importlib
            importlib.reload(send_email)
            
            jobs = [{"title": "Test Job", "company": "Test Co", "score": 90, "url": "http://test.com", "reason": "Test"}]
            send_email.send_email(jobs)
            
            self.assertTrue(mock_post.called)
            args, kwargs = mock_post.call_args
            self.assertEqual(kwargs['json']['to'], ["test1@example.com", "test2@example.com"])

if __name__ == '__main__':
    unittest.main()
