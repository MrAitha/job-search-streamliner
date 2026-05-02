import React, { useCallback } from 'react';
import Papa from 'papaparse';
import { Upload, FileText, CheckCircle } from 'lucide-react';

export default function CSVUploader({ onDataLoaded }) {
  const onFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const books = results.data.map((row, index) => ({
          id: row['Book Id'] || index,
          title: row['Title'],
          author: row['Author'],
          rating: row['My Rating'],
          avgRating: row['Average Rating'],
          cover: null, // Could be enriched later
          dateRead: row['Date Read'],
        })).filter(b => b.title && b.author);
        
        onDataLoaded(books);
      },
    });
  }, [onDataLoaded]);

  return (
    <div className="w-full max-w-xl mx-auto p-8 rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50/30 hover:bg-blue-50/50 transition-all group flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
        <Upload className="text-white w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-blue-900 mb-2">Upload your Goodreads Library</h3>
      <p className="text-blue-600/70 mb-6 max-w-xs">
        Export your library as a CSV from Goodreads and drop it here to generate infographics.
      </p>
      
      <label className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl cursor-pointer transition-all active:scale-95 shadow-md shadow-blue-100 flex items-center space-x-2">
        <FileText className="w-5 h-5" />
        <span>Select export.csv</span>
        <input type="file" className="hidden" accept=".csv" onChange={onFileChange} />
      </label>
      
      <div className="mt-6 flex items-center space-x-4 text-xs font-medium text-blue-500/60 uppercase tracking-widest">
        <span className="flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> No Server Storage</span>
        <span className="flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Instant Preview</span>
      </div>
    </div>
  );
}
