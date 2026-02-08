using MaBibliotheque.Infrastructure.Entities;
using System;
using System.Collections.Generic;

namespace MaBibliotheque.Domain.Entities
{
    public class Book
    {
        public int Id { get; set; }

        
        public string OpenLibraryKey { get; set; } = string.Empty;

        public string Title { get; set; } = string.Empty;

        public string Author { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int? PublishYear { get; set; }

       
        public string? CoverId { get; set; }

        public string? ISBN { get; set; }

        public int? PageCount { get; set; }

        public string? Publisher { get; set; }

        public string? Language { get; set; }

        public string? Subjects { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Relations
        public string UserId { get; set; } = string.Empty;
        public ApplicationUser User { get; set; } = null!;

        public ICollection<UserBook> UserBooks { get; set; } = new List<UserBook>();
    }
}