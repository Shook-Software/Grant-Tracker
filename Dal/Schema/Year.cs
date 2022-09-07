using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.Schema
{
	public enum Quarter
	{
		SummerOne = 0,
		SummerTwo = 1,
		Fall = 2,
		Spring = 3
	}

	public class Year
	{
		public Guid YearGuid { get; set; }
		public short SchoolYear { get; set; }
		public Quarter Quarter { get; set; }
		public DateOnly StartDate { get; set; }
		public DateOnly EndDate { get; set; }
		public bool IsCurrentSchoolYear { get; set; }

		public virtual ICollection<OrganizationYear> Organizations { get; set; }

		public static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<Year>(); 
			
			entity.ToTable("Year", "GTkr")
				.HasComment("A school year split into quarters.")
				.HasKey(e => e.YearGuid);

			entity.HasIndex(e => new { e.SchoolYear, e.Quarter })
				.IsUnique();

			//Only one may be true at any given time
			entity.HasIndex(e => new { e.YearGuid, e.IsCurrentSchoolYear })
				.IsUnique()
				.HasFilter("[IsCurrentSchoolYear] = 1");

			entity.HasCheckConstraint("CK_StartDate_Before_EndDate", "[StartDate] < [EndDate]");
		}
	}
}
