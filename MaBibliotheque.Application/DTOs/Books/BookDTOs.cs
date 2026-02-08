using System;
using System.ComponentModel.DataAnnotations;
namespace MaBibliotheque.Application.DTOs.Books
{
    // ============= REQUESTS =============
    public class CreateBookRequest
    {
        [Required(ErrorMessage = "La clé OpenLibrary est requise")]
        public string OpenLibraryKey { get; set; } = string.Empty;
        [Required(ErrorMessage = "Le titre est requis")]
        [MaxLength(500)]
        public string Title { get; set; } = string.Empty;
        [Required(ErrorMessage = "L'auteur est requis")]
        [MaxLength(300)]
        public string Author { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? PublishYear { get; set; }
        public string? CoverId { get; set; }
        public string? ISBN { get; set; }
        public int? PageCount { get; set; }
        public string? Publisher { get; set; }
        public string? Language { get; set; }
        public string? Subjects { get; set; }
    }

    public class UpdateBookRequest
    {
        [MaxLength(500)]
        public string? Title { get; set; }
        [MaxLength(300)]
        public string? Author { get; set; }
        public string? Description { get; set; }
        public int? PublishYear { get; set; }
        public string? CoverId { get; set; }
        public string? ISBN { get; set; }
        public int? PageCount { get; set; }
        public string? Publisher { get; set; }
        public string? Language { get; set; }
        public string? Subjects { get; set; }
    }

    public class AddToLibraryRequest
    {
        [Required]
        public string OpenLibraryKey { get; set; } = string.Empty;
        [Required]
        public string Title { get; set; } = string.Empty;
        [Required]
        public string Author { get; set; } = string.Empty;
        public string? CoverId { get; set; }
        public int? PublishYear { get; set; }
        [Required]
        [RegularExpression("^(ToRead|Reading|Read|Favorite)$")]
        public string Status { get; set; } = "ToRead";
    }

    public class UpdateUserBookRequest
    {
        [RegularExpression("^(ToRead|Reading|Read|Favorite)$")]
        public string? Status { get; set; }
        [Range(1, 5, ErrorMessage = "La note doit être entre 1 et 5")]
        public int? Rating { get; set; }
        public string? Review { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? FinishedAt { get; set; }
    }

    // ============= RESPONSES =============
    public class BookResponse
    {
        public int Id { get; set; }
        public string OpenLibraryKey { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? PublishYear { get; set; }
        public string? CoverUrl { get; set; }
        public string? ISBN { get; set; }
        public int? PageCount { get; set; }
        public string? Publisher { get; set; }
        public string? Language { get; set; }
        public string[]? Subjects { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class UserBookResponse
    {
        public int Id { get; set; }
        public BookResponse Book { get; set; } = null!;
        public string Status { get; set; } = string.Empty;
        public int? Rating { get; set; }
        public string? Review { get; set; }
        public DateTime AddedAt { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? FinishedAt { get; set; }
    }

    public class BookListResponse
    {
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public List<UserBookResponse> Books { get; set; } = new();
    }

    // ============= STATS RESPONSE =============
    public class UserStatsResponse
    {
        public int TotalBooks { get; set; }
        public int ToReadBooks { get; set; }
        public int ReadingBooks { get; set; }
        public int FinishedBooks { get; set; }
        public int FavoriteBooks { get; set; }
        public int BooksRead { get; set; }
        public int CurrentlyReading { get; set; }
        public double AverageRating { get; set; }
    }
}