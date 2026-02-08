using MaBibliotheque.Application.DTOs.Auth;
using MaBibliotheque.Application.Services;
using MaBibliotheque.Domain.Entities;
using MaBibliotheque.Infrastructure.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Google.Apis.Auth;
using System.Linq;
using System.Threading.Tasks;

namespace MaBibliotheque.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly JwtTokenService _jwtTokenService;
        private readonly IConfiguration _configuration;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            JwtTokenService jwtTokenService,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtTokenService = jwtTokenService;
            _configuration = configuration;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Errors = new() { "Un utilisateur avec cet email existe deja" }
                };
            }

            var user = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email
            };

            var result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                return new AuthResponse
                {
                    Success = false,
                    Errors = result.Errors.Select(e => e.Description).ToList()
                };
            }

            var token = _jwtTokenService.GenerateToken(user.Id, user.Email!);

            return new AuthResponse
            {
                Success = true,
                UserId = user.Id,
                Email = user.Email,
                Token = token
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Errors = new() { "Email ou mot de passe incorrect" }
                };
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);

            if (!result.Succeeded)
            {
                return new AuthResponse
                {
                    Success = false,
                    Errors = new() { "Email ou mot de passe incorrect" }
                };
            }

            var token = _jwtTokenService.GenerateToken(user.Id, user.Email!);

            return new AuthResponse
            {
                Success = true,
                UserId = user.Id,
                Email = user.Email,
                Token = token
            };
        }

        public async Task<AuthResponse> ChangePasswordAsync(string userId, ChangePasswordRequest request)
        {
            if (request.NewPassword != request.ConfirmPassword)
            {
                return new AuthResponse
                {
                    Success = false,
                    Errors = new() { "Les mots de passe ne correspondent pas" }
                };
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Errors = new() { "Utilisateur non trouve" }
                };
            }

            var result = await _userManager.ChangePasswordAsync(
                user,
                request.OldPassword,
                request.NewPassword
            );

            if (result.Succeeded)
            {
                return new AuthResponse
                {
                    Success = true,
                    UserId = user.Id,
                    Email = user.Email
                };
            }

            return new AuthResponse
            {
                Success = false,
                Errors = result.Errors.Select(e => e.Description).ToList()
            };
        }

        public async Task<AuthResponse> GoogleLoginAsync(GoogleAuthRequest request)
        {
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { _configuration["Authentication:Google:ClientId"] }
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);

                var user = await _userManager.FindByEmailAsync(payload.Email);

                if (user == null)
                {
                    user = new ApplicationUser
                    {
                        UserName = payload.Email,
                        Email = payload.Email,
                        EmailConfirmed = true
                    };

                    var createResult = await _userManager.CreateAsync(user);
                    if (!createResult.Succeeded)
                    {
                        return new AuthResponse
                        {
                            Success = false,
                            Errors = createResult.Errors.Select(e => e.Description).ToList()
                        };
                    }
                }

                var token = _jwtTokenService.GenerateToken(user.Id, user.Email!);

                return new AuthResponse
                {
                    Success = true,
                    UserId = user.Id,
                    Email = user.Email,
                    Token = token
                };
            }
            catch (InvalidJwtException)
            {
                return new AuthResponse
                {
                    Success = false,
                    Errors = new() { "Token Google invalide" }
                };
            }
            catch (Exception ex)
            {
                return new AuthResponse
                {
                    Success = false,
                    Errors = new() { $"Erreur authentification Google: {ex.Message}" }
                };
            }
        }
    }
}