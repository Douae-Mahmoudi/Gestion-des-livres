using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MaBibliotheque.Application.DTOs.Auth
{
    public class ValidateResetTokenResponse
    {
        public bool IsValid { get; set; }
        public string Message { get; set; }

        public ValidateResetTokenResponse(bool isValid, string message)
        {
            IsValid = isValid;
            Message = message;
        }
    }
}
