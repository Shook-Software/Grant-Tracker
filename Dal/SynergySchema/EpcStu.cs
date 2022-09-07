namespace GrantTracker.Dal.SynergySchema
{
	public partial class EpcStu
	{
		public EpcStu()
		{
			EpcStuSchYrs = new HashSet<EpcStuSchYr>();
		}

		public Guid StudentGu { get; set; }

		/// <summary>
		/// ID
		/// </summary>
		public string SisNumber { get; set; }

		/// <summary>
		/// SI: SAIS
		/// </summary>
		public string StateStudentNumber { get; set; }

		/// <summary>
		/// HL
		/// </summary>
		public string HomeLanguage { get; set; }

		/// <summary>
		/// MG
		/// </summary>
		public string Migrant { get; set; }

		public DateTime? ImmigrationDate { get; set; }
		public DateTime? OriginalEnterDate { get; set; }

		/// <summary>
		/// Date left disctict; upon reactivation clear this date; The leave date or summer withdrawl date
		/// </summary>
		public DateTime? FinalWithdrawalDate { get; set; }

		/// <summary>
		/// Used during address validation - GC
		/// </summary>
		public string GridCode { get; set; }

		/// <summary>
		/// CD
		/// </summary>
		public string CustodyCode { get; set; }

		/// <summary>
		/// SG
		/// </summary>
		public DateTime? SpecialEdScreeningDate { get; set; }

		/// <summary>
		/// BS
		/// </summary>
		public string BirthState { get; set; }

		/// <summary>
		/// BC
		/// </summary>
		public string BirthCountry { get; set; }

		/// <summary>
		/// BV
		/// </summary>
		public string BirthVerification { get; set; }

		public string BirthCertificateNum { get; set; }

		/// <summary>
		/// IN
		/// </summary>
		public string InternetAuthorization { get; set; }

		/// <summary>
		/// Yes - prevents mailing of grade/progress reports: DB
		/// </summary>
		public string ExcessiveDebtIndicator { get; set; }

		/// <summary>
		/// Exclude student info for outside directory list (such as military): DT
		/// </summary>
		public string DirectoryListExclude { get; set; }

		/// <summary>
		/// Type of family (one parent, two parent, etc.): EM
		/// </summary>
		public string FamilyCode { get; set; }

		/// <summary>
		/// CI
		/// </summary>
		public string CriticalIllness { get; set; }

		/// <summary>
		/// temp code - BL
		/// </summary>
		public string BilingualCode { get; set; }

		/// <summary>
		/// temp date - BL
		/// </summary>
		public DateTime? BilingualDate { get; set; }

		/// <summary>
		/// GE
		/// </summary>
		public string GeneralEquivalencyDiploma { get; set; }

		/// <summary>
		/// GY - 5 years + 9th grade; calendar year in which you graduate
		/// </summary>
		public decimal? ExpectedGraduationYear { get; set; }

		public decimal? ExpectedGraduationMonth { get; set; }
		public Guid? GradReqDefGu { get; set; }

		/// <summary>
		/// XT: Expelled students trying to re-enroll at another school; SASI3 blinks the name
		/// </summary>
		public string EnrollmentRestrictionCode { get; set; }

		/// <summary>
		/// XD: The date teh restriction code was implemented
		/// </summary>
		public DateTime? EnrollmentRestrictionDate { get; set; }

		public Guid? EnrRestrictOrganizationGu { get; set; }
		public string Notes { get; set; }
		public string PsychologicalScreening { get; set; }
		public string DwellingType { get; set; }
		public decimal? ClassOf { get; set; }

		/// <summary>
		/// Used by New Year Rollover from other SIS, does Synergy own this student
		/// </summary>
		public string OwnedByGenesis { get; set; }

		/// <summary>
		/// Renamed from ASTU.FAMILY_LINK
		/// </summary>
		public string HomeLess { get; set; }

		/// <summary>
		/// ASTU.GRAD_DT is not used in Elementary
		/// </summary>
		public DateTime? GraduationDate { get; set; }

		/// <summary>
		/// ASTU.GETS_AID - Called Medical in California
		/// </summary>
		public string Medicaid { get; set; }

		/// <summary>
		/// ASTU.ORIG_ENTER_DT, Lookup ENTER_CODE
		/// </summary>
		public string OriginalEnterCode { get; set; }

		public DateTime? OriginalStateEnterDate { get; set; }
		public string OriginalEnterGrade { get; set; }

		/// <summary>
		/// First date student entered the US
		/// </summary>
		public DateTime? UsEntryDate { get; set; }

		/// <summary>
		/// First date student entered a school in the US
		/// </summary>
		public DateTime? UsEntryDateSchool { get; set; }

		/// <summary>
		/// Country student came from when entering the US for the first time
		/// </summary>
		public string UsEntryFromCountry { get; set; }

		public DateTime? AddressChgDate { get; set; }

		/// <summary>
		/// Mail address is same as home address
		/// </summary>
		public string MailSameAsHomeAddress { get; set; }

		/// <summary>
		/// Mandatory to add telephone with option for no phone
		/// </summary>
		public string NoPhoneNeeded { get; set; }

		public DateTime? HomeLanguageDate { get; set; }
		public DateTime? PrimaryLanguageDate { get; set; }

		/// <summary>
		/// Previous School Entity ID
		/// </summary>
		public string PrevSchoolId { get; set; }

		/// <summary>
		/// Previous State Code
		/// </summary>
		public string PrevStateCode { get; set; }

		/// <summary>
		/// Previous school State ID
		/// </summary>
		public string PrevSchoolStateId { get; set; }

		public string TranscriptComment { get; set; }
		public DateTime? SigStuDataChange { get; set; }

		/// <summary>
		/// Flag indicating if a request was sent to the state requesting the state number
		/// </summary>
		public string StateStuNumSubmitted { get; set; }

		/// <summary>
		/// User-defined code value
		/// </summary>
		public string UserCode1 { get; set; }

		/// <summary>
		/// User-defined code value
		/// </summary>
		public string UserCode2 { get; set; }

		/// <summary>
		/// User-defined code value
		/// </summary>
		public string UserCode3 { get; set; }

		/// <summary>
		/// User-defined code value
		/// </summary>
		public string UserCode4 { get; set; }

		/// <summary>
		/// User-defined code value
		/// </summary>
		public string UserCode5 { get; set; }

		/// <summary>
		/// User-defined code value
		/// </summary>
		public string UserCode6 { get; set; }

		/// <summary>
		/// User-defined code value
		/// </summary>
		public string UserCode7 { get; set; }

		/// <summary>
		/// User-defined code value
		/// </summary>
		public string UserCode8 { get; set; }

		/// <summary>
		/// Foreign born schooling in the United States less than or equal to 3 academic years
		/// </summary>
		public string SchoolingInUs { get; set; }

		/// <summary>
		/// If the child was born in a foreign country and granted U.S. citizenship
		/// </summary>
		public string BirthSpecialCircumstances { get; set; }

		/// <summary>
		/// K12.
		/// </summary>
		public string GraduationStatus { get; set; }

		public string PostSecondary { get; set; }
		public string AltId1 { get; set; }
		public string AltId2 { get; set; }
		public string Refugee { get; set; }
		public string FosterHome { get; set; }
		public string MigrantStudentId { get; set; }
		public string BirthVerificationOther { get; set; }
		public string DwellingTypeOther { get; set; }
		public Guid? ChangeIdStamp { get; set; }
		public DateTime? ChangeDateTimeStamp { get; set; }
		public DateTime? AddDateTimeStamp { get; set; }
		public Guid? AddIdStamp { get; set; }
		public string ProfAthlete { get; set; }
		public string PartnershipAcademyId { get; set; }
		public string CtePathway { get; set; }
		public string CtePathwayCompleter { get; set; }
		public string TeenParent { get; set; }
		public string DisplacedHomemaker { get; set; }
		public string IndicatorEll { get; set; }
		public string IndicatorSpeced { get; set; }
		public string Indicator1 { get; set; }
		public string Indicator2 { get; set; }
		public string Indicator3 { get; set; }
		public string Indicator4 { get; set; }
		public string Indicator5 { get; set; }
		public string Indicator6 { get; set; }
		public string Indicator7 { get; set; }
		public string Indicator8 { get; set; }

		/// <summary>
		/// A customized drop down list of opt out reasons
		/// </summary>
		public string OptOutMilitary { get; set; }

		/// <summary>
		/// A customized drop down list of opt out reasons
		/// </summary>
		public string OptOutFamilyLifeEd { get; set; }

		/// <summary>
		/// A customized drop down list of opt out reasons
		/// </summary>
		public string OptOutGuidance { get; set; }

		/// <summary>
		/// A customized drop down list of opt out reasons
		/// </summary>
		public string OptOutPhotoRelease { get; set; }

		public string OptOutMedicalState { get; set; }
		public string OptOutMedicalFed { get; set; }

		/// <summary>
		/// A customized drop down list of opt out reasons
		/// </summary>
		public string OptOutDirectory { get; set; }

		/// <summary>
		/// If school types are included/excluded in the enrollment restrictions.
		/// </summary>
		public string EnrRestrInclExcl { get; set; }

		public decimal? AnonymousStuId { get; set; }
		public decimal? InitNinthGradeYear { get; set; }
		public Guid? PrimaryCommFamilyGu { get; set; }
		public Guid? EnrollResidentFamilyGu { get; set; }
		public string EnrollLessThreeOvr { get; set; }
		public string VcReq { get; set; }
		public string Disadvantaged { get; set; }
		public string EarlyCollegeScholar { get; set; }
		public string DiplomaType { get; set; }
		public string GraduationPlan { get; set; }
		public string ExcludeFromAutoFteCalc { get; set; }
		public decimal? SpedWeeklyTimePerct { get; set; }
		public string Wheelchair { get; set; }
		public string UcGradReq { get; set; }
		public decimal? PublicSchStYr { get; set; }
		public string ChildHoldEnrollment { get; set; }
		public Guid? ChildInitialSchool { get; set; }
		public string ChildInitalGrade { get; set; }
		public string DiplomaSeal { get; set; }
		public string OldStateStudentNumber { get; set; }
		public DateTime? GpEligWaivDtHs { get; set; }
		public DateTime? GpEligWaivDtMs { get; set; }
		public DateTime? InitNinthGradeYearDt { get; set; }
		public string PerspectiveCollege { get; set; }
		public string HasInternetAtHome { get; set; }
		public string DiplomaAttemptType1 { get; set; }
		public string DiplomaAttemptType2 { get; set; }
		public string DiplomaAttemptType3 { get; set; }
		public string DistrictOfResidenceAddr { get; set; }
		public string HomeCounty { get; set; }
		public decimal? CallOrder { get; set; }
		public string GraduationSemester { get; set; }
		public string CredentialTypeCode { get; set; }
		public int? MonthsUsAttendance { get; set; }
		public int? MonthsNonUsAttendance { get; set; }
		public string RelationSelectRace { get; set; }
		public DateTime? RaceSelectionDate { get; set; }
		public string CsapAlternateAssess { get; set; }
		public DateTime? ValDelDateTimeStamp { get; set; }
		public Guid? ValDelIdStamp { get; set; }
		public string CertGenStudies { get; set; }
		public string CreditAccommodation { get; set; }
		public string SummerGrad { get; set; }
		public string FosterId { get; set; }
		public string BirthCounty { get; set; }
		public string SrUserText1 { get; set; }
		public string AllowMedicalTreatment { get; set; }
		public string ReqStateStudentNumber { get; set; }
		public string ReqStateStuNum { get; set; }
		public string MilitaryFamilyCode { get; set; }
		public decimal? CdwPrescribedLoadOffset { get; set; }
		public string MsixNumber { get; set; }
		public string TechPrepStatus { get; set; }
		public string InterpreterNeeded { get; set; }
		public string OverrideContAndFunding { get; set; }
		public string ParentalStatusCode { get; set; }
		public DateTime? Title3EntryDate { get; set; }
		public string PushNoteAtt { get; set; }
		public string PushNoteAssign { get; set; }
		public string PushNoteGrade { get; set; }
		public string PushNoteHealth { get; set; }
		public string PushNoteDiscp { get; set; }
		public decimal? PushAssignCutoff { get; set; }
		public decimal? PushGradeCutoff { get; set; }
		public string Immigrant { get; set; }
		public string MiddleNameVerification { get; set; }
		public DateTime? SrDatetimeval01 { get; set; }
		public decimal? LocAwardCrd { get; set; }
		public decimal? SpecPermLocAwardCrd { get; set; }
		public string CrdAccommodationCode { get; set; }
		public decimal? SrUserNum01 { get; set; }
		public string PostSecSurvey { get; set; }
		public string CertificationOfCompletion { get; set; }
		public string DiplomaDesignation { get; set; }
		public string OnlineCrsExempt { get; set; }
		public string MilitaryEnlisted { get; set; }
		public string DeviceAccess { get; set; }
		public string IntAccType { get; set; }
		public string IntPerf { get; set; }
		public string DigitalDevice { get; set; }
		public string DigDeviceAcc { get; set; }
		public string YearsInUsSch { get; set; }
		public string DigDeviceProv { get; set; }
		public string Retired { get; set; }
		public string Indicator504 { get; set; }
		public string DiplomaOption { get; set; }
		public string IntAccBarrier { get; set; }
		public string SrUserDd01 { get; set; }
		public string IbDiploma { get; set; }
		public string AiceDiploma { get; set; }
		public string EarlyGrad { get; set; }
		public string AssociateDegree { get; set; }
		public string ApCapstoneDiploma { get; set; }
		public string EarnedBiliteracySeal { get; set; }
		public string SrUserCheck01 { get; set; }
		public DateTime? SurveyDate { get; set; }
		public string GradReqBasis { get; set; }
		public DateTime? CommDatePassedForGrad { get; set; }
		public DateTime? MathDatePassedForGrad { get; set; }
		public DateTime? CertOfCmpltDate { get; set; }
		public string CollegeReadyDiploma { get; set; }
		public string AdvIntlCertPrgm { get; set; }
		public string NatlMeritScholar { get; set; }
		public string NatlAchieveScholar { get; set; }
		public string NatlHispScholar { get; set; }
		public string AdultEdDiplomaType { get; set; }
		public DateTime? AdultEdDiplomaDate { get; set; }
		public string AdultEdCertOfComp { get; set; }

		public virtual RevOrganizationYear ChildInitialSchoolNavigation { get; set; }
		public virtual RevOrganization EnrRestrictOrganizationGuNavigation { get; set; }
		public virtual RevPerson Person { get; set; }
		public virtual ICollection<EpcStuSchYr> EpcStuSchYrs { get; set; }
	}
}