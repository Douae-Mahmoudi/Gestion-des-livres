
namespace MaBibliotheque.Application.DTOs.Auth
{
    public class AuthResponse
    {
        public string? UserId { get; set; }
        public string? Email { get; set; }
        public string? Token { get; set; } 
        public bool Success { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }
}