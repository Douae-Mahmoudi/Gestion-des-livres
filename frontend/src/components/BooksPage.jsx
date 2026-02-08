import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, ChevronLeft, ChevronRight, BookOpen, BookMarked, X, Settings } from 'lucide-react';
import BookDetailsModal from './BookDetailsModal';
import AddToLibraryModal from './Addtolibrarymodal';

const BooksPage = () => {
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [displayedResults, setDisplayedResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllTrending, setShowAllTrending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookToAdd, setBookToAdd] = useState(null);
  const resultsPerPage = 8;
  
  const user = { firstName: "Amine", lastName: "Berrada" };
  const userInitial = user.firstName.charAt(0).toUpperCase();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const trendRes = await fetch('https://localhost:7231/api/books/openlibrary/trending');
      const trendData = await trendRes.json();
      
      setTrendingBooks(trendData);
      setAllBooks(trendData);
      setDisplayedResults(trendData.slice(3, 50));
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur Backend:', error);
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setDisplayedResults(allBooks.slice(3, 50));
      setIsSearching(false);
      setCurrentPage(1);
      return;
    }
    
    setLoading(true);
    setIsSearching(true);
    setCurrentPage(1);
    
    try {
      const res = await fetch(`https://localhost:7231/api/books/openlibrary/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      const searchResults = data.docs || [];
      setDisplayedResults(searchResults);
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur Recherche:', error);
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setDisplayedResults(allBooks.slice(3, 50));
    setCurrentPage(1);
  };

  const handleAddToLibrarySuccess = (result) => {
    console.log('Book added successfully:', result);
    alert(`"${result.book.title}" has been added to your library!`);
  };

  const totalPages = Math.ceil(displayedResults.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentResults = displayedResults.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const displayedTrendingBooks = showAllTrending ? trendingBooks : trendingBooks.slice(0, 3);

  const filteredTrendingBooks = isSearching 
    ? displayedTrendingBooks.filter(book => 
        book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.authorNames?.some(author => author.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : displayedTrendingBooks;

  return (
    <div className="min-h-screen font-sans text-slate-900" style={{ backgroundColor: '#fdfcf8' }}>
      {/* NAVBAR */}
      <nav className="border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-50">
        
        {/* LOGO  */}
        <div className="flex items-center">
          <img 
            src="/logo.png" 
            alt="BiblioHome Logo" 
            className="h-11 w-auto"
          />
        </div>

        {/* SEARCH BAR */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <form onSubmit={handleSearch} className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search titles, authors, or ISBN..."
              className="w-full bg-gray-50 border-none rounded-md py-2 pl-10 pr-10 text-sm focus:ring-1 focus:ring-black transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

        <div className="flex items-center space-x-8 text-[11px] font-bold tracking-[0.15em] text-gray-500">
          <a href="/" className="text-black">Explorer</a>
          <a href="/mes-livres" className="hover:text-black transition-colors">Mes Livres</a>
          <a href="/statistiques" className="hover:text-black transition-colors">Statistiques</a>
          <div 
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-black hover:text-white transition-all group border-l border-gray-200 ml-8"
            onClick={() => window.location.href = '/parametres'}
            title="Settings"
          >
            <Settings className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-8 py-12">
        {/* TRENDING BOOKS :3 LIVRES */}
        {filteredTrendingBooks.length > 0 && (
          <section className="mb-20">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-serif italic text-gray-800">
                {isSearching ? 'Search Results - Featured' : "Tendances lecture"}
              </h2>
              {!isSearching && (
                <button 
                  onClick={() => setShowAllTrending(!showAllTrending)}
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 border-b border-gray-200 pb-1 hover:text-black transition-all"
                >
                  {showAllTrending ? 'Show Less' : 'View All'}
                </button>
              )}
            </div>

            {loading ? (
              <div className={`grid ${showAllTrending ? 'grid-cols-4 md:grid-cols-5' : 'grid-cols-3'} gap-6`}>
                {[...Array(showAllTrending ? 10 : 3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-[3/4] rounded-sm mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-1.5"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`grid ${showAllTrending ? 'grid-cols-4 md:grid-cols-5' : 'grid-cols-3'} gap-6`}>
                {filteredTrendingBooks.map((book, i) => (
                  <div 
                    key={i} 
                    className="flex flex-col group cursor-pointer"
                    onClick={() => setSelectedBook(book)}
                  >
                    <div className="relative aspect-[3/4] bg-gray-100 shadow-[0_6px_20px_rgba(0,0,0,0.04)] mb-3 overflow-hidden transition-transform duration-500 group-hover:scale-[1.03] rounded-sm">
                      {book.coverId ? (
                        <img 
                          src={`https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`}
                          className="w-full h-full object-cover" 
                          alt={book.title}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <BookMarked className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-[8px] font-bold uppercase tracking-wider text-black mb-1 block">
                        {i === 0 ? "Top Pick" : i === 1 ? "Trending" : i === 2 ? "Popular" : "Hot"}
                      </span>
                      <h3 className="text-xs font-bold mb-0.5 group-hover:text-black transition-colors line-clamp-2 leading-tight">{book.title}</h3>
                      <p className="text-gray-400 italic text-[10px] line-clamp-1">By {book.authorNames?.[0] || 'Unknown'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="border-t border-gray-100 pt-16">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-12">
            {isSearching ? 'Search Results - All Matches' : 'Discovery Results'} 
            <span className="ml-4 opacity-30">{displayedResults.length} Matches</span>
          </h2>

          {loading ? (
            <div className="space-y-20">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-16 animate-pulse">
                  <div className="w-36 h-52 bg-gray-200 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : currentResults.length > 0 ? (
            <div className="space-y-20">
              {currentResults.map((book, i) => (
                <div 
                  key={i} 
                  className="flex gap-16 group cursor-pointer"
                  onClick={() => setSelectedBook(book)}
                >
                  <div className="w-36 h-52 bg-slate-900 flex-shrink-0 shadow-xl group-hover:shadow-2xl transition-all duration-500 overflow-hidden rounded-sm">
                    {book.coverId ? (
                      <img 
                        src={`https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                        alt={book.title}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                        <BookMarked className="w-12 h-12 text-slate-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <div className="mb-6">
                      <h3 className="text-3xl font-medium mb-3 group-hover:text-black transition-colors">{book.title}</h3>
                      <div className="flex items-center gap-4 text-xs tracking-wider">
                        <span className="font-bold text-black uppercase">{book.authorNames?.[0] || 'Unknown Author'}</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-400 italic">First Published {book.firstPublishYear || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-500 leading-relaxed text-sm max-w-2xl line-clamp-3 mb-8">
                      {book.description || "This work explores profound themes through a minimalist lens, capturing the essence of its era and providing a critical look at the human condition."}
                    </p>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setBookToAdd(book);
                      }}
                      className="flex items-center gap-2 bg-blue-600 text-white w-fit px-6 py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:shadow-xl transition-all duration-300"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Ajouter à ma biblio
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <BookMarked className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No results found for "{searchQuery}"</p>
              <button 
                onClick={clearSearch}
                className="mt-4 text-black hover:text-gray-700 text-sm font-bold uppercase tracking-wider"
              >
                Clear Search
              </button>
            </div>
          )}

          {displayedResults.length > 0 && (
            <div className="mt-24 pt-10 border-t border-gray-100 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span>Page {String(currentPage).padStart(2, '0')} — {String(totalPages).padStart(2, '0')}</span>
              <div className="flex gap-12">
                <button onClick={goToPreviousPage} disabled={currentPage === 1} className={`flex items-center gap-2 transition-colors ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-black cursor-pointer'}`}>
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button onClick={goToNextPage} disabled={currentPage === totalPages} className={`flex items-center gap-2 transition-colors ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'text-black hover:text-black cursor-pointer'}`}>
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* MODAL */}
      {selectedBook && (
        <BookDetailsModal 
          book={selectedBook}
          onClose={() => setSelectedBook(null)} 
        />
      )}

      {/* MODAL  */}
      {bookToAdd && (
        <AddToLibraryModal
          book={bookToAdd}
          onClose={() => setBookToAdd(null)}
          onSuccess={handleAddToLibrarySuccess}
        />
      )}
    </div>
  );
};

export default BooksPage;