using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public class FamilyMember : Person
	{
		public virtual ICollection<FamilyAttendance> AttendanceRecords { get; set; }
		public virtual ICollection<Relationship> Relationships { get; set; }

		public new static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<FamilyMember>();

			/// /Relations

			entity.HasMany(e => e.AttendanceRecords)
				 .WithOne(e => e.FamilyMember)
				 .HasForeignKey(e => e.FamilyMemberGuid);

			entity.HasMany(e => e.Relationships)
				.WithOne(e => e.FamilyMember)
				.HasForeignKey(e => e.FamilyMemberGuid);

			/// /Properties
		}
	}
}