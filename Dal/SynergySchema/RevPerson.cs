namespace GrantTracker.Dal.SynergySchema
{
	public partial class RevPerson
	{
		public Guid PersonGu { get; set; }

		/// <summary>
		/// LN
		/// </summary>
		public string LastName { get; set; }

		/// <summary>
		/// FN
		/// </summary>
		public string FirstName { get; set; }

		/// <summary>
		/// MN
		/// </summary>
		public string MiddleName { get; set; }

		public string Title { get; set; }

		/// <summary>
		/// Append to LN
		/// </summary>
		public string Suffix { get; set; }

		/// <summary>
		/// SX
		/// </summary>
		public string Gender { get; set; }

		public string SocialSecurityNumber { get; set; }
		public string Email { get; set; }

		/// <summary>
		/// BD
		/// </summary>
		public DateTime? BirthDate { get; set; }

		/// <summary>
		/// BP
		/// </summary>
		public string BirthPlace { get; set; }

		/// <summary>
		/// EC
		/// </summary>
		public string EthnicCode { get; set; }

		public string PrimaryLanguage { get; set; }
		public string UsCitizen { get; set; }

		/// <summary>
		/// BC
		/// </summary>
		public string CountryOfCitizenship { get; set; }

		public string NonCitizenType { get; set; }
		public string JobTitle { get; set; }
		public Guid? HomeAddressGu { get; set; }
		public Guid? MailAddressGu { get; set; }
		public Guid? WorkAddressGu { get; set; }

		/// <summary>
		/// Read only BO Property - updated from rev person phone - redundant data to provide quick access to the persons main phone number info used in most reports
		/// </summary>
		public string PrimaryPhone { get; set; }

		/// <summary>
		/// Read only BO Property - updated from rev person phone - redundant data to provide quick access to the persons main phone number info used in most reports
		/// </summary>
		public string PrimaryPhoneExtn { get; set; }

		/// <summary>
		/// Read only BO Property - updated from rev person phone - redundant data to provide quick access to the persons main phone number info used in most reports
		/// </summary>
		public string PrimaryPhoneType { get; set; }

		/// <summary>
		/// Read only BO Property - updated from rev person phone - redundant data to provide quick access to the persons main phone number info used in most reports
		/// </summary>
		public string PrimaryPhoneListed { get; set; }

		/// <summary>
		/// Read only BO Property - updated from rev person phone - redundant data to provide quick access to the persons main phone number info used in most reports
		/// </summary>
		public string PrimaryPhoneContact { get; set; }

		/// <summary>
		/// Indicates if a person is living or dead
		/// </summary>
		public string Deceased { get; set; }

		public string ScrollCompositeKey { get; set; }
		public string ScrollCompositeKeyUpdate { get; set; }
		public string ScrollSoundex { get; set; }

		/// <summary>
		/// LN
		/// </summary>
		public string AkaLastName { get; set; }

		/// <summary>
		/// FN
		/// </summary>
		public string AkaFirstName { get; set; }

		/// <summary>
		/// MN
		/// </summary>
		public string AkaMiddleName { get; set; }

		/// <summary>
		/// Append to LN
		/// </summary>
		public string AkaSuffix { get; set; }

		public string PrimaryLanguageOther { get; set; }
		public Guid? ChangeIdStamp { get; set; }
		public DateTime? ChangeDateTimeStamp { get; set; }
		public string HispanicIndicator { get; set; }

		/// <summary>
		/// The person&apos;s federal ethnic code
		/// </summary>
		public string ResolvedEthnicityRace { get; set; }

		public string StateEthnicity { get; set; }
		public string NickName { get; set; }
		public string LastNameGoesBy { get; set; }
		public string PreviousSocialSecurityNum { get; set; }
		public string PrimaryRaceIndicator { get; set; }
		public string EdfiId { get; set; }
		public string PrimaryPhoneAcceptText { get; set; }
		public DateTime? DeceasedDate { get; set; }
		public string SuffixDd { get; set; }
		public string LegalFn { get; set; }
		public string LegalMn { get; set; }
		public string LegalLn { get; set; }
		public string LegalSx { get; set; }
		public string GenderNonBinary { get; set; }
		public string PrimaryPhoneCommLevel { get; set; }
		public string PrimaryTextCommLevel { get; set; }
		public DateTime? EmailReqValidDate { get; set; }
		public DateTime? EmailValidDate { get; set; }

		public virtual EpcStu Student { get; set; }
	}
}