using MaBibliotheque.Domain.Entities;
using MaBibliotheque.Infrastructure.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace MaBibliotheque.Infrastructure.Persistence
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Book> Books { get; set; } = null!;
        public DbSet<UserBook> UserBooks { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configuration de la table Users
            builder.Entity<ApplicationUser>().ToTable("Users");


            // Configuration de Book
            builder.Entity<Book>(entity =>
            {
                entity.HasKey(b => b.Id);

                entity.Property(b => b.Title)
                    .IsRequired()
                    .HasMaxLength(500);

                entity.Property(b => b.Author)
                    .IsRequired()
                    .HasMaxLength(300);

                entity.Property(b => b.OpenLibraryKey)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.HasIndex(b => b.OpenLibraryKey);

                entity.HasOne(b => b.User)
                    .WithMany()
                    .HasForeignKey(b => b.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configuration de UserBook
            builder.Entity<UserBook>(entity =>
            {
                entity.HasKey(ub => ub.Id);

                entity.Property(ub => ub.Status)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(ub => ub.Rating)
                    .HasColumnType("int");

                entity.HasOne(ub => ub.User)
                    .WithMany()
                    .HasForeignKey(ub => ub.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ub => ub.Book)
                    .WithMany(b => b.UserBooks)
                    .HasForeignKey(ub => ub.BookId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Index pour améliorer les performances
                entity.HasIndex(ub => new { ub.UserId, ub.BookId }).IsUnique();
                entity.HasIndex(ub => ub.Status);

            });
        }
    }
}