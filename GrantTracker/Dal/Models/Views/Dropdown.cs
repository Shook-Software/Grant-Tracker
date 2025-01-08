using GrantTracker.Dal.Schema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace GrantTracker.Dal.Models.Views;

//not convinced I made the best choices here database design wise but this is a way to identify the type of dropdown option without making a dedicated controller for every dropdown option type
//for updating/adding values from front end admin

public class DropdownOption : IDropdownOption
{
	public Guid? Guid { get; set; }
	public string? Abbreviation { get; set; }
	public string Label { get; set; }
	public string? Description { get; set; }
	public DateTime? DeactivatedAt { get; set; } = null;
	public short DisplayOrder { get; set; }

	[NotMapped]
	[JsonIgnore]
	public bool IsActive => DeactivatedAt is null || DeactivatedAt > DateTime.Now;

	internal static void Setup<T>(EntityTypeBuilder<T> entity) where T : DropdownOption
    {
        entity.Property(e => e.DisplayOrder)
			.IsRequired()
			.HasColumnType("smallint");
	}

	public static DropdownOption FromDatabase<T>(T option) where T : class, IDropdownOption => new()
	{
		Guid = option.Guid,
		Abbreviation = option.Abbreviation,
		Label = option.Label,
		Description = option.Description,
		DeactivatedAt = option.DeactivatedAt,
        DisplayOrder = option.DisplayOrder
    };

	public TType Convert<TType>() where TType : DropdownOption, new()
	{
		return new TType
		{
			Guid = this.Guid,
			Abbreviation = this.Abbreviation,
			Label = this.Label,
			Description = this.Description,
			DeactivatedAt = this.DeactivatedAt,
			DisplayOrder = this.DisplayOrder
		};
	}
}

public interface IDropdownOption
{
	public abstract Guid? Guid { get; set; }
	public abstract string Abbreviation { get; set; }
	public abstract string Label { get; set; }
	public abstract string Description { get; set; }
    public abstract DateTime? DeactivatedAt { get; set; }
	public abstract short DisplayOrder { get; set; }
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