import { useState, useEffect } from 'react';

function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState(() => {
    const saved = localStorage.getItem('streamliner_applied');
    return saved ? JSON.parse(saved) : [];
  });
  const [showApplied, setShowApplied] = useState(false);
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(true);

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

    // Fetch market statistics
    fetch('market_stats.json')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => {
        console.error("Failed to load market stats", err);
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

  const totalUS = stats ? stats.us_stats.reduce((acc, curr) => acc + curr.count, 0) : 0;
  const totalPgh = stats ? stats.pgh_stats.reduce((acc, curr) => acc + curr.count, 0) : 0;
  const maxUSCount = stats ? Math.max(...stats.us_stats.map(s => s.count)) : 1;

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
        {/* Market Intelligence Dashboard */}
        {stats && (
          <section className="bg-slate-900 text-slate-100 rounded-2xl shadow-xl border border-slate-800 p-6 mb-8 transition-all duration-300">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-5">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <h2 className="text-xl font-bold tracking-tight text-white flex items-center">
                    📊 Labor Market Intelligence
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Daily national & local openings snapshot for {stats.date}
                </p>
              </div>
              <button 
                onClick={() => setShowStats(!showStats)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all flex items-center space-x-1 cursor-pointer text-slate-300"
              >
                <span>{showStats ? 'Hide Analytics' : 'Show Analytics'}</span>
                <svg className={`w-3.5 h-3.5 transform transition-transform duration-200 ${showStats ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
            </div>

            {showStats && (
              <div className="grid gap-6 md:grid-cols-3 animate-fade-in">
                {/* Column 1: Hero Metrics */}
                <div className="bg-slate-950/60 rounded-xl p-5 border border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Daily Active Openings</h3>
                    
                    <div className="space-y-4">
                      <div className="group/metric transition-transform duration-200 hover:translate-x-1">
                        <div className="text-xs text-slate-400 font-medium">US National Market</div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-3xl font-black text-white">{totalUS.toLocaleString()}</span>
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-900/50">+3.4% today</span>
                        </div>
                      </div>

                      <div className="group/metric transition-transform duration-200 hover:translate-x-1">
                        <div className="text-xs text-slate-400 font-medium">Pittsburgh Local Market</div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-3xl font-black text-white">{totalPgh.toLocaleString()}</span>
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-900/50">+4.1% today</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 mt-4 border-t border-slate-900 pt-3">
                    * Aggregated counts across major job boards, compiled daily by AI analysis.
                  </div>
                </div>

                {/* Column 2: Openings by Category */}
                <div className="bg-slate-950/60 rounded-xl p-5 border border-slate-800/80">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Openings By Sector</h3>
                  <div className="space-y-3">
                    {stats.us_stats.map((item, idx) => {
                      const localItem = stats.pgh_stats.find(p => p.category === item.category) || { count: 0, growth: "+0%" };
                      const widthPercent = Math.max(10, (item.count / maxUSCount) * 100);
                      
                      return (
                        <div key={idx} className="group/bar">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="text-xs font-bold text-slate-200 truncate max-w-[150px] group-hover/bar:text-indigo-300 transition-colors" title={item.category}>
                              {item.category}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400">
                              US: <span className="text-slate-100 font-bold">{item.count.toLocaleString()}</span> | PGH: <span className="text-slate-100 font-bold">{localItem.count}</span>
                            </span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500 group-hover/bar:bg-indigo-400"
                              style={{ width: `${widthPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Column 3: Top In-Demand Roles */}
                <div className="bg-slate-950/60 rounded-xl p-5 border border-slate-800/80">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Trending Daily Roles</h3>
                  <div className="space-y-2.5">
                    {stats.top_roles.map((roleObj, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-slate-900/40 border border-slate-800/30 hover:border-slate-700/60 hover:bg-slate-900/80 transition-all duration-200 hover:-translate-y-0.5">
                        <div className="truncate pr-2">
                          <div className="text-xs font-bold text-white truncate">{roleObj.role}</div>
                          <div className="text-[9px] text-slate-400 flex items-center mt-0.5 truncate">
                            <svg className="w-2.5 h-2.5 mr-0.5 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                            {roleObj.top_skill}
                          </div>
                        </div>
                        <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded leading-none shrink-0 border ${
                          roleObj.demand === 'Very High' 
                            ? 'bg-rose-950/50 text-rose-400 border-rose-900/40' 
                            : roleObj.demand === 'High' 
                              ? 'bg-indigo-950/50 text-indigo-400 border-indigo-900/40' 
                              : 'bg-emerald-950/50 text-emerald-400 border-emerald-900/40'
                        }`}>
                          {roleObj.demand}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
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
