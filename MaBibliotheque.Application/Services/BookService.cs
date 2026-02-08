using MaBibliotheque.Application.DTOs.Books;
using MaBibliotheque.Application.Services;
using MaBibliotheque.Domain.Entities;
using MaBibliotheque.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MaBibliotheque.Infrastructure.Services
{
    public class BookService : IBookService
    {
        private readonly ApplicationDbContext _context;

        public BookService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<BookResponse?> GetBookByIdAsync(int bookId, string userId)
        {
            var book = await _context.Books
                .Where(b => b.Id == bookId && b.UserId == userId)
                .FirstOrDefaultAsync();

            return book == null ? null : MapToBookResponse(book);
        }

        public async Task<BookResponse?> GetBookByOpenLibraryKeyAsync(string openLibraryKey, string userId)
        {
            var book = await _context.Books
                .Where(b => b.OpenLibraryKey == openLibraryKey && b.UserId == userId)
                .FirstOrDefaultAsync();

            return book == null ? null : MapToBookResponse(book);
        }

        public async Task<BookResponse> CreateBookAsync(CreateBookRequest request, string userId)
        {
            var book = new Book
            {
                OpenLibraryKey = request.OpenLibraryKey,
                Title = request.Title,
                Author = request.Author,
                Description = request.Description,
                PublishYear = request.PublishYear,
                CoverId = request.CoverId,
                ISBN = request.ISBN,
                PageCount = request.PageCount,
                Publisher = request.Publisher,
                Language = request.Language,
                Subjects = request.Subjects,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            return MapToBookResponse(book);
        }

        public async Task<BookResponse?> UpdateBookAsync(int bookId, UpdateBookRequest request, string userId)
        {
            var book = await _context.Books
                .Where(b => b.Id == bookId && b.UserId == userId)
                .FirstOrDefaultAsync();

            if (book == null) return null;

            if (!string.IsNullOrEmpty(request.Title)) book.Title = request.Title;
            if (!string.IsNullOrEmpty(request.Author)) book.Author = request.Author;
            if (request.Description != null) book.Description = request.Description;
            if (request.PublishYear.HasValue) book.PublishYear = request.PublishYear;
            if (request.CoverId != null) book.CoverId = request.CoverId;
            if (request.ISBN != null) book.ISBN = request.ISBN;
            if (request.PageCount.HasValue) book.PageCount = request.PageCount;
            if (request.Publisher != null) book.Publisher = request.Publisher;
            if (request.Language != null) book.Language = request.Language;
            if (request.Subjects != null) book.Subjects = request.Subjects;

            book.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return MapToBookResponse(book);
        }

        public async Task<bool> DeleteBookAsync(int bookId, string userId)
        {
            var book = await _context.Books
                .Where(b => b.Id == bookId && b.UserId == userId)
                .FirstOrDefaultAsync();

            if (book == null) return false;

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<UserBookResponse> AddToLibraryAsync(AddToLibraryRequest request, string userId)
        {
            // Vérifier si le livre existe déjà
            var existingBook = await _context.Books
                .FirstOrDefaultAsync(b => b.OpenLibraryKey == request.OpenLibraryKey && b.UserId == userId);

            Book book;
            if (existingBook == null)
            {
                // Créer le livre
                book = new Book
                {
                    OpenLibraryKey = request.OpenLibraryKey,
                    Title = request.Title,
                    Author = request.Author,
                    CoverId = request.CoverId,
                    PublishYear = request.PublishYear,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Books.Add(book);
                await _context.SaveChangesAsync();
            }
            else
            {
                book = existingBook;
            }

            // Vérifier si l'utilisateur a déjà ce livre dans sa bibliothèque
            var existingUserBook = await _context.UserBooks
                .FirstOrDefaultAsync(ub => ub.BookId == book.Id && ub.UserId == userId);

            if (existingUserBook != null)
            {
                // Mettre à jour le statut
                existingUserBook.Status = request.Status;
                existingUserBook.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return await GetUserBookResponseAsync(existingUserBook.Id);
            }

            // Ajouter à la bibliothèque
            var userBook = new UserBook
            {
                UserId = userId,
                BookId = book.Id,
                Status = request.Status,
                AddedAt = DateTime.UtcNow
            };

            _context.UserBooks.Add(userBook);
            await _context.SaveChangesAsync();

            return await GetUserBookResponseAsync(userBook.Id);
        }

        public async Task<UserBookResponse?> UpdateUserBookAsync(int userBookId, UpdateUserBookRequest request, string userId)
        {
            var userBook = await _context.UserBooks
                .Include(ub => ub.Book)
                .Where(ub => ub.Id == userBookId && ub.UserId == userId)
                .FirstOrDefaultAsync();

            if (userBook == null) return null;

            if (!string.IsNullOrEmpty(request.Status)) userBook.Status = request.Status;
            if (request.Rating.HasValue) userBook.Rating = request.Rating;
            if (request.Review != null) userBook.Review = request.Review;
            if (request.StartedAt.HasValue) userBook.StartedAt = request.StartedAt;
            if (request.FinishedAt.HasValue) userBook.FinishedAt = request.FinishedAt;

            userBook.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return MapToUserBookResponse(userBook);
        }

        public async Task<bool> RemoveFromLibraryAsync(int userBookId, string userId)
        {
            var userBook = await _context.UserBooks
                .Where(ub => ub.Id == userBookId && ub.UserId == userId)
                .FirstOrDefaultAsync();

            if (userBook == null) return false;

            _context.UserBooks.Remove(userBook);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<BookListResponse> GetUserLibraryAsync(string userId, string? status = null, int page = 1, int pageSize = 20)
        {
            var query = _context.UserBooks
                .Include(ub => ub.Book)
                .Where(ub => ub.UserId == userId);

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(ub => ub.Status == status);
            }

            var totalCount = await query.CountAsync();

            var userBooks = await query
                .OrderByDescending(ub => ub.AddedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new BookListResponse
            {
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                Books = userBooks.Select(MapToUserBookResponse).ToList()
            };
        }

        public async Task<List<UserBookResponse>> SearchBooksAsync(string query, string userId)
        {
            var searchTerm = query.ToLower();

            var userBooks = await _context.UserBooks
                .Include(ub => ub.Book)
                .Where(ub => ub.UserId == userId &&
                    (ub.Book.Title.ToLower().Contains(searchTerm) ||
                     ub.Book.Author.ToLower().Contains(searchTerm)))
                .OrderBy(ub => ub.Book.Title)
                .Take(50)
                .ToListAsync();

            return userBooks.Select(MapToUserBookResponse).ToList();
        }

        public async Task<UserStatsResponse> GetUserStatsAsync(string userId)
        {
            var userBooks = await _context.UserBooks
                .Where(ub => ub.UserId == userId)
                .Include(ub => ub.Book)
                .ToListAsync();

            var stats = new UserStatsResponse
            {
                TotalBooks = userBooks.Count,
                ToReadBooks = userBooks.Count(b => b.Status == "ToRead"),
                ReadingBooks = userBooks.Count(b => b.Status == "Reading"),
                FinishedBooks = userBooks.Count(b => b.Status == "Read"),
                FavoriteBooks = userBooks.Count(b => b.Status == "Favorite"),
                BooksRead = userBooks.Count(b => b.Status == "Read"),
                CurrentlyReading = userBooks.Count(b => b.Status == "Reading"),
                AverageRating = userBooks
                    .Where(b => b.Rating.HasValue)
                    .Select(b => (double)b.Rating.Value)
                    .DefaultIfEmpty(0)
                    .Average()
            };

            return stats;
        }

        // Méthodes auxiliaires
        private async Task<UserBookResponse> GetUserBookResponseAsync(int userBookId)
        {
            var userBook = await _context.UserBooks
                .Include(ub => ub.Book)
                .FirstAsync(ub => ub.Id == userBookId);

            return MapToUserBookResponse(userBook);
        }

        private BookResponse MapToBookResponse(Book book)
        {
            return new BookResponse
            {
                Id = book.Id,
                OpenLibraryKey = book.OpenLibraryKey,
                Title = book.Title,
                Author = book.Author,
                Description = book.Description,
                PublishYear = book.PublishYear,
                CoverUrl = !string.IsNullOrEmpty(book.CoverId)
                    ? $"https://covers.openlibrary.org/b/id/{book.CoverId}-M.jpg"
                    : null,
                ISBN = book.ISBN,
                PageCount = book.PageCount,
                Publisher = book.Publisher,
                Language = book.Language,
                Subjects = !string.IsNullOrEmpty(book.Subjects)
                    ? book.Subjects.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    : null,
                CreatedAt = book.CreatedAt
            };
        }

        private UserBookResponse MapToUserBookResponse(UserBook userBook)
        {
            return new UserBookResponse
            {
                Id = userBook.Id,
                Book = MapToBookResponse(userBook.Book),
                Status = userBook.Status,
                Rating = userBook.Rating,
                Review = userBook.Review,
                AddedAt = userBook.AddedAt,
                StartedAt = userBook.StartedAt,
                FinishedAt = userBook.FinishedAt
            };
        }
    }
}