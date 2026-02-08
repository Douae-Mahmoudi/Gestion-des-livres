using System.ComponentModel.DataAnnotations;

namespace MaBibliotheque.Application.DTOs.Auth
{
    public class GoogleAuthRequest
    {
        [Required(ErrorMessage = "Le token Google est requis")]
        public string IdToken { get; set; } = string.Empty;
    }
}