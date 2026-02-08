namespace MaBibliotheque.Application.DTOs.Books
{
    public record OpenLibraryBookDto
    {
        public string Key { get; init; } = string.Empty; 

        public string? Description { get; init; }

        public string Title { get; init; } = string.Empty;
        public List<string> AuthorNames { get; init; } = new List<string>();
        public int? CoverId { get; init; } 
        public string? FirstPublishYear { get; init; }

        public string? CoverUrl => CoverId.HasValue
            ? $"https://covers.openlibrary.org/b/id/{CoverId.Value}-M.jpg"
            : null;
    }
}