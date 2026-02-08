import React, { useState, useEffect } from 'react';
import { X, BookOpen, Calendar, User, Tag, Star, PlusCircle } from 'lucide-react';
import AddToLibraryModal from './Addtolibrarymodal';

const BookDetailsModal = ({ book, onClose }) => {
  const [bookDetails, setBookDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddToLibrary, setShowAddToLibrary] = useState(false);

  useEffect(() => {
    console.log(' showAddToLibrary changed:', showAddToLibrary);
    console.log(' bookDetails available:', !!bookDetails);
  }, [showAddToLibrary, bookDetails]);

  const safeString = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value.value) return String(value.value);
    return String(value);
  };

  const safeNumber = (value) => {
    if (!value) return null;
    if (typeof value === 'number') return value;
    if (typeof value === 'object' && value.value) return Number(value.value);
    const num = Number(value);
    return isNaN(num) ? null : num;
  };

  const safeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object' && value.value) {
      return Array.isArray(value.value) ? value.value : [String(value.value)];
    }
    return [];
  };

  useEffect(() => {
    if (book) {
      fetchBookDetails();
    }
  }, [book]);

  const fetchBookDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const cleanKey = safeString(book.key).replace('/works/', '');
      const res = await fetch(`https://localhost:7231/api/books/openlibrary/details/${cleanKey}`);
      
      if (!res.ok) {
        throw new Error('Book not found');
      }
      
      const data = await res.json();
      console.log('Details from API:', data);
      
      // Normaliser toutes les données et s'assurer que key est au bon format
      const mergedData = {
        key: safeString(data.key || book.key), // Garde le format /works/XXX
        title: safeString(data.title || book.title),
        description: safeString(data.description || book.description),
        authorNames: safeArray(data.authorNames || book.authorNames),
        author: safeString(data.author || book.author || (safeArray(data.authorNames || book.authorNames)[0])),
        firstPublishYear: safeNumber(data.firstPublishYear || book.firstPublishYear),
        coverId: safeString(data.coverId || book.coverId),
        coverUrl: safeString(data.coverUrl || book.coverUrl),
        openLibraryKey: cleanKey, // Version nettoyée pour l'API
      };
      
      console.log('Merged book data for modal:', mergedData);
      
      setBookDetails(mergedData);
      setLoading(false);
    } catch (error) {
      console.error(' Error fetching book details:', error);
      
      const fallbackData = {
        key: safeString(book.key),
        title: safeString(book.title),
        description: safeString(book.description),
        authorNames: safeArray(book.authorNames),
        author: safeString(book.author || (safeArray(book.authorNames)[0])),
        firstPublishYear: safeNumber(book.firstPublishYear),
        coverId: safeString(book.coverId),
        coverUrl: safeString(book.coverUrl),
        openLibraryKey: safeString(book.key).replace('/works/', ''),
      };
      
      console.log(' Using fallback data:', fallbackData);
      
      setBookDetails(fallbackData);
      setLoading(false);
    }
  };

  const handleAddToLibrarySuccess = (result) => {
    console.log('Book added successfully:', result);
    alert(`"${result.book.title}" has been added to your library!`);
    setShowAddToLibrary(false);
  };

  const getCoverImageUrl = () => {
    if (!bookDetails) return null;
    
    const coverUrl = bookDetails.coverUrl || bookDetails.CoverUrl;
    if (coverUrl && coverUrl.trim()) {
      return coverUrl.replace('-M.jpg', '-L.jpg');
    }
    
    const coverId = bookDetails.coverId || bookDetails.CoverId;
    if (coverId && coverId.trim()) {
      return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
    }
    
    return null;
  };

  if (!book) return null;

  const coverUrl = bookDetails ? getCoverImageUrl() : null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between z-10">
             {/* LOGO  */}
        <div className="flex items-center">
          <img 
            src="/logo.png" 
            alt="BiblioHome Logo" 
            className="h-11 w-auto"
          />
        </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={onClose}
                className="text-blue-600 hover:text-blue-700 font-bold text-sm uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          ) : bookDetails ? (
            <div className="p-8">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                <span>Home</span>
                <span>/</span>
                <span>Classic Literature</span>
                <span>/</span>
                <span className="text-gray-900 font-bold">{bookDetails.title || 'Book Details'}</span>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Book Cover */}
                <div className="md:col-span-1">
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-900 to-black shadow-2xl rounded-sm overflow-hidden">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={bookDetails.title || 'Book cover'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <BookOpen className="w-20 h-20 text-gray-400 mb-4" />
                        <p className="text-xs text-gray-500 font-medium">No Cover Available</p>
                      </div>
                    )}
                  </div>

                  {/* Rating & Reviews */}
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">4.5</span>
                    </div>
                    <span className="text-gray-400">1.2k Reviews</span>
                  </div>
                </div>

                {/* Book Info */}
                <div className="md:col-span-2">
                  <h1 className="text-5xl font-serif font-bold mb-4 leading-tight">
                    {bookDetails.title || 'Untitled'}
                  </h1>

                  <p className="text-xl text-blue-600 italic mb-6">
                    by {(bookDetails.authorNames && bookDetails.authorNames[0]) || 'Unknown Author'}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider rounded-full">
                      Fiction
                    </span>
                    {bookDetails.firstPublishYear && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-full">
                        {bookDetails.firstPublishYear}
                      </span>
                    )}
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-full">
                      Modernism
                    </span>
                  </div>

                  <div className="flex gap-4 mb-8">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Opening AddToLibrary with book:', bookDetails);
                        setShowAddToLibrary(true);
                      }}
                      className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-sm text-sm font-bold uppercase tracking-wider hover:bg-black transition-all shadow-lg hover:shadow-xl"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Ajouter à ma biblio
                    </button>
                  </div>

                  {/* Description */}
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {bookDetails.description || 
                        "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since. 'Whenever you feel like criticizing any one,' he told me, 'just remember that all the people in this world haven't had the advantages that you've had.'"}
                    </p>
                    
                    <p className="text-gray-700 leading-relaxed mb-4">
                      The novel tells the tragic story of Jay Gatsby, a self-made millionaire, and his pursuit of Daisy Buchanan, a wealthy young woman whom he loved in his youth. Set in the prosperous Long Island of 1922, it provides a critical social history of Prohibition-era America during the Jazz Age.
                    </p>

                    <p className="text-gray-700 leading-relaxed">
                      Fitzgerald's masterpiece explores themes of decadence, idealism, resistance to change, social upheaval, and excess, creating a portrait of the Roaring Twenties that has been described as a cautionary tale regarding the American Dream.
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="border-t border-gray-100 pt-8 flex justify-center">
                <div className="grid grid-cols-3 gap-16 max-w-2xl">
                  <div>
                    <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider mb-2">
                      <Calendar className="w-4 h-4" />
                      Published
                    </div>
                    <p className="font-bold">{bookDetails.firstPublishYear || 'N/A'}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider mb-2">
                      <User className="w-4 h-4" />
                      Author
                    </div>
                    <p className="font-bold">{(bookDetails.authorNames && bookDetails.authorNames[0]) || 'Unknown'}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider mb-2">
                      <Tag className="w-4 h-4" />
                      Genre
                    </div>
                    <p className="font-bold">Fiction</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Modal Add to Library */}
      {showAddToLibrary && bookDetails && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
          <AddToLibraryModal
            book={bookDetails}
            onClose={() => {
              console.log(' Closing AddToLibrary modal');
              setShowAddToLibrary(false);
            }}
            onSuccess={handleAddToLibrarySuccess}
          />
        </div>
      )}
      
      {/* Debug indicator */}
      {showAddToLibrary && !bookDetails && (
        <div style={{ position: 'fixed', top: 10, right: 10, background: 'red', color: 'white', padding: '10px', zIndex: 9999 }}>
           Modal ouvert mais bookDetails manquant!
        </div>
      )}
    </>
  );
};

export default BookDetailsModal;
