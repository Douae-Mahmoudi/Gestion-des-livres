using MaBibliotheque.Application.DTOs.Books;

namespace MaBibliotheque.Application.Services
{
    public interface IOpenLibraryService
    {
       
        Task<List<OpenLibraryBookDto>> SearchBooksAsync(string query, int page);

        
        Task<List<OpenLibraryBookDto>> GetTrendingBooksAsync();

       
        Task<object?> GetBookDetailsAsync(string bookKey);
    }
}