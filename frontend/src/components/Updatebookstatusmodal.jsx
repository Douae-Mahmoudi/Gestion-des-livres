import React, { useState } from 'react';
import { X, Clock, BookOpen, Check, Heart, Star, Loader, Trash2 } from 'lucide-react';

const UpdateBookStatusModal = ({ userBook, onClose, onSuccess }) => {
  const [selectedStatus, setSelectedStatus] = useState(userBook.status || 'ToRead');
  const [rating, setRating] = useState(userBook.rating || 0);
  const [review, setReview] = useState(userBook.review || '');
  const [startedAt, setStartedAt] = useState(
    userBook.startedAt ? new Date(userBook.startedAt).toISOString().split('T')[0] : ''
  );
  const [finishedAt, setFinishedAt] = useState(
    userBook.finishedAt ? new Date(userBook.finishedAt).toISOString().split('T')[0] : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const statusOptions = [
    {
      value: 'ToRead',
      label: 'À lire',
      icon: Clock,
      color: 'blue'
    },
    {
      value: 'Reading',
      label: 'En cours',
      icon: BookOpen,
      color: 'purple'
    },
    {
      value: 'Read',
      label: 'Terminé',
      icon: Check,
      color: 'green'
    },
    {
      value: 'Favorite',
      label: 'Favori',
      icon: Heart,
      color: 'red'
    }
  ];

  const handleUpdate = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('jwt');
      
      if (!token) {
        throw new Error('Vous devez être connecté. Veuillez vous identifier.');
      }

      const requestBody = {
        status: selectedStatus,
        rating: rating > 0 ? rating : null,
        review: review.trim() || null,
        startedAt: startedAt || null,
        finishedAt: finishedAt || null
      };

      const response = await fetch(
        `https://localhost:7231/api/books/library/${userBook.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Votre session a expiré. Veuillez vous reconnecter.');
        }
        
        const errorData = await response.json().catch(() => ({ message: 'Échec de la requête' }));
        throw new Error(errorData.message || errorData.title || `Erreur lors de la mise à jour (${response.status})`);
      }

      const result = await response.json();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      onClose();
    } catch (err) {
      console.error('Erreur lors de la mise à jour du livre:', err);
      setError(err.message || 'Une erreur est survenue lors de la mise à jour du livre');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir retirer ce livre de votre bibliothèque ?')) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('jwt');
      
      if (!token) {
        throw new Error('Vous devez être connecté. Veuillez vous identifier.');
      }

      const response = await fetch(
        `https://localhost:7231/api/books/library/${userBook.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Votre session a expiré. Veuillez vous reconnecter.');
        }
        
        const errorData = await response.json().catch(() => ({ message: 'Échec de la requête' }));
        throw new Error(errorData.message || errorData.title || `Erreur lors de la suppression (${response.status})`);
      }

      if (onSuccess) {
        onSuccess({ deleted: true });
      }
      
      onClose();
    } catch (err) {
      console.error('Erreur lors de la suppression du livre:', err);
      setError(err.message || 'Une erreur est survenue lors de la suppression du livre');
    } finally {
      setIsDeleting(false);
    }
  };

  const getColorClasses = (color, isSelected) => {
    const colors = {
      blue: {
        border: isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-400',
        icon: 'text-blue-600'
      },
      purple: {
        border: isSelected ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-400',
        icon: 'text-purple-600'
      },
      green: {
        border: isSelected ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-400',
        icon: 'text-green-600'
      },
      red: {
        border: isSelected ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-red-400',
        icon: 'text-red-600'
      }
    };
    return colors[color];
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mettre à jour le livre</h2>
            <p className="text-sm text-gray-500 mt-1">Gérez votre progression de lecture</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-8 py-8 space-y-8">
          {/* Status Selection */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4">
              Statut de lecture
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedStatus === option.value;
                const colorClasses = getColorClasses(option.color, isSelected);
                
                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedStatus(option.value)}
                    className={`border-2 rounded-lg p-3 transition-all duration-200 ${colorClasses.border} ${
                      isSelected ? 'shadow-md' : ''
                    }`}
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-2 ${colorClasses.icon}`} />
                    <div className="text-xs font-bold text-center">{option.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4">
              Note (Optionnel)
            </h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <button
                  onClick={() => setRating(0)}
                  className="ml-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>

          {/* Review */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4">
              Avis (Optionnel)
            </h3>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Partagez vos impressions sur ce livre..."
              className="w-full border border-gray-200 rounded-lg p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4">
                Commencé le
              </h3>
              <input
                type="date"
                value={startedAt}
                onChange={(e) => setStartedAt(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4">
                Terminé le
              </h3>
              <input
                type="date"
                value={finishedAt}
                onChange={(e) => setFinishedAt(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-8 py-6 flex items-center justify-between">
          <button
            onClick={handleDelete}
            disabled={isDeleting || isSubmitting}
            className="px-6 py-2.5 text-sm font-bold text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Retirer de la bibliothèque
              </>
            )}
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting || isDeleting}
              className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            
            <button
              onClick={handleUpdate}
              disabled={isSubmitting || isDeleting}
              className="px-8 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-200"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateBookStatusModal;