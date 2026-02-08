using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MaBibliotheque.Application.DTOs.Auth
{
    public class ResetPasswordResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public List<string> Errors { get; set; }

        public ResetPasswordResponse()
        {
            Errors = new List<string>();
        }

        public ResetPasswordResponse(bool success, string message) : this()
        {
            Success = success;
            Message = message;
        }

        public ResetPasswordResponse(bool success, string message, List<string> errors)
        {
            Success = success;
            Message = message;
            Errors = errors ?? new List<string>();
        }
    }
}
