namespace GrantTracker.Dal.SynergySchema
{
	public partial class EpcStuSchYr
	{
		public Guid StudentSchoolYearGu { get; set; }
		public Guid StudentGu { get; set; }
		public Guid OrganizationYearGu { get; set; }

		/// <summary>
		/// Need to be able to read all stu school year rows for a given student by year - to do validation
		/// </summary>
		public Guid YearGu { get; set; }

		public DateTime? ReportedToStateNoshow { get; set; }
		public DateTime? ReportedToStateLeave { get; set; }

		/// <summary>
		/// SN
		/// </summary>
		public string OldSisStudentNum { get; set; }

		/// <summary>
		/// Uses bubble up theory
		/// </summary>
		public string Grade { get; set; }

		public string GradeExitCode { get; set; }
		public string UserCode1 { get; set; }
		public string UserCode2 { get; set; }
		public string UserCode3 { get; set; }
		public string UserCode4 { get; set; }
		public string UserCode5 { get; set; }
		public string UserCode6 { get; set; }
		public string UserCode7 { get; set; }
		public string UserCode8 { get; set; }
		public string UserCode9 { get; set; }

		/// <summary>
		/// Uses bubble up theory
		/// </summary>
		public DateTime? EnterDate { get; set; }

		/// <summary>
		/// Uses bubble up theory
		/// </summary>
		public string EnterCode { get; set; }

		/// <summary>
		/// Last day of enrollment - Uses bubble up theory
		/// </summary>
		public DateTime? LeaveDate { get; set; }

		/// <summary>
		/// Uses bubble up theory
		/// </summary>
		public string LeaveCode { get; set; }

		public Guid? HomeroomSectionGu { get; set; }
		public Guid? LastHomeroomSectionGu { get; set; }

		/// <summary>
		/// Uses bubble up theory
		/// </summary>
		public string InstructionalSetting { get; set; }

		/// <summary>
		/// CU
		/// </summary>
		public Guid? CounselorSchoolYearGu { get; set; }

		/// <summary>
		/// LK
		/// </summary>
		public string LockerNumber { get; set; }

		/// <summary>
		/// bubble up theory
		/// </summary>
		public Guid? TrackGu { get; set; }

		/// <summary>
		/// bubble up theory
		/// </summary>
		public string ProgramCode { get; set; }

		/// <summary>
		/// Will eventually reside in Needs - for now here so we can populate back to SASI3: EL
		/// </summary>
		public string ExtendLearningProgram { get; set; }

		/// <summary>
		/// bubble up theory
		/// </summary>
		public string SpecialEnrollmentCode { get; set; }

		/// <summary>
		/// bubble up theory
		/// </summary>
		public string Access504 { get; set; }

		/// <summary>
		/// bubble up theory
		/// </summary>
		public string SpecialProgramCode { get; set; }

		/// <summary>
		/// VO - go away when CTE module implemented
		/// </summary>
		public string Vocational { get; set; }

		/// <summary>
		/// IV: go away when CTE module implemented
		/// </summary>
		public string Ivep { get; set; }

		/// <summary>
		/// TE: go away when CTE module implemented
		/// </summary>
		public string TechPrep { get; set; }

		/// <summary>
		/// YE - SAIS
		/// </summary>
		public string YearEndStatus { get; set; }

		/// <summary>
		/// AB
		/// </summary>
		public string BusRouteToSchool { get; set; }

		/// <summary>
		/// PB
		/// </summary>
		public string BusRouteFromSchool { get; set; }

		/// <summary>
		/// bubble up theory
		/// </summary>
		public string TutionPayerCode { get; set; }

		/// <summary>
		/// NS
		/// </summary>
		public Guid? NextSchoolGu { get; set; }

		/// <summary>
		/// NG
		/// </summary>
		public string NextGradeLevel { get; set; }

		/// <summary>
		/// This is set to Y when something relevant has changed that will cause a form print (whatever we determine &quot;form&quot; means)
		/// </summary>
		public string HasChangedFlag { get; set; }

		/// <summary>
		/// TG - SASI3 status flag
		/// </summary>
		public string Status { get; set; }

		/// <summary>
		/// bubble up theory
		/// </summary>
		public string Homebound { get; set; }

		/// <summary>
		/// bubble up theory
		/// </summary>
		public string DistrictOfResidence { get; set; }

