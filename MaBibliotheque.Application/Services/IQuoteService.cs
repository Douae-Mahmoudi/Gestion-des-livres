namespace MaBibliotheque.Application.Services
{
    public interface IQuoteService
    {
        Task<QuoteDto?> GetRandomQuoteAsync();
    }

    public class QuoteDto
    {
        public string Quote { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
    }
}