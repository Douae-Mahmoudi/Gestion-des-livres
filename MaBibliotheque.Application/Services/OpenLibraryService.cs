using System.Text.Json;
using System.Text.Json.Serialization;
using System.Web;
using MaBibliotheque.Application.DTOs.Books;

namespace MaBibliotheque.Application.Services
{
    public class OpenLibraryService : IOpenLibraryService
    {
        private readonly HttpClient _httpClient;


        private record OpenLibrarySearchResponse(
            [property: JsonPropertyName("numFound")] int NumFound,
            [property: JsonPropertyName("docs")] List<OpenLibraryDoc>? Docs
        );

        private record OpenLibraryDoc(
            [property: JsonPropertyName("key")] string? Key,
            [property: JsonPropertyName("title")] string? Title,
            [property: JsonPropertyName("author_name")] List<string>? AuthorName,
            [property: JsonPropertyName("cover_i")] int? CoverI,
            [property: JsonPropertyName("first_publish_year")] int? FirstPublishYear
        );

        // Structure pour les livres tendance (trending/daily.json)
        private record TrendingResponse(
            [property: JsonPropertyName("works")] List<TrendingWork>? Works
        );

        private record TrendingWork(
            [property: JsonPropertyName("key")] string? Key,
            [property: JsonPropertyName("title")] string? Title,
            [property: JsonPropertyName("author_name")] List<string>? AuthorName,
            [property: JsonPropertyName("cover_i")] int? CoverI
        );

        private record TrendingAuthor(
            [property: JsonPropertyName("name")] string? Name
        );

        // Constructeur 
        public OpenLibraryService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }


        public async Task<List<OpenLibraryBookDto>> SearchBooksAsync(string query, int page)
        {
            try
            {
                var encodedQuery = HttpUtility.UrlEncode(query);
                var url = $"search.json?q={encodedQuery}&page={page}";

                Console.WriteLine($" URL complète: {_httpClient.BaseAddress}{url}");

                var response = await _httpClient.GetAsync(url);

                Console.WriteLine($" Status Code: {response.StatusCode}");

                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();

                Console.WriteLine($" Longueur du contenu: {content.Length} caractères");

                var searchResponse = JsonSerializer.Deserialize<OpenLibrarySearchResponse>(content);

                Console.WriteLine($" NumFound: {searchResponse?.NumFound}");
                Console.WriteLine($" Docs count: {searchResponse?.Docs?.Count}");

                if (searchResponse?.Docs == null || !searchResponse.Docs.Any())
                {
                    Console.WriteLine(" Aucun document trouvé dans la réponse");
                    return new List<OpenLibraryBookDto>();
                }

                var results = searchResponse.Docs
                    .Where(d => !string.IsNullOrEmpty(d.Title))
                    .Select(d => new OpenLibraryBookDto
                    {
                        Key = d.Key ?? string.Empty,
                        Title = d.Title ?? "Titre Inconnu",
                        AuthorNames = d.AuthorName ?? new List<string>(),
                        CoverId = d.CoverI,
                        FirstPublishYear = d.FirstPublishYear?.ToString()
                    })
                    .ToList();

                Console.WriteLine($" Résultats retournés: {results.Count}");

                return results;
            }
            catch (HttpRequestException httpEx)
            {
                Console.WriteLine($" Erreur HTTP: {httpEx.Message}");
                return new List<OpenLibraryBookDto>();
            }
            catch (JsonException jsonEx)
            {
                Console.WriteLine($" Erreur de désérialisation JSON: {jsonEx.Message}");
                Console.WriteLine($" Détails: {jsonEx.InnerException?.Message}");
                return new List<OpenLibraryBookDto>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($" Erreur générale: {ex.Message}");
                return new List<OpenLibraryBookDto>();
            }
        }

        public async Task<List<OpenLibraryBookDto>> GetTrendingBooksAsync()
        {
            var trendingBooks = new List<OpenLibraryBookDto>();
            try
            {
                var trendingResponse = await _httpClient.GetAsync("trending/daily.json");
                trendingResponse.EnsureSuccessStatusCode();

                var content = await trendingResponse.Content.ReadAsStringAsync();

                var trendingData = JsonSerializer.Deserialize<TrendingResponse>(content);

                if (trendingData?.Works == null || !trendingData.Works.Any())
                {
                    return new List<OpenLibraryBookDto>();
                }

                var topWorks = trendingData.Works.Take(10).ToList();

                var detailTasks = topWorks.Select(async work =>
                {
                    try
                    {
                        if (string.IsNullOrEmpty(work.Key)) return null;

                        var workDetails = await GetBookDetailsInternalAsync(work.Key);
                        var coverId = work.CoverI ?? (workDetails != null ? GetCoverIdFromDetails(workDetails) : null);

                        return new OpenLibraryBookDto
                        {
                            Key = work.Key,
                            Title = work.Title ?? "Titre Inconnu",
                            AuthorNames = work.AuthorName ?? new List<string>(),
                            Description = workDetails != null ? ExtractDescription(workDetails) : null,
                            CoverId = coverId
                        };
                    }
                    catch (Exception detailEx)
                    {
                        Console.WriteLine($"Erreur détails pour {work.Key}: {detailEx.Message}");
                        return null;
                    }
                }).ToList();

                var results = await Task.WhenAll(detailTasks);
                trendingBooks.AddRange(results.Where(r => r != null)!);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur tendances: {ex.Message}");
            }

            return trendingBooks;
        }

        public async Task<object?> GetBookDetailsAsync(string bookKey)
        {
            return await GetBookDetailsInternalAsync(bookKey);
        }

        private async Task<JsonDocument?> GetBookDetailsInternalAsync(string bookKey)
        {
            try
            {
                var workId = bookKey.Replace("/works/", "");
                var url = $"works/{workId}.json";

                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                return JsonDocument.Parse(content);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur détails livre {bookKey}: {ex.Message}");
                return null;
            }
        }

        private static string? ExtractDescription(JsonDocument doc)
        {
            if (!doc.RootElement.TryGetProperty("description", out var descriptionElement))
                return null;

            if (descriptionElement.ValueKind == JsonValueKind.String)
                return descriptionElement.GetString();

            if (descriptionElement.ValueKind == JsonValueKind.Object &&
                descriptionElement.TryGetProperty("value", out var valueElement) &&
                valueElement.ValueKind == JsonValueKind.String)
                return valueElement.GetString();

            return null;
        }

        private static int? GetCoverIdFromDetails(JsonDocument doc)
        {
            if (doc.RootElement.TryGetProperty("covers", out var coversElement) &&
                coversElement.ValueKind == JsonValueKind.Array &&
                coversElement.GetArrayLength() > 0 &&
                coversElement[0].ValueKind == JsonValueKind.Number)
            {
                return coversElement[0].GetInt32();
            }
            return null;
        }
    }
}