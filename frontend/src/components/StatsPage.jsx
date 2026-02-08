import React, { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Star, Target, Calendar, Award, BarChart3, PieChart, Settings } from 'lucide-react';

const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('jwt');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch('https://localhost:7231/api/books/stats', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(`Failed to fetch stats (${response.status})`);
      }

      const data = await response.json();
      console.log(' Stats received:', data);
      setStats(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Calculer le pourcentage pour les barres de progression
  const getPercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#fdfcf8' }}>
      {/* NAVBAR */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        {/* LOGO */}
        <div className="flex items-center">
          <img 
            src="/logo.png" 
            alt="BiblioHome Logo" 
            className="h-11 w-auto"
          />
        </div>

        <div className="flex items-center space-x-8 text-[11px] font-bold tracking-[0.15em] text-gray-500">
          <a href="/books" className="hover:text-black transition-colors">Explorer</a>
          <a href="/mes-livres" className="hover:text-black transition-colors">Mes Livres</a>
          <a href="/statistiques" className="text-black">Statistiques</a>
          <div 
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-black hover:text-white transition-all group border-l border-gray-200 ml-8"
            onClick={() => window.location.href = '/parametres'}
            title="Settings"
          >
            <Settings className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-12">
        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-black to-gray-800 bg-clip-text text-transparent">
            Statistiques de lecture
          </h1>
          <p className="text-gray-500 text-lg">Suivez votre parcours de lecture et vos accomplissements.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <p className="text-red-600 font-bold mb-2">Error loading statistics</p>
            <p className="text-red-500 text-sm">{error}</p>
            <button 
              onClick={fetchStats}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : stats ? (
          <div className="space-y-8">
            {/* OVERVIEW CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Total Books */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-1">
                  {stats.totalBooks || 0}
                </h3>
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Total des livres</p>
              </div>

              {/* Books Read */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  <Award className="w-5 h-5 text-yellow-500" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-1">
                  {stats.booksRead || stats.finishedBooks || 0}
                </h3>
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Livres lus</p>
              </div>

              {/* Currently Reading */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-1">
                  {stats.currentlyReading || stats.readingBooks || 0}
                </h3>
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">En cours de lecture</p>
              </div>

              {/* Average Rating */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-600 fill-yellow-600" />
                  </div>
                  <PieChart className="w-5 h-5 text-orange-500" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-1">
                  {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                </h3>
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Évaluation moyenne</p>
              </div>
            </div>

            {/* READING PROGRESS */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Progression de lecture
              </h2>
              
              <div className="space-y-6">
                {/* To Read */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">À lire</span>
                    <span className="text-sm font-black text-blue-600">
                      {stats.toReadBooks || 0} books
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                      style={{ width: `${getPercentage(stats.toReadBooks || 0, stats.totalBooks || 1)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Reading */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">En cours de lecture</span>
                    <span className="text-sm font-black text-purple-600">
                      {stats.currentlyReading || stats.readingBooks || 0} books
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-500"
                      style={{ width: `${getPercentage(stats.currentlyReading || stats.readingBooks || 0, stats.totalBooks || 1)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Finished */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Lu</span>
                    <span className="text-sm font-black text-green-600">
                      {stats.booksRead || stats.finishedBooks || 0} books
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                      style={{ width: `${getPercentage(stats.booksRead || stats.finishedBooks || 0, stats.totalBooks || 1)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Favorites */}
                {(stats.favoriteBooks || 0) > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Favoris</span>
                      <span className="text-sm font-black text-red-600">
                        {stats.favoriteBooks || 0} books
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-500"
                        style={{ width: `${getPercentage(stats.favoriteBooks || 0, stats.totalBooks || 1)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {stats.readingGoal && (
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 shadow-lg text-white">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <Target className="w-6 h-6" />
                  Reading Goal 2025
                </h2>
                
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-5xl font-black mb-2">
                      {stats.booksRead || 0}<span className="text-2xl text-blue-200">/{stats.readingGoal}</span>
                    </p>
                    <p className="text-blue-100 text-sm uppercase tracking-wider font-bold">Books Completed</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black">
                      {getPercentage(stats.booksRead || 0, stats.readingGoal)}%
                    </p>
                    <p className="text-blue-100 text-xs uppercase">Complete</p>
                  </div>
                </div>
                
                <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-500 rounded-full"
                    style={{ width: `${getPercentage(stats.booksRead || 0, stats.readingGoal)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {stats.additionalStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.additionalStats.totalPages && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
                    <p className="text-4xl font-black text-gray-900 mb-2">
                      {stats.additionalStats.totalPages.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Pages Read</p>
                  </div>
                )}
                
                {stats.additionalStats.longestStreak && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
                    <p className="text-4xl font-black text-gray-900 mb-2">
                      {stats.additionalStats.longestStreak}
                    </p>
                    <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Day Streak</p>
                  </div>
                )}
                
                {stats.additionalStats.favoriteGenre && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
                    <p className="text-2xl font-black text-gray-900 mb-2">
                      {stats.additionalStats.favoriteGenre}
                    </p>
                    <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Favorite Genre</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No statistics available</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default StatsPage;