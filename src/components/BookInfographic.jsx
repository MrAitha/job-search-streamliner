import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { Download, BookOpen, Star, Sparkles, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BookInfographic({ book }) {
  const exportRef = useRef(null);

  const downloadImage = () => {
    if (exportRef.current === null) return;
    toPng(exportRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `${book.title.replace(/\s+/g, '-').toLowerCase()}-infographic.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => console.error('Export failed', err));
  };

  // Default analysis if book hasn't been processed by Gemini yet
  const displayTheme = book.theme || "The transformative power of perspective and consistent growth.";
  const displayPoints = book.key_points || [
    "Compounding small actions leads to massive results over time.",
    "The environment shapes behavior more than willpower alone.",
    "Systemic thinking over goal-oriented obsession.",
    "The importance of feedback loops in learning.",
    "Redefining identity to sustain long-term change."
  ];

  return (
    <div className="flex flex-col items-center">
      {/* The Actual Infographic (Exported Area) */}
      <div 
        ref={exportRef}
        className="w-[400px] h-[600px] bg-[#0f172a] overflow-hidden relative font-sans text-white p-8 shadow-2xl flex flex-col"
      >
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-purple-600/20 rounded-full blur-[80px]" />
        
        {/* Header */}
        <div className="relative z-10 mb-8">
          <div className="flex items-center space-x-2 text-blue-400 mb-2 font-bold tracking-widest text-[10px] uppercase">
            <Sparkles size={12} />
            <span>AI Book Insights</span>
          </div>
          <h1 className="text-2xl font-black leading-tight mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            {book.title}
          </h1>
          <p className="text-gray-400 text-sm font-medium">by {book.author}</p>
        </div>

        {/* Central Theme */}
        <div className="relative z-10 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-8">
          <Quote className="text-blue-500 mb-2 opacity-50" size={20} />
          <p className="text-lg font-medium leading-relaxed italic text-gray-100">
            "{displayTheme}"
          </p>
        </div>

        {/* Key Takeaways */}
        <div className="relative z-10 flex-grow">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center">
            <BookOpen size={12} className="mr-2 text-blue-500" />
            Key Takeaways
          </h3>
          <ul className="space-y-4">
            {displayPoints.map((point, i) => (
              <li key={i} className="flex items-start space-x-3 group">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400 border border-blue-500/30">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-300 leading-snug group-hover:text-white transition-colors">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-auto pt-8 border-t border-white/5 flex justify-between items-center">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={10} 
                fill={i < Math.floor(book.avgRating || 4) ? "#fbbf24" : "none"} 
                stroke={i < Math.floor(book.avgRating || 4) ? "#fbbf24" : "#4b5563"} 
              />
            ))}
            <span className="text-[10px] text-gray-500 ml-1 font-mono">{book.avgRating || "4.5"} Rating</span>
          </div>
          <div className="text-[10px] font-bold text-blue-600/80 tracking-tighter uppercase">
            BookShelf Insight
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={downloadImage}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-2xl flex items-center space-x-2 shadow-xl shadow-blue-500/20"
      >
        <Download size={18} />
        <span>Download Infographic</span>
      </motion.button>
    </div>
  );
}
