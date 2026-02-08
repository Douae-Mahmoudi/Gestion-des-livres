using MaBibliotheque.Infrastructure.Entities;
using System;

namespace MaBibliotheque.Domain.Entities
{
    
    public class UserBook
    {
        public int Id { get; set; }

        public string UserId { get; set; } = string.Empty;
        public ApplicationUser User { get; set; } = null!;

        public int BookId { get; set; }
        public Book Book { get; set; } = null!;

        
        public string Status { get; set; } = "ToRead";

       
        public int? Rating { get; set; }

        public string? Review { get; set; }

        public DateTime AddedAt { get; set; } = DateTime.UtcNow;

        public DateTime? StartedAt { get; set; }

        public DateTime? FinishedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}