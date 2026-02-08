using MaBibliotheque.Application.DTOs.Books;
using MaBibliotheque.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace MaBibliotheque.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Nécessite une authentification
    public class BooksController : ControllerBase
    {
        private readonly IBookService _bookService;

        public BooksController(IBookService bookService)
        {
            _bookService = bookService;
        }
        
        private string GetUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException("Utilisateur non authentifié");
        }

        [HttpGet("library")]
        public async Task<IActionResult> GetLibrary(
            [FromQuery] string? status = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = GetUserId();
            var result = await _bookService.GetUserLibraryAsync(userId, status, page, pageSize);
            return Ok(result);
        }

        //Récupérer un livre par son ID
       
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBookById(int id)
        {
            var userId = GetUserId();
            var book = await _bookService.GetBookByIdAsync(id, userId);

            if (book == null)
                return NotFound(new { message = "Livre introuvable" });

            return Ok(book);
        }

        //Récupérer un livre par sa clé OpenLibrary
        [HttpGet("openlibrary/{key}")]
        public async Task<IActionResult> GetBookByOpenLibraryKey(string key)
        {
            var userId = GetUserId();
            var decodedKey = Uri.UnescapeDataString(key);
            var book = await _bookService.GetBookByOpenLibraryKeyAsync(decodedKey, userId);

            if (book == null)
                return NotFound(new { message = "Livre introuvable" });

            return Ok(book);
        }

        
        //Ajouter un livre à la bibliothèque
        [HttpPost("library")]
        public async Task<IActionResult> AddToLibrary([FromBody] AddToLibraryRequest request)
        {
            //ModelState contient la validation automatique des données reçues (par exemple, si un champ obligatoire est manquant).
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();
            var result = await _bookService.AddToLibraryAsync(request, userId);

            return CreatedAtAction(
                nameof(GetBookById),
                new { id = result.Book.Id },
                result
            );
        }

        
        // Mettre à jour un livre dans la bibliothèque
        [HttpPut("library/{userBookId}")]
        public async Task<IActionResult> UpdateUserBook(
            int userBookId,
            [FromBody] UpdateUserBookRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();
            var result = await _bookService.UpdateUserBookAsync(userBookId, request, userId);

            if (result == null)
                return NotFound(new { message = "Livre introuvable dans votre bibliothèque" });

            return Ok(result);
        }

        //Supprimer un livre de la bibliothèque
        [HttpDelete("library/{userBookId}")]
        public async Task<IActionResult> RemoveFromLibrary(int userBookId)
        {
            var userId = GetUserId();
            var success = await _bookService.RemoveFromLibraryAsync(userBookId, userId);

            if (!success)
                return NotFound(new { message = "Livre introuvable dans votre bibliothèque" });

            return Ok(new { message = "Livre supprimé de votre bibliothèque" });
        }

        // Rechercher des livres dans la bibliothèque
        [HttpGet("search")]
        public async Task<IActionResult> SearchBooks([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { message = "La requête de recherche est vide" });

            var userId = GetUserId();
            var results = await _bookService.SearchBooksAsync(query, userId);

            return Ok(results);
        }

        
        //Obtenir les statistiques de lecture de l'utilisateur
       
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var userId = GetUserId();
            var stats = await _bookService.GetUserStatsAsync(userId);

            return Ok(stats);
        }

        
        // Créer un nouveau livre 
        
        [HttpPost]
        public async Task<IActionResult> CreateBook([FromBody] CreateBookRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();
            var result = await _bookService.CreateBookAsync(request, userId);

            return CreatedAtAction(nameof(GetBookById), new { id = result.Id }, result);
        }

        //Mettre à jour un livre (usage avancé)
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBook(int id, [FromBody] UpdateBookRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();
            var result = await _bookService.UpdateBookAsync(id, request, userId);

            if (result == null)
                return NotFound(new { message = "Livre introuvable" });

            return Ok(result);
        }

        /// Supprimer un livre 
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var userId = GetUserId();
            var success = await _bookService.DeleteBookAsync(id, userId);

            if (!success)
                return NotFound(new { message = "Livre introuvable" });

            return Ok(new { message = "Livre supprimé avec succès" });
        }
    }
}