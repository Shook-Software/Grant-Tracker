using GrantTracker.Dal.Models.Views;

namespace GrantTracker.Utilities.Transforms
{
	public static class DropdownOptionTransform
	{
		public static DropdownOption FromDatabase<T>(T dropdownModel) where T : class, IDropdown
		{
			return new DropdownOption()
			{
				Guid = dropdownModel.Guid,
				Abbreviation = dropdownModel.Abbreviation,
				Label = dropdownModel.Label,
				Description = dropdownModel.Description
			};
		}
	}
}