		/// <summary>
		/// bubble up theory
		/// </summary>
		public string Fte { get; set; }

		/// <summary>
		/// ATS.LC; ATS.EC make &quot;E3&quot;
		/// </summary>
		public string SummerWithdrawlCode { get; set; }

		/// <summary>
		/// ATS.LD as first day of the calendar; ATS.ED also first day of calendar
		/// </summary>
		public DateTime? SummerWithdrawlDate { get; set; }

		/// <summary>
		/// C1 - will eventually be moved to needs to be time tracked
		/// </summary>
		public string Title1Program { get; set; }

		/// <summary>
		/// C2 byte 1 - will eventually be moved to needs to be time tracked
		/// </summary>
		public string Title1Service { get; set; }

		/// <summary>
		/// C2 byte 2 - will eventually be moved to needs to be time tracked
		/// </summary>
		public string Title1Exit { get; set; }

		/// <summary>
		/// Uses bubble up theory, is the last activity date.  Any new activity must be greater than or equal to this date.
		/// </summary>
		public DateTime? LastActivityDate { get; set; }

		public Guid? LastSchoolGu { get; set; }
		public string ExcludeAdaAdm { get; set; }
		public string AllowTylenol { get; set; }
		public string AllowMedication { get; set; }

		/// <summary>
		/// SASIxp Reason for Attendance code, Lookup ATP
		/// </summary>
		public string AttendPermitCode { get; set; }

		/// <summary>
		/// SASIxp Reason for Attendance date
		/// </summary>
		public DateTime? AttendPermitDate { get; set; }

		/// <summary>
		/// ASTU.SCHL_RESIDENCE
		/// </summary>
		public Guid? SchoolResidenceGu { get; set; }

		/// <summary>
		/// ASTU.NEXT_TRK Only visible for schools with more than 1 track.
		/// </summary>
		public Guid? NextTrackGu { get; set; }

		/// <summary>
		/// ASTU.AUTO_DIAL
		/// </summary>
		public string ForbidAutoDial { get; set; }

		public string NoShowStudent { get; set; }

		/// <summary>
		/// Scheduling house K12.MassScheduling.HOUSE
		/// </summary>
		public string SchedHouse { get; set; }

		/// <summary>
		/// Scheduling Team K12.MassScheduling.TEAM
		/// </summary>
		public string SchedTeam { get; set; }

		/// <summary>
		/// Do not require student to have the same house for all house marked sections
		/// </summary>
		public string SchedExemptHouse { get; set; }

		/// <summary>
		/// Do not require student to have the same team for all team marked sections
		/// </summary>
		public string SchedExemptTeam { get; set; }

		/// <summary>
		/// scheduling low period limit for this student (no classes to be scheduled below this period number)
		/// </summary>
		public decimal? SchedLowPeriod { get; set; }

		/// <summary>
		/// scheduling high period limit for this student (no classes to be scheduled above this period number)
		/// </summary>
		public decimal? SchedHighPeriod { get; set; }

		/// <summary>
		/// Value to influence the balancing of scheduling classes
		/// </summary>
		public string SchedBalance { get; set; }

		/// <summary>
		/// Last date/time the student course request(s) was changed  upon updating this stamp, also update stamp in school year opt
		/// </summary>
		public DateTime? SchedStamp { get; set; }

		/// <summary>
		/// Withdrawal Reason Code
		/// </summary>
		public string WithdrawalReasonCode { get; set; }

		public string DenyPhotoInterview { get; set; }
		public string AbsReportPolicy { get; set; }
		public string StatementOfAwareness { get; set; }
		public string RegistrationReceived { get; set; }
		public DateTime? RegistrationUpdated { get; set; }
		public string CameFrom { get; set; }
		public string MovedTo { get; set; }
		public string EnrUser1 { get; set; }
		public string EnrUser2 { get; set; }
		public string EnrUser3 { get; set; }
		public string EnrUserDd4 { get; set; }
		public string EnrUserDd5 { get; set; }
		public string EnrUserDd6 { get; set; }

		/// <summary>
		/// Added for state specific uses.  Must bubble-up.
		/// </summary>
		public decimal? EnrUserNum1 { get; set; }

		/// <summary>
		/// Added for state specific uses.  Must bubble-up.
		/// </summary>
		public decimal? EnrUserNum2 { get; set; }

