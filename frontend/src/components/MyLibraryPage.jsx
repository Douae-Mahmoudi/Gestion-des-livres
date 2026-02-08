import React, { useState, useEffect } from 'react';
import { Search, Plus, ChevronDown, BookOpen, BookMarked, X, Star, Settings } from 'lucide-react';
import BookDetailsModal from './BookDetailsModal';
import UpdateBookStatusModal from './Updatebookstatusmodal';

const MyLibraryPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookToUpdate, setBookToUpdate] = useState(null);
  const [sortBy, setSortBy] = useState('addedAt');
  const [showSortMenu, setShowSortMenu] = useState(false); 


  useEffect(() => {
    fetchLibrary();
  }, [selectedStatus]);

  // Fermer le menu de tri quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = () => setShowSortMenu(false);
    if (showSortMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSortMenu]);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('jwt');
      
      if (!token) {
        console.warn('No authentication token found');
        setBooks([]);
        setLoading(false);
        return;
      }

      const statusMap = {
        'all': '',
        'to-read': 'ToRead',
        'reading': 'Reading',
        'finished': 'Read',
        'favorite': 'Favorite'
      };
      
      const backendStatus = statusMap[selectedStatus];
      const statusParam = backendStatus ? `?status=${backendStatus}` : '';
      
      const res = await fetch(`https://localhost:7231/api/books/library${statusParam}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          console.warn('Authentication failed - token may be expired');
        }
        console.warn('API error:', res.status);
        setBooks([]);
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      const booksArray = Array.isArray(data) ? data : (data.items || data.books || []);
      setBooks(booksArray);
      setLoading(false);
    } catch (error) {
      console.error('Erreur Backend:', error);
      setBooks([]);
      setLoading(false);
    }
  };

  const handleUpdateSuccess = (result) => {
    if (result.deleted) {
      alert('Book removed from your library');
    } else {
      alert('Book updated successfully');
    }
    // Rafraîchir la bibliothèque
    fetchLibrary();
  };

  const statusFilters = [
    { id: 'all', label: 'Tous les livres' },
    { id: 'to-read', label: 'À lire' },
    { id: 'reading', label: 'En cours' },
    { id: 'finished', label: 'Lu' },
    { id: 'favorite', label: 'Favoris' }
  ];

  const sortOptions = [
    { id: 'addedAt', label: 'Ajoutés récemment' },
    { id: 'title', label: 'Titre (A-Z)' },
    { id: 'author', label: 'Auteur (A-Z)' },
    { id: 'rating', label: 'Mieux notés' }
  ];

  const getStatusBadge = (status) => {
    const normalizedStatus = status?.toLowerCase();
    const badges = {
      'toread': { text: 'À lire', bg: 'bg-black' },
      'to-read': { text: 'TO READ', bg: 'bg-black' },
      'reading': { text: 'En cours', bg: 'bg-purple-600' },
      'read': { text: 'FINISHED', bg: 'bg-green-500' },
      'finished': { text: 'Lu', bg: 'bg-green-500' },
      'favorite': { text: 'Favoris', bg: 'bg-red-500' }
    };
    return badges[normalizedStatus] || badges['toread'];
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const filteredBooks = books.filter(book => {
    if (searchQuery === '') return true;
    
    const title = book.book?.title?.toLowerCase() || book.title?.toLowerCase() || '';
    const author = book.book?.author?.toLowerCase() || book.author?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    
    return title.includes(query) || author.includes(query);
  });

  // Fonction de tri côté frontend
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    const bookA = a.book || a;
    const bookB = b.book || b;

    switch (sortBy) {
      case 'addedAt':
        return new Date(b.addedAt) - new Date(a.addedAt); 
      
      case 'title':
        const titleA = (bookA.title || '').toLowerCase();
        const titleB = (bookB.title || '').toLowerCase();
        return titleA.localeCompare(titleB);
      
      case 'author':
        const authorA = (bookA.author || '').toLowerCase();
        const authorB = (bookB.author || '').toLowerCase();
        return authorA.localeCompare(authorB);
      
      case 'rating':
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return ratingB - ratingA; 
      
      default:
        return 0;
    }
  });

  const currentSortLabel = sortOptions.find(opt => opt.id === sortBy)?.label || 'Recent Added';

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

        {/* SEARCH BAR  */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search titles, authors, genres..."
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
          </div>
        </div>

        {/* NAVIGATION LINKS  */}
        <div className="flex items-center space-x-8 text-[11px] font-bold  tracking-[0.15em] text-gray-500">
          <a href="/books" className="hover:text-black transition-colors">Explorer</a>
          <a href="/mes-livres" className="text-black">Mes Livres</a>
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

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* HEADER avec filtres */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {statusFilters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setSelectedStatus(filter.id)}
                className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  selectedStatus === filter.id
                    ? 'bg-black text-white shadow-lg shadow-gray-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs relative">
            <span className="text-gray-400 font-bold uppercase tracking-wider">Sort by:</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowSortMenu(!showSortMenu);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-md hover:border-black transition-all"
            >
              <span className="font-bold text-gray-700">{currentSortLabel}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {showSortMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[180px]">
                {sortOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSortBy(option.id);
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      sortBy === option.id ? 'bg-gray-50 text-black' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BOOKS GRID */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-[2/3] rounded-xl mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : sortedBooks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {sortedBooks.map((userBook, i) => {
              const book = userBook.book || userBook;
              const badge = getStatusBadge(userBook.status);
              
              return (
                <div
                  key={userBook.id || i}
                  className="flex flex-col group cursor-pointer"
                  onClick={() => setBookToUpdate(userBook)}
                >
                  <div className="relative aspect-[2/3] bg-gray-900 rounded-xl shadow-lg overflow-hidden mb-3 group-hover:shadow-2xl transition-all duration-300">
                    <div className={`absolute top-2 left-2 ${badge.bg} text-white text-[8px] font-bold px-2 py-1 rounded-md uppercase tracking-wider z-10`}>
                      {badge.text}
                    </div>

                    {(book.coverId || book.coverUrl) ? (
                      <img
                        src={book.coverUrl || `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <BookMarked className="w-16 h-16 text-gray-600" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold mb-1 group-hover:text-black transition-colors line-clamp-2 leading-tight">
                      {book.title}
                    </h3>
                    <p className="text-gray-400 text-xs mb-1 line-clamp-1">
                      {book.author || 'Unknown Author'}
                    </p>
                    <div className="flex items-center gap-1">
                      {userBook.rating ? (
                        <>
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-bold text-gray-700">
                            {userBook.rating}.0
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">Not rated</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">
              {searchQuery ? `No books found for "${searchQuery}"` : 'No books in your library yet'}
            </p>
            <p className="text-gray-400 text-sm">
              {searchQuery ? 'Try a different search term' : 'Start adding books to build your collection!'}
            </p>
          </div>
        )}
      </main>

      <button 
        onClick={() => window.location.href = '/books'}
        className="fixed bottom-8 right-8 bg-black text-white px-6 py-4 rounded-full shadow-2xl hover:bg-gray-800 hover:scale-110 transition-all duration-300 flex items-center gap-3"
      >
        <Plus className="w-5 h-5" />
        <span className="text-sm font-bold uppercase tracking-wider">Add Book</span>
      </button>

      {/* MODAL  */}
      {selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}

      {/* MODAL - Update Status */}
      {bookToUpdate && (
        <UpdateBookStatusModal
          userBook={bookToUpdate}
          onClose={() => setBookToUpdate(null)}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
};

export default MyLibraryPage;