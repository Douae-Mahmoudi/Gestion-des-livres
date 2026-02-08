using MaBibliotheque.Application.DTOs.Books;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace MaBibliotheque.Application.Services
{
    public interface IBookService
    {
        // Gestion des livres
        Task<BookResponse?> GetBookByIdAsync(int bookId, string userId);
        Task<BookResponse?> GetBookByOpenLibraryKeyAsync(string openLibraryKey, string userId);
        Task<BookResponse> CreateBookAsync(CreateBookRequest request, string userId);
        Task<BookResponse?> UpdateBookAsync(int bookId, UpdateBookRequest request, string userId);
        Task<bool> DeleteBookAsync(int bookId, string userId);

        // Bibliothèque personnelle
        Task<UserBookResponse> AddToLibraryAsync(AddToLibraryRequest request, string userId);
        Task<UserBookResponse?> UpdateUserBookAsync(int userBookId, UpdateUserBookRequest request, string userId);
        Task<bool> RemoveFromLibraryAsync(int userBookId, string userId);
        Task<BookListResponse> GetUserLibraryAsync(string userId, string? status = null, int page = 1, int pageSize = 20);

        // Recherche et statistiques
        Task<List<UserBookResponse>> SearchBooksAsync(string query, string userId);
        Task<UserStatsResponse> GetUserStatsAsync(string userId);
    }
}