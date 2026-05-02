import os
import json
import csv
import argparse
from google import genai
from google.genai import types

def get_book_analysis(client, title, author):
    """Uses Gemini to get book theme and key points."""
    prompt = f"""
Analyze the book "{title}" by {author}.
Provide a concise infographic-style summary in JSON format:
{{
  "theme": "A one-sentence summary of the core message",
  "key_points": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
  "mood": "One word mood (e.g., Inspiring, Dark, Analytical, Poetic)",
  "category": "Broad category (e.g., Non-Fiction, Sci-Fi, Business)"
}}
Keep the key points punchy and impactful.
"""
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash', # Using a standard available model
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error analyzing {title}: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(description="Analyze Goodreads CSV with Gemini")
    parser.add_argument("--input", default="goodreads_export.csv", help="Path to Goodreads CSV")
    parser.add_argument("--output", default="public/books.json", help="Path to output JSON")
    args = parser.parse_args()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable not set.")
        return

    client = genai.Client(api_key=api_key)

    books_to_process = []
    try:
        with open(args.input, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Basic validation
                if row.get("Title") and row.get("Author"):
                    books_to_process.append({
                        "id": row.get("Book Id"),
                        "title": row.get("Title"),
                        "author": row.get("Author"),
                        "rating": row.get("My Rating"),
                        "avg_rating": row.get("Average Rating")
                    })
    except FileNotFoundError:
        print(f"Error: {args.input} not found.")
        return

    print(f"Processing {len(books_to_process)} books...")
    
    analyzed_books = []
    # Limit to 10 books for now to avoid long runs/costs during development
    for i, book in enumerate(books_to_process[:10]):
        print(f"Analyzing [{i+1}/10]: {book['title']}...")
        analysis = get_book_analysis(client, book['title'], book['author'])
        if analysis:
            book.update(analysis)
            analyzed_books.append(book)

    with open(args.output, "w", encoding='utf-8') as f:
        json.dump(analyzed_books, f, indent=2)
    
    print(f"Successfully saved analysis to {args.output}")

if __name__ == "__main__":
    main()
