

using System.ComponentModel.DataAnnotations;

namespace MaBibliotheque.Application.DTOs.Auth
{
    public class LoginRequest
    {
        [Required]
        [EmailAddress]//Elle vérifie que la valeur d’une propriété est un email valide.
        public string Email { get; set; }

        [Required]
        [DataType(DataType.Password)] 
        public string Password { get; set; }
    }
}