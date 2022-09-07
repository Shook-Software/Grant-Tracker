namespace GrantTracker.Dal.SynergySchema
{
	public partial class RevOrganization
	{
		public RevOrganization()
		{
			Students = new HashSet<EpcStu>();
			OrganizationYears = new HashSet<RevOrganizationYear>();
		}

		public Guid OrganizationGu { get; set; }
		public Guid? ParentGu { get; set; }
		public string IsLeaf { get; set; }
		public string Type { get; set; }
		public string OrganizationName { get; set; }
		public Guid? AddressGu { get; set; }
		public string Phone { get; set; }
		public string Phone2 { get; set; }
		public Guid? ChangeIdStamp { get; set; }
		public DateTime? ChangeDateTimeStamp { get; set; }

		/// <summary>
		/// Abbreviated Organization Name
		/// </summary>
		public string OrganizationAbbrName { get; set; }

		/// <summary>
		/// Used to determine which Organization nodes appear in the drop-down list of Virtual Root Nodes
		/// </summary>
		public string AllowAsVirtualRootNode { get; set; }

		/// <summary>
		/// an Organization&apos;s website
		/// </summary>
		public string WebsiteUrl { get; set; }

		public string HideOrganization { get; set; }
		public string CentralPrintId { get; set; }
		public string DefaultEmail { get; set; }
		public Guid? EdfiKeyGu { get; set; }
		public string EdfiDistrictId { get; set; }
		public DateTime? AddDateTimeStamp { get; set; }
		public string IncludeOnerosterApi { get; set; }
		public Guid? EdfiAltKeyGu { get; set; }

		public virtual ICollection<EpcStu> Students { get; set; }
		public virtual ICollection<RevOrganizationYear> OrganizationYears { get; set; }
	}
}