		/// <summary>
		/// Added for state specific uses.  Must bubble-up.
		/// </summary>
		public decimal? EnrUserNum3 { get; set; }

		/// <summary>
		/// Added for state specific uses.  Must bubble-up.
		/// </summary>
		public decimal? EnrUserNum4 { get; set; }

		/// <summary>
		/// Added for state specific uses.  Must bubble-up.
		/// </summary>
		public decimal? EnrUserNum5 { get; set; }

		/// <summary>
		/// Added for state specific uses.  Must bubble-up.
		/// </summary>
		public string EnrUserCheck1 { get; set; }

		/// <summary>
		/// Added for state specific uses.  Must bubble-up.
		/// </summary>
		public string EnrUserCheck2 { get; set; }

		/// <summary>
		/// Added for state specific uses.  Must bubble-up.
		/// </summary>
		public string EnrUserCheck3 { get; set; }

		public decimal? UserNum1 { get; set; }
		public decimal? UserNum2 { get; set; }
		public decimal? UserNum3 { get; set; }
		public decimal? UserNum4 { get; set; }
		public decimal? UserNum5 { get; set; }
		public decimal? UserNum6 { get; set; }
		public decimal? UserNum7 { get; set; }
		public decimal? UserNum8 { get; set; }
		public DateTime? UserDate1 { get; set; }
		public DateTime? UserDate2 { get; set; }
		public DateTime? UserDate3 { get; set; }
		public DateTime? UserDate4 { get; set; }
		public string UserCheck1 { get; set; }
		public string UserCheck2 { get; set; }
		public string UserCheck3 { get; set; }
		public string UserCheck4 { get; set; }
		public string UserCheck5 { get; set; }
		public string UserCheck6 { get; set; }
		public string UserCheck7 { get; set; }
		public string UserCheck8 { get; set; }

		/// <summary>
		/// Transporting district number.  Used in MN MARSS.  Uses the same lookup as MARSS district of residence.
		/// </summary>
		public string TransportatingDistrict { get; set; }

		public string PxpOcrLockedIn { get; set; }
		public DateTime? PxpOcrLockedInDt { get; set; }
		public string PxpOcrValidated { get; set; }
		public DateTime? PxpOcrValidatedDt { get; set; }
		public string ReceiverSchool { get; set; }
		public string SpecEdSchOfAtt { get; set; }
		public string OverrideForceSts { get; set; }
		public string CahseeElaRetake { get; set; }
		public string CahseeMathRetake { get; set; }

		/// <summary>
		/// NS
		/// </summary>
		public Guid? SummerSchoolGu { get; set; }

		/// <summary>
		/// NG
		/// </summary>
		public string SummerGradeLevel { get; set; }

		public string DistrictSpedAccount { get; set; }
		public string EnrUserDd1 { get; set; }
		public string EnrUserDd2 { get; set; }
		public string EnrUserDd3 { get; set; }

		/// <summary>
		/// Type of transport used for pickup from school
		/// </summary>
		public string PickUpTransportType { get; set; }

		/// <summary>
		/// Bus stop to be picked up at
		/// </summary>
		public string PickUpBusStop { get; set; }

		/// <summary>
		/// Time of pickup
		/// </summary>
		public DateTime? PickUpTransportTime { get; set; }

		/// <summary>
		/// Notes about the pickup from school
		/// </summary>
		public string PickUpComment { get; set; }

		/// <summary>
		/// Type of location of the pickup
		/// </summary>
		public string PickUpLocationType { get; set; }

		/// <summary>
		/// GUID for the pickup address
		/// </summary>
		public Guid? PickUpAddressGu { get; set; }

		/// <summary>
		/// Type of transport used for drop off to school
		/// </summary>
		public string DropOffTransportType { get; set; }

		/// <summary>
		/// Bus stop to be dropped off up at
		/// </summary>
		public string DropOffBusStop { get; set; }

		/// <summary>
		/// Time of drop off
		/// </summary>
		public DateTime? DropOffTransportTime { get; set; }

		/// <summary>
		/// Notes about the drop off to school
		/// </summary>
		public string DropOffComment { get; set; }

		/// <summary>
		/// Type of location of the drop off
		/// </summary>
		public string DropOffLocationType { get; set; }

		/// <summary>
		/// GUID for the drop off address
		/// </summary>
		public Guid? DropOffAddressGu { get; set; }

		/// <summary>
		/// Description of the reasons for special transportation
		/// </summary>
		public string SpecTransReqComment { get; set; }

		/// <summary>
		/// Code that indicates student&apos;s eligiblity for transportation
		/// </summary>
		public string TransportEligible { get; set; }

		public Guid? PickUpSchoolGu { get; set; }
		public Guid? DropOffSchoolGu { get; set; }
		public string CompletionStatus { get; set; }
		public string PickUpTransReasCode { get; set; }
		public DateTime? PickUpTransReasDate { get; set; }
		public string DropOffTransReasCode { get; set; }
		public DateTime? DropOffTransReasDate { get; set; }
		public DateTime? ChangeDateTimeStamp { get; set; }
		public Guid? ChangeIdStamp { get; set; }
		public DateTime? AddDateTimeStamp { get; set; }
		public Guid? AddIdStamp { get; set; }
		public string ExpCode { get; set; }
		public string ExpTimeCode { get; set; }
		public DateTime? CbLastRequestUpdate { get; set; }
		public string ResponDistrict { get; set; }
		public string ResponSchool { get; set; }
		public string ServDistrict { get; set; }
		public string ServSchool { get; set; }
		public string SchoolChoiceStatus { get; set; }
		public string FullTimeVirtual { get; set; }
		public string LeaveUnattended { get; set; }
		public DateTime? SchStartTime { get; set; }
		public DateTime? SchDismissTime { get; set; }
		public string PickUpRespPerson { get; set; }
		public string PickUpRespPhone { get; set; }
		public string DropOffRespPerson { get; set; }
		public string DropOffRespPhone { get; set; }
		public Guid? SpclPrgmTchSchYrGu { get; set; }
		public DateTime? TransportRequestDate { get; set; }
		public DateTime? TransportStartDate { get; set; }
		public string EnteredByUser { get; set; }
		public string NextSchAttend { get; set; }
		public decimal? Sped1stSemReimbrsmnt { get; set; }
		public decimal? Sped2ndSemReimbrsmnt { get; set; }
		public string TruancyConference { get; set; }
		public string SrUserCodeDd01 { get; set; }
		public string SrUserCodeDd02 { get; set; }
		public string SrUserCodeDd03 { get; set; }
		public string SrUserCodeDd04 { get; set; }
		public string SrUserCodeDd05 { get; set; }
		public string SrUserCodeDd06 { get; set; }
		public string SrUserCodeDd07 { get; set; }
		public string SrUserCodeDd08 { get; set; }
		public string SrUserCodeDd09 { get; set; }
		public string SrUserCodeDd10 { get; set; }
		public string SrUserCodeDd11 { get; set; }
		public string SrUserCodeDd12 { get; set; }
		public string SrUserCodeDd13 { get; set; }
		public string SrUserCodeDd14 { get; set; }
		public string SrUserCodeDd15 { get; set; }
		public string SrUserCodeDd16 { get; set; }
		public string SrUserCodeDd17 { get; set; }
		public string SrUserCodeDd18 { get; set; }
		public string SrUserCodeDd19 { get; set; }
		public string SrUserCodeDd20 { get; set; }
		public string SrUserCheck01 { get; set; }
		public string SrUserCheck02 { get; set; }
		public string SrUserCheck03 { get; set; }
		public string SrUserCheck04 { get; set; }
		public string SrUserCheck05 { get; set; }
		public decimal? SrEnrUserNum01 { get; set; }
		public decimal? SrEnrUserNum02 { get; set; }
		public decimal? SrEnrUserNum03 { get; set; }
		public decimal? SrEnrUserNum04 { get; set; }
		public decimal? SrEnrUserNum05 { get; set; }
		public string SrEnrUserDd01 { get; set; }
		public string SrEnrUserDd02 { get; set; }
		public string SrEnrUserDd03 { get; set; }
		public string SrEnrUserDd04 { get; set; }
		public string SrEnrUserDd05 { get; set; }
		public string SrEnrUserDd06 { get; set; }
		public string SrEnrUserDd07 { get; set; }
		public string SrEnrUserDd08 { get; set; }
		public string SrEnrUserDd09 { get; set; }
		public string SrEnrUserDd10 { get; set; }
		public string SrEnrUserDd11 { get; set; }
		public string SrEnrUserDd12 { get; set; }
		public string SrEnrUserDd13 { get; set; }
		public string SrEnrUserDd14 { get; set; }
		public string SrEnrUserDd15 { get; set; }
		public string SrEnrUserDd16 { get; set; }
		public string SrEnrUserDd17 { get; set; }
		public string SrEnrUserDd18 { get; set; }
		public string SrEnrUserDd19 { get; set; }
		public string SrEnrUserDd20 { get; set; }
		public string SrEnrUserCheck01 { get; set; }
		public string SrEnrUserCheck02 { get; set; }
		public string SrEnrUserCheck03 { get; set; }
		public string SrEnrUserCheck04 { get; set; }
		public string SrEnrUserCheck05 { get; set; }
		public string SrEnrUserCheck06 { get; set; }
		public string SrEnrUserCheck07 { get; set; }
		public string SrEnrUserCheck08 { get; set; }
		public string SrEnrUserCheck09 { get; set; }
		public string SrEnrUserCheck10 { get; set; }
		public string OptOutMedicalState { get; set; }
		public string OptOutMedicalFed { get; set; }
		public string SchComplCode { get; set; }
		public string SpedReimbrsmntDsbltCd { get; set; }
		public decimal? SpedSumSemReimbrsmnt { get; set; }
		public string SrEnrText1 { get; set; }
		public string SrEnrText2 { get; set; }
		public string SrEnrText3 { get; set; }
		public string SrEnrText4 { get; set; }
		public string SrEnrText5 { get; set; }
		public string SrEnrText6 { get; set; }
		public string SrEnrText7 { get; set; }
		public string SrEnrText8 { get; set; }
		public string SrEnrText9 { get; set; }
		public string SrEnrText10 { get; set; }
		public DateTime? SrUserDate1 { get; set; }
		public DateTime? SrUserDate2 { get; set; }
		public DateTime? SrUserDate3 { get; set; }
		public DateTime? SrUserDate4 { get; set; }
		public DateTime? SrUserDate5 { get; set; }
		public decimal? SrUserNum1 { get; set; }
		public decimal? SrUserNum2 { get; set; }
		public decimal? SrUserNum3 { get; set; }
		public decimal? SrUserNum4 { get; set; }
		public decimal? SrUserNum5 { get; set; }
		public string SrUserText1 { get; set; }
		public string SrUserText2 { get; set; }
		public string SrUserText3 { get; set; }
		public string SrUserText4 { get; set; }
		public string SrUserText5 { get; set; }
		public string SrUserText6 { get; set; }
		public string SrUserText7 { get; set; }
		public string SrUserText8 { get; set; }
		public string SrUserText9 { get; set; }
		public string SrUserText10 { get; set; }
		public string MilitaryCompactStatute { get; set; }
		public decimal? SubSchool { get; set; }
		public string CollegeEnrolled { get; set; }
		public string PreviousLocationType { get; set; }
		public string PreviousYearEndStatus { get; set; }
		public string StuCtdsNumber { get; set; }
		public string ReportingSchool { get; set; }
		public string CountyResident { get; set; }
		public string PrevInGrade { get; set; }
		public string CountyResidentNew { get; set; }
		public string NonResident { get; set; }
		public string ContinuousState { get; set; }
		public string ContinuousSchool { get; set; }
		public string ContinuousDistrict { get; set; }
		public string StateFundingStatus { get; set; }
		public decimal? StuInstructionalHours { get; set; }
		public DateTime? SrEnrUserDate01 { get; set; }
		public DateTime? SrEnrUserDate02 { get; set; }
		public DateTime? SrEnrUserDate03 { get; set; }
		public DateTime? SrEnrUserDate04 { get; set; }
		public DateTime? SrEnrUserDate05 { get; set; }
		public string PupilAttInfo { get; set; }
		public string AllowIbuprofen { get; set; }
		public decimal? InitNinthGradeYear { get; set; }
		public string EnrPathway { get; set; }
		public string NextEnrPathway { get; set; }
		public string NyrExclude { get; set; }
		public decimal? BusEstimatedMileage { get; set; }
		public string CourseOfStudy { get; set; }
		public string DropOffBusNumber { get; set; }
		public string PickUpBusNumber { get; set; }
		public int? StandardDayMinutes { get; set; }
		public string EmployedWhileEnrolled { get; set; }
		public string HomeSchooled { get; set; }
		public string MilitaryConnection { get; set; }
		public string PkFundingSource { get; set; }
		public string ManualFteOverride { get; set; }
		public string OverrideContAndFunding { get; set; }
		public string SmrWithdrawalReasonCode { get; set; }
		public string SrUserCodeDd21 { get; set; }
		public string SrUserCodeDd22 { get; set; }
		public string ExcFrmAutoCalcFte { get; set; }
		public string DrpParticipant { get; set; }
		public Guid? AdministratorSchYrGu { get; set; }
		public string AltEduStu { get; set; }
		public string FosterHome { get; set; }
		public string Immigrant { get; set; }
		public string NighttimeResidence { get; set; }
		public string Refugee { get; set; }
		public string ResidentDistrict { get; set; }
		public string ResidentTown { get; set; }
		public string UnaccompaniedYouth { get; set; }
		public string StateGradeLvlOverride { get; set; }
		public string AttPlanCode { get; set; }
		public string AttConfCode { get; set; }
		public string CourtReferralCode { get; set; }
		public string StateEnrollmentType { get; set; }
		public string HazardousWalkingCode { get; set; }
		public string PrvWithdrawalCde { get; set; }
		public string CrntEnterCde { get; set; }
		public string Z349585 { get; set; }
		public string SrUserCodeDd23 { get; set; }
		public string SrUserCodeDd24 { get; set; }
		public string SrEnrUserDd23 { get; set; }
		public string SrEnrUserDd24 { get; set; }
		public string ReceiverDistrict { get; set; }
		public string NoShowComment { get; set; }
		public string NoShowReceiverDistrict { get; set; }
		public string NoShowReceiverSchool { get; set; }
		public string InactivateComment { get; set; }
		public DateTime? NoShowDate { get; set; }
		public decimal? SchedWeight { get; set; }
		public decimal? DiscDetHours { get; set; }
		public decimal? DiscDetHoursServed { get; set; }
		public string SchedPathwayHouse { get; set; }
		public string SchedPathwayTeam { get; set; }
		public string PriorSchoolDistrict { get; set; }
		public string PriorSchoolState { get; set; }
		public string PriorSchoolCountry { get; set; }
		public string StudentOffenderTransfer { get; set; }
		public string EducationalChoice { get; set; }
		public string DisasterAffectedStudent { get; set; }
		public string PickUpVehicleCat { get; set; }
		public string DropOffVehicleCat { get; set; }
		public string TransportMembershipCat { get; set; }
		public string IntnsvSuppSvcSem1 { get; set; }
		public string IntnsvSuppSvcSem2 { get; set; }
		public string IntnsvSuppSvcSum { get; set; }
		public string IntnsvSuppSvcBgn { get; set; }
		public string NextAttendPermitCode { get; set; }
		public DateTime? NextAttendPermitDate { get; set; }
		public Guid? NextConcurrentSchoolGu { get; set; }
		public string SrEnrUserCheck11 { get; set; }
		public string SrEnrUserCheck12 { get; set; }
		public string SrEnrUserCheck13 { get; set; }
		public string SrEnrUserCheck14 { get; set; }
		public string SrEnrUserCheck15 { get; set; }
		public Guid? ElCaseMgrGu { get; set; }
		public DateTime? ElCaseMgrAssnDate { get; set; }
		public string SchdStatus { get; set; }
		public decimal? SrUserNumExt1 { get; set; }
		public string ResidentStatus { get; set; }
		public string CareerAcademy1 { get; set; }
		public string CareerAcademy2 { get; set; }
		public string CareerAcademy3 { get; set; }
		public string GrdPromoStatExempt { get; set; }
		public string GrdPromoStat { get; set; }
		public string TypeOfInstruction { get; set; }
		public decimal? InPersonPercentTime { get; set; }
		public decimal? RemotePercentTime { get; set; }
		public string HybridPattern { get; set; }
		public string ResWaiverReason { get; set; }
		public DateTime? ResWaiverDate { get; set; }
		public string PickUpGridCode { get; set; }
		public string DropOffGridCode { get; set; }
		public DateTime? LastCovidContactDate { get; set; }

		public virtual RevOrganizationYear OrganizationYear { get; set; }
		public virtual EpcStu Student { get; set; }
		public virtual RevYear Year { get; set; }
	}
}