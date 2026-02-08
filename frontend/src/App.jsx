import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom'; 

// API Services
import { fetchBooks, fetchTrendingBooks, fetchBookDetails } from './services/api'; 

// Pages
import BooksPage from './components/BooksPage'; 
import MyLibraryPage from './components/MyLibraryPage';
import Page from './components/Page';
import StatsPage from './components/StatsPage';
import SettingsPage from './components/SettingsPage';

const App = () => {
    const [query, setQuery] = useState('');
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true); 
    
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('favorites');
        return saved ? JSON.parse(saved) : [];
    }); 
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBookKey, setSelectedBookKey] = useState(null);
    const [modalBookDetails, setModalBookDetails] = useState(null); 
    const [modalLoading, setModalLoading] = useState(false);

    const loadBooks = async (searchQuery, currentPage, isSearch = false) => {
        setLoading(true);
        try {
            let results = [];
            if (isSearch && searchQuery.trim() !== '') {
                results = await fetchBooks(searchQuery, currentPage);
                setHasMore(results.length > 0); 
            } else {
                results = await fetchTrendingBooks();
                setHasMore(false);
            }
            setBooks(results);
        } catch (error) {
            console.error("Erreur:", error);
            setBooks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        loadBooks(query, 1, query.trim() !== '');
    };
    
    const onPageChange = (newPage) => {
        setPage(newPage);
        loadBooks(query, newPage, true); 
    };

    useEffect(() => {
        if (query === '') loadBooks('', 1, false);
    }, [query]); 
    
    const toggleFavorite = (book) => {
        const isFav = favorites.some((fav) => fav.key === book.key);
        const updated = isFav ? favorites.filter((fav) => fav.key !== book.key) : [...favorites, book];
        setFavorites(updated);
        localStorage.setItem('favorites', JSON.stringify(updated));
    };

    const openModal = (bookKey) => {
        setSelectedBookKey(bookKey); 
        setIsModalOpen(true);
    };

    useEffect(() => {
        if (selectedBookKey && isModalOpen) {
            const loadDetails = async () => {
                setModalLoading(true);
                try {
                    const details = await fetchBookDetails(selectedBookKey);
                    setModalBookDetails(details);
                } finally {
                    setModalLoading(false);
                }
            };
            loadDetails();
        }
    }, [selectedBookKey, isModalOpen]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Routes>
                {/* Page d'accueil  */}
                <Route path="/" element={<Page />} />

                <Route path="/discover" element={<BooksPage />} />

                <Route path="/books" element={
                    <BooksPage
                        query={query}
                        setQuery={setQuery}
                        books={books}
                        loading={loading}
                        handleSearch={handleSearch}
                        favorites={favorites}
                        toggleFavorite={toggleFavorite}
                        openModal={openModal}
                        page={page}
                        hasMore={hasMore}
                        onPageChange={onPageChange}
                    />
                } />

                {/* Ma Bibliothèque */}
                <Route path="/mes-livres" element={<MyLibraryPage />} />

                {/* Statistiques */}
                <Route path="/statistiques" element={<StatsPage />} />

                {/* Page de recherche */}

                {/* Paramètres / Settings */}
                <Route path="/parametres" element={<SettingsPage />} />
            </Routes>
        </div>
    );
};

export default App;