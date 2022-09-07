namespace GrantTracker.Dal.SynergySchema
{
	public partial class RevOrganizationYear
	{
		public RevOrganizationYear()
		{
			StudentSchoolYears = new HashSet<EpcStuSchYr>();
			Students = new HashSet<EpcStu>();
		}

		public Guid OrganizationYearGu { get; set; }
		public Guid OrganizationGu { get; set; }
		public Guid YearGu { get; set; }
		public DateTime? ChangeDateTimeStamp { get; set; }
		public Guid? ChangeIdStamp { get; set; }
		public DateTime? AddDateTimeStamp { get; set; }
		public Guid? AddIdStamp { get; set; }

		public virtual RevOrganization Organization { get; set; }
		public virtual RevYear Year { get; set; }
		public virtual ICollection<EpcStuSchYr> StudentSchoolYears { get; set; }
		public virtual ICollection<EpcStu> Students { get; set; }
	}
}