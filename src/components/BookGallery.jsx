import React, { useState } from 'react';
import { Search, Book as BookIcon, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BookInfographic from './BookInfographic';

export default function BookGallery({ books }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">My Bookshelf</h2>
          <p className="text-slate-500 font-medium">Select a book to generate its visual breakdown.</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search titles or authors..." 
            className="bg-white border-2 border-slate-100 focus:border-blue-500 rounded-2xl py-3 pl-12 pr-6 w-full md:w-80 outline-none shadow-sm transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map((book) => (
          <motion.div 
            layoutId={`book-${book.id}`}
            key={book.id}
            whileHover={{ y: -5 }}
            onClick={() => setSelectedBook(book)}
            className="bg-white rounded-3xl p-6 border-2 border-slate-50 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all cursor-pointer group flex flex-col h-full"
          >
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
              <BookIcon className="text-slate-500 group-hover:text-white transition-colors" size={24} />
            </div>
            
            <h3 className="font-bold text-slate-900 leading-tight mb-1 line-clamp-2 flex-grow">
              {book.title}
            </h3>
            <p className="text-sm text-slate-400 font-medium mb-4">{book.author}</p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-tighter">View Insight</span>
              <ChevronRight size={16} className="text-blue-600" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal / Overlay for Infographic */}
      <AnimatePresence>
        {selectedBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBook(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col items-center"
            >
              <button 
                onClick={() => setSelectedBook(null)}
                className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>
              
              <BookInfographic book={selectedBook} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
