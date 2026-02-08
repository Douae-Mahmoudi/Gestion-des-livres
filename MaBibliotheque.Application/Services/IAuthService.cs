using MaBibliotheque.Application.DTOs.Auth;
using System.Threading.Tasks;

namespace MaBibliotheque.Application.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<AuthResponse> ChangePasswordAsync(string userId, ChangePasswordRequest request);
        Task<AuthResponse> GoogleLoginAsync(GoogleAuthRequest request);
    }
}