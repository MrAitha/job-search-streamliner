import { useState, useEffect } from 'react';

function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState(() => {
    const saved = localStorage.getItem('streamliner_applied');
    return saved ? JSON.parse(saved) : [];
  });
  const [showApplied, setShowApplied] = useState(false);

  useEffect(() => {
    localStorage.setItem('streamliner_applied', JSON.stringify(appliedJobs));
  }, [appliedJobs]);

  useEffect(() => {
    fetch('jobs.json')
      .then(res => res.json())
      .then(data => {
        // Sort by date (newest first), then by score (highest first)
        const sorted = data.sort((a, b) => {
          if (b.date !== a.date) {
            return b.date.localeCompare(a.date);
          }
          return b.score - a.score;
        });
        setJobs(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load jobs", err);
        setLoading(false);
      });
  }, []);
  
  const isRecent = (jobDate) => {
    const today = new Date();
    const date = new Date(jobDate);
    const diffTime = Math.abs(today - date);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 2;
  };

  const toggleApplied = (jobId) => {
    setAppliedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId) 
        : [...prev, jobId]
    );
  };

  const filteredJobs = jobs.filter(job => 
    showApplied ? true : !appliedJobs.includes(job.id)
  );

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading jobs...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 font-sans">
      <header className="max-w-4xl mx-auto mb-8 text-center pt-8">
        <h1 className="text-4xl font-bold tracking-tight text-blue-900">Job Search Streamliner</h1>
        <p className="text-gray-500 mt-2">IT Support & HRIS Opportunities</p>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">Highest Matches</h2>
            <label className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
              <input 
                type="checkbox" 
                checked={showApplied} 
                onChange={() => setShowApplied(!showApplied)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">Show Applied</span>
            </label>
          </div>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
            {filteredJobs.length} matches visible
          </span>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {filteredJobs.map(job => (
            <div key={job.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all relative overflow-hidden group ${appliedJobs.includes(job.id) ? 'opacity-60 grayscale-[0.5]' : ''}`}>
              <div className={`absolute top-0 left-0 w-1 h-full ${job.score >= 90 ? 'bg-green-500' : job.score >= 80 ? 'bg-blue-500' : 'bg-yellow-500'}`}></div>
              
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg leading-tight group-hover:text-blue-600 transition-colors">
                  <a href={job.url} target="_blank" rel="noopener noreferrer">{job.title}</a>
                </h3>
                <div className="flex items-center space-x-2">
                  {isRecent(job.date) && (
                    <span className="bg-green-100 text-green-700 text-[10px] uppercase font-black px-1.5 py-0.5 rounded leading-none border border-green-200">
                      New
                    </span>
                  )}
                  <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                    <span className="text-xs text-gray-500 font-medium">Score</span>
                    <span className={`font-bold ${job.score >= 90 ? 'text-green-600' : 'text-blue-600'}`}>{job.score}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mb-3 font-medium flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                {job.company}
              </div>
              
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
                <span className="font-semibold block mb-1 text-gray-700">AI Match Reason:</span>
                {job.reason}
              </p>
              
              <div className="flex justify-between items-center mt-auto">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400 font-medium italic">Scraped {job.date}</span>
                  <button 
                    onClick={() => toggleApplied(job.id)}
                    className={`text-[10px] font-black px-2 py-1 rounded-md border transition-all ${appliedJobs.includes(job.id) ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-400 border-gray-200 hover:border-blue-300 hover:text-blue-500'}`}
                  >
                    {appliedJobs.includes(job.id) ? 'APPLIED ✓' : 'MARK APPLIED'}
                  </button>
                </div>
                <a 
                  href={job.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-4 rounded-lg transition-colors"
                >
                  View Details
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
