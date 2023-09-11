using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.EmployeeDb
{
	public partial class InterfaceDbContext : DbContext
	{
		public InterfaceDbContext()
		{
		}

		public InterfaceDbContext(DbContextOptions<InterfaceDbContext> options)
				: base(options)
		{
		}

		public DbSet<Employee> Employees { get; set; }

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			modelBuilder.Entity<Employee>(entity =>
			{

				entity.HasNoKey();

				entity.Property(e => e.Department)
									.HasMaxLength(60)
									.IsUnicode(false)
									.HasColumnName("department")
									.IsFixedLength();

				entity.Property(e => e.Domain)
									.HasMaxLength(10)
									.IsUnicode(false)
									.HasColumnName("domain")
									.IsFixedLength();

				entity.Property(e => e.EmailAddress)
									.HasMaxLength(50)
									.IsUnicode(false)
									.HasColumnName("emailAddress")
									.IsFixedLength();

				entity.Property(e => e.EmployeeId)
									.IsRequired()
									.HasMaxLength(10)
									.IsUnicode(false)
									.HasColumnName("employeeID")
									.IsFixedLength();

				entity.Property(e => e.GivenName)
									.HasMaxLength(30)
									.IsUnicode(false)
									.HasColumnName("givenName")
									.IsFixedLength();

				entity.Property(e => e.LocationCode)
									.HasMaxLength(10)
									.IsUnicode(false)
									.HasColumnName("locationCode")
									.IsFixedLength();

				entity.Property(e => e.MiddleName)
									.HasMaxLength(20)
									.IsUnicode(false)
									.HasColumnName("middleName")
									.IsFixedLength();

				entity.Property(e => e.SamAccountName)
									.HasMaxLength(20)
									.IsUnicode(false)
									.HasColumnName("samAccountName")
									.IsFixedLength();

				entity.Property(e => e.Sn)
									.HasMaxLength(30)
									.IsUnicode(false)
									.HasColumnName("sn")
									.IsFixedLength();

				entity.Property(e => e.Title)
									.HasMaxLength(40)
									.IsUnicode(false)
									.HasColumnName("title")
									.IsFixedLength();
			});
		}
	}
}