namespace GrantTracker.Dal.SynergySchema
{
	public partial class RevYear
	{
		public RevYear()
		{
			StudentSchoolYears = new HashSet<EpcStuSchYr>();
			OrganizationYears = new HashSet<RevOrganizationYear>();
		}

		public Guid YearGu { get; set; }
		public decimal SchoolYear { get; set; }
		public string Extension { get; set; }
		public DateTime? ChangeDateTimeStamp { get; set; }
		public Guid? ChangeIdStamp { get; set; }
		public DateTime? AddDateTimeStamp { get; set; }
		public Guid? AddIdStamp { get; set; }

		public virtual ICollection<EpcStuSchYr> StudentSchoolYears { get; set; }
		public virtual ICollection<RevOrganizationYear> OrganizationYears { get; set; }
	}
}