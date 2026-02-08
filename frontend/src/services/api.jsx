import axios from 'axios';

const API_BASE_URL = 'https://localhost:7231/api/books/openlibrary';

// Fonction pour récupérer les livres en se basant sur une recherche
export const fetchBooks = async (query, page = 1) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/search`, {
            params: {
                query: query,
                page: page
            }
        });
        
        return response.data.docs || [];
    } catch (err) {
        console.error("Erreur de recherche:", err);
        return [];
    }
};

// Fonction pour récupérer les livres tendances du jour
export const fetchTrendingBooks = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/trending`);
        return response.data || [];
    } catch (err) {
        console.error("Erreur de chargement des livres tendance:", err);
        return [];
    }
};

// Fonction pour récupérer les détails d'un livre
export const fetchBookDetails = async (bookKey) => {
    try {
        const workId = bookKey.replace('/works/', '');
        const response = await axios.get(`${API_BASE_URL}/details/${workId}`);
        return response.data;
    } catch (err) {
        console.error('Erreur lors du chargement des détails du livre:', err);
        return null;
    }
};