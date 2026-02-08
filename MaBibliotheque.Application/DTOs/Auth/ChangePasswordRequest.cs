using System.ComponentModel.DataAnnotations;

namespace MaBibliotheque.Application.DTOs.Auth
{
    public class ChangePasswordRequest
    {
        /*[Required(...)] : oblige la présence d'une valeur. Si la valeur est absente ou vide, 
         la validation échoue et ModelState.IsValid sera false. Le message d'erreur retourné sera celui donné dans ErrorMessage.*/
        [Required(ErrorMessage = "L'ancien mot de passe est requis")]
        public string OldPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Le nouveau mot de passe est requis")]
        [MinLength(6, ErrorMessage = "Le mot de passe doit contenir au moins 6 caractères")]
        public string NewPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "La confirmation du mot de passe est requise")]
        [Compare("NewPassword", ErrorMessage = "Les mots de passe ne correspondent pas")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}