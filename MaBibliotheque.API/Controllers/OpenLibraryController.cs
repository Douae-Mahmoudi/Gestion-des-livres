using MaBibliotheque.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MaBibliotheque.API.Controllers
{
    [ApiController]
    [Route("api/books/openlibrary")] 
    public class OpenLibraryController : ControllerBase
    {
        private readonly IOpenLibraryService _openLibraryService;

        public OpenLibraryController(IOpenLibraryService openLibraryService)
        {
            _openLibraryService = openLibraryService;
        }

        // Recherche des livres sur l'API Open Library.
        [HttpGet("search")]
        [AllowAnonymous] // Normalement, les recherches publiques ne nécessitent pas d'authentification
        public async Task<IActionResult> Search([FromQuery] string query, [FromQuery] int page = 1)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest("La requête de recherche est requise.");
            }
            if (page < 1) page = 1;

            var books = await _openLibraryService.SearchBooksAsync(query, page);
            return Ok(books);
        }

        //Récupère les livres tendances du jour de l'API Open Library.
        // GET /api/books/openlibrary/trending
        [HttpGet("trending")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTrending()
        {
            var books = await _openLibraryService.GetTrendingBooksAsync();
            return Ok(books);
        }

        // Récupère les détails d'une œuvre Open Library par sa clé (ex: OL45804W).
        //GET /api/books/openlibrary/details/{key}
        [HttpGet("details/{key}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDetails(string key)
        {
           
            string bookKey = key.StartsWith("/works/", StringComparison.OrdinalIgnoreCase) ? key : $"/works/{key}";

            var details = await _openLibraryService.GetBookDetailsAsync(bookKey);
            if (details == null)
            {
                return NotFound($"Livre avec la clé {key} non trouvé.");
            }
            return Ok(details);
        }
    }
}