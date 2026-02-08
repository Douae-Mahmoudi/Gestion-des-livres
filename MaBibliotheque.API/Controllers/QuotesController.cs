using Microsoft.AspNetCore.Mvc;
using MaBibliotheque.Application.Services;

namespace MaBibliotheque.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuotesController : ControllerBase
    {
        private readonly IQuoteService _quoteService;

        public QuotesController(IQuoteService quoteService)
        {
            _quoteService = quoteService;
        }

        [HttpGet("random")]
        public async Task<IActionResult> GetRandomQuote()
        {
            var quote = await _quoteService.GetRandomQuoteAsync();

            if (quote == null)
            {
                return StatusCode(500, new { message = "Impossible de récupérer une citation" });
            }

            return Ok(quote);
        }
    }
}