import React, { useState, useEffect } from 'react';
import { X, BookOpen, Clock, BookMarked, Heart, Check, Loader } from 'lucide-react';

const AddToLibraryModal = ({ book, onClose, onSuccess }) => {
  const [selectedStatus, setSelectedStatus] = useState('ToRead');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Book object received:', book);
    console.log('Book keys:', Object.keys(book));
  }, [book]);

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

  // Extraire les données du livre 
  const getBookData = () => {
    const title = safeString(book.title);
    const author = safeString(book.authorNames?.[0] || book.author) || 'Unknown Author';
    const coverId = safeString(book.coverId);
    const publishYear = safeNumber(book.firstPublishYear || book.publishYear);
    
    let openLibraryKey = safeString(book.key || book.openLibraryKey);
    if (openLibraryKey.startsWith('/works/')) {
      openLibraryKey = openLibraryKey.substring('/works/'.length);
    }

    return { title, author, coverId, publishYear, openLibraryKey };
  };

  const bookData = getBookData();

  // Les statuts 
  const statusOptions = [
    {
      value: 'ToRead',
      label: 'À lire',
      icon: Clock,
      color: 'blue',
      description: 'Envie de lire ce livre'
    },
    {
      value: 'Reading',
      label: 'En cours de lecture',
      icon: BookOpen,
      color: 'purple',
      description: 'Lecture en cours'
    },
    {
      value: 'Read',
      label: 'Lu',
      icon: Check,
      color: 'green',
      description: 'Déjà lu ce livre'
    },
    {
      value: 'Favorite',
      label: 'Favori',
      icon: Heart,
      color: 'red',
      description: 'Un de mes coups de cœur'
    }
  ];

  const handleAddToLibrary = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Récupérer le token d'authentification
      const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('jwt');
      
      if (!token) {
        throw new Error('You must be logged in to add books to your library. Please log in first.');
      }

      const requestBody = {
        openLibraryKey: bookData.openLibraryKey,
        title: bookData.title,
        author: bookData.author,
        coverId: bookData.coverId || null,
        publishYear: bookData.publishYear,
        status: selectedStatus
      };

      console.log('Sending request:', requestBody);

      const response = await fetch('https://localhost:7231/api/books/library', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        }
        
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(errorData.message || errorData.title || `Failed to add book (${response.status})`);
      }

      const result = await response.json();
      console.log('Success response:', result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      onClose();
    } catch (err) {
      console.error('Error adding to library:', err);
      setError(err.message || 'An error occurred while adding the book');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getColorClasses = (color, isSelected) => {
    const colors = {
      blue: {
        border: isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-400',
        icon: 'text-blue-600',
        bg: 'bg-blue-600',
        text: 'text-blue-600'
      },
      purple: {
        border: isSelected ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-400',
        icon: 'text-purple-600',
        bg: 'bg-purple-600',
        text: 'text-purple-600'
      },
      green: {
        border: isSelected ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-400',
        icon: 'text-green-600',
        bg: 'bg-green-600',
        text: 'text-green-600'
      },
      red: {
        border: isSelected ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-red-400',
        icon: 'text-red-600',
        bg: 'bg-red-600',
        text: 'text-red-600'
      }
    };
    return colors[color];
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ajouter à la bibliothèque</h2>
            <p className="text-sm text-gray-500 mt-1">Choisissez comment suivre ce livre</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Book Info */}
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
          <div className="flex gap-4">
            <div className="w-20 h-28 bg-gray-900 rounded-lg shadow-md overflow-hidden flex-shrink-0">
              {bookData.coverId ? (
                <img
                  src={`https://covers.openlibrary.org/b/id/${bookData.coverId}-M.jpg`}
                  alt={bookData.title || 'Book cover'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  <BookMarked className="w-8 h-8 text-gray-500" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-1">
                {bookData.title || 'Untitled'}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                by {bookData.author}
              </p>
              {bookData.publishYear && (
                <p className="text-xs text-gray-400">
                  Published {bookData.publishYear}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status Selection */}
        <div className="px-8 py-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4">
            Select Reading Status
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedStatus === option.value;
              const colorClasses = getColorClasses(option.color, isSelected);
              
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={`relative border-2 rounded-xl p-4 transition-all duration-200 text-left ${colorClasses.border} ${
                    isSelected ? 'shadow-lg scale-[1.02]' : 'hover:shadow-md'
                  }`}
                >
                  {isSelected && (
                    <div className={`absolute top-3 right-3 ${colorClasses.bg} rounded-full p-1`}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <div className={`${colorClasses.icon} mt-0.5`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className={`font-bold text-sm mb-1 ${isSelected ? colorClasses.text : 'text-gray-900'}`}>
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-8 py-6 flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            onClick={handleAddToLibrary}
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-200"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <BookMarked className="w-4 h-4" />
                Ajouter à ma biblio
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToLibraryModal;