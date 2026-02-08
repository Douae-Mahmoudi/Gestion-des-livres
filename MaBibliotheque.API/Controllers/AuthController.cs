using MaBibliotheque.Application.DTOs.Auth;
using MaBibliotheque.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MaBibliotheque.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;//readonly signifie  l'assigner UNIQUEMENT dans le constructeur, pas ailleurs.
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
       
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            
            var result = await _authService.RegisterAsync(request);//Elle renvoie une réponse HTTP 400 Bad Request.
            if (!result.Success) return BadRequest(result.Errors);
            return Ok(result);//Ok() :est une méthode prédéfinies dans ASP.NET Core. Elles viennent de la classe ControllerBase et retourne une réponse HTTP 200 (succès) avec le résultat.
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var result = await _authService.LoginAsync(request);
            if (!result.Success) return BadRequest(result.Errors);
            return Ok(result);
        }
        //[Authorize] : Indique que cette action nécessite une authentification.
        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { success = false, errors = new[] { "Utilisateur non authentifie" } });
            }

            var result = await _authService.ChangePasswordAsync(userId, request);

            if (!result.Success)
            {
                return BadRequest(result.Errors);
            }

            return Ok(new { success = true, message = "Mot de passe modifie avec succes" });
        }

        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleAuthRequest request)
        {
            var result = await _authService.GoogleLoginAsync(request);

            if (!result.Success)
            {
                return BadRequest(result.Errors);
            }

            return Ok(result);
        }
    }
}