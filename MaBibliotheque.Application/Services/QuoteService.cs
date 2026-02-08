using System.Text.Json;
using System.Text.Json.Serialization;

namespace MaBibliotheque.Application.Services
{
    public class QuoteService : IQuoteService
    {
        private readonly HttpClient _httpClient;

        public QuoteService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<QuoteDto?> GetRandomQuoteAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("random");
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var quotes = JsonSerializer.Deserialize<List<ZenQuoteResponse>>(content);

                if (quotes != null && quotes.Count > 0)
                {
                    return new QuoteDto
                    {
                        Quote = quotes[0].Quote,
                        Author = quotes[0].Author
                    };
                }

                return GetFallbackQuote();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Erreur API ZenQuotes: {ex.Message}");
                return GetFallbackQuote();
            }
        }

        private static QuoteDto GetFallbackQuote()
        {
            return new QuoteDto
            {
                Quote = "A room without books is like a body without a soul.",
                Author = "Cicero"
            };
        }

        // DTO interne pour désérialiser la réponse ZenQuotes
        private class ZenQuoteResponse
        {
            [JsonPropertyName("q")]
            public string Quote { get; set; } = string.Empty;

            [JsonPropertyName("a")]
            public string Author { get; set; } = string.Empty;
        }
    }
}