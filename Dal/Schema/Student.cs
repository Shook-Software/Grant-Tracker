using Microsoft.EntityFrameworkCore;

//Tracking

/// /District
//# of students
//# of students that attended 30+ days in a year
//# of adult family members that have participated in a year

/// /State
//Same as above 3
//# of days of student programming ytd
//Student service hours per week
//Student service days per week
//Activity type - Done
//ClassName/Activity - Done
//Measureable Objective class targets - Done
//Funding source for class - Done
//Instructor name and status - Done
//Date class was offered and total # of weeks to date
//# of hours each session is offered per day
//Days of the week class is offered
//Average daily class attendance

/// /Federal
//# of participants attended for each activity category during the term
//# of total hours each activity category was offered during the term
//# of paid and volunteer instructors per instructor status
//Partnership Type per class - Done
//Number of adult family members ytd
//# of students attended ytd
//# of students who attended 30+ days ytd
//GPA for attendees in grades 7-8 and 10-12 || June Only
//In school suspensions for attendees in grades 1-12 || June Only
//Teacher survey for attendees in grades 1-5 || June Only

namespace GrantTracker.Dal.Schema
{
	public class Student : Person
	{
		public string MatricNumber { get; set; }
		public virtual ICollection<Relationship> Relationships { get; set; }
		public virtual ICollection<StudentSchoolYear> StudentSchoolYears { get; set; }

		public new static void Setup(ModelBuilder builder)
		{
			var entity = builder.Entity<Student>();

			/// /Relations

			entity.HasMany(e => e.StudentSchoolYears)
				.WithOne(e => e.Student)
				.HasForeignKey(e => e.StudentGuid);

			entity.HasMany(e => e.Relationships)
				.WithOne(e => e.Student)
				.HasForeignKey(e => e.StudentGuid)
				.OnDelete(DeleteBehavior.Cascade);

			/// /Properties

			entity.Property(e => e.MatricNumber)
				.HasColumnType("varchar")
				.HasMaxLength(10)
				.IsRequired();
		}
	}
}