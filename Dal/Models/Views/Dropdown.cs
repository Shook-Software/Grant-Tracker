namespace GrantTracker.Dal.Models.Views
{
	public class DropdownOption : IDropdown
	{
		public Guid Guid { get; set; }
		public string Abbreviation { get; set; }
		public string Label { get; set; }
		public string Description { get; set; }
	}

	public interface IDropdown
	{
		public abstract Guid Guid { get; set; }
		public abstract string Abbreviation { get; set; }
		public abstract string Label { get; set; }
		public abstract string Description { get; set; }
	}

	public class SessionDropdownOptions
	{
		public List<DropdownOption> SessionTypes { get; set; }
		public List<DropdownOption> Activities { get; set; }
		public List<DropdownOption> Objectives { get; set; }
		public List<DropdownOption> InstructorStatuses { get; set; }
		public List<DropdownOption> FundingSources { get; set; }
		public List<DropdownOption> OrganizationTypes { get; set; }
		public List<DropdownOption> PartnershipTypes { get; set; }
	}

	public class DropdownOptions : SessionDropdownOptions
	{
		public List<DropdownOption> Grades { get; set; }
	}
}