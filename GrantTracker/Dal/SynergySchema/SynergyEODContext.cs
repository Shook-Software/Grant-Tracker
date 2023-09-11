using Microsoft.EntityFrameworkCore;

namespace GrantTracker.Dal.SynergySchema
{
	public partial class SynergyEODContext : DbContext
	{
		public SynergyEODContext()
		{
		}

		public SynergyEODContext(DbContextOptions<SynergyEODContext> options)
				: base(options)
		{
		}

		public virtual DbSet<EpcStu> RevStudents { get; set; }
		public virtual DbSet<EpcStuSchYr> RevSSY { get; set; }
		public virtual DbSet<RevOrganization> RevOrganizations { get; set; }
		public virtual DbSet<RevOrganizationYear> RevOrganizationYears { get; set; }
		public virtual DbSet<RevPerson> RevPeople { get; set; }
		public virtual DbSet<RevYear> RevYears { get; set; }
		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			modelBuilder.Entity<EpcStu>(entity =>
			{
				entity.HasKey(e => e.StudentGu)
									.HasName("EPC_STU_P");

				entity.ToTable("EPC_STU", "rev");

				entity.HasIndex(e => e.SisNumber, "EPC_STU_C1")
									.IsUnique();

				entity.HasIndex(e => e.EnrRestrictOrganizationGu, "EPC_STU_I1");

				entity.HasIndex(e => e.GradReqDefGu, "EPC_STU_I2");

				entity.HasIndex(e => e.PrimaryCommFamilyGu, "EPC_STU_I3");

				entity.HasIndex(e => e.EnrollResidentFamilyGu, "EPC_STU_I4");

				entity.HasIndex(e => e.ChildInitialSchool, "EPC_STU_I5");

				entity.Property(e => e.StudentGu)
									.ValueGeneratedNever()
									.HasColumnName("STUDENT_GU");

				entity.Property(e => e.AddDateTimeStamp)
									.HasColumnType("datetime")
									.HasColumnName("ADD_DATE_TIME_STAMP");

				entity.Property(e => e.AddIdStamp).HasColumnName("ADD_ID_STAMP");

				entity.Property(e => e.AddressChgDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("ADDRESS_CHG_DATE");

				entity.Property(e => e.AdultEdCertOfComp)
									.HasMaxLength(5)
									.HasColumnName("ADULT_ED_CERT_OF_COMP");

				entity.Property(e => e.AdultEdDiplomaDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("ADULT_ED_DIPLOMA_DATE");

				entity.Property(e => e.AdultEdDiplomaType)
									.HasMaxLength(5)
									.HasColumnName("ADULT_ED_DIPLOMA_TYPE");

				entity.Property(e => e.AdvIntlCertPrgm)
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("ADV_INTL_CERT_PRGM");

				entity.Property(e => e.AiceDiploma)
									.HasMaxLength(1)
									.HasColumnName("AICE_DIPLOMA");

				entity.Property(e => e.AllowMedicalTreatment)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("ALLOW_MEDICAL_TREATMENT")
									.IsFixedLength();

				entity.Property(e => e.AltId1)
									.HasMaxLength(20)
									.HasColumnName("ALT_ID_1");

				entity.Property(e => e.AltId2)
									.HasMaxLength(20)
									.HasColumnName("ALT_ID_2");

				entity.Property(e => e.AnonymousStuId)
									.HasColumnType("numeric(18, 0)")
									.HasColumnName("ANONYMOUS_STU_ID");

				entity.Property(e => e.ApCapstoneDiploma)
									.HasMaxLength(1)
									.HasColumnName("AP_CAPSTONE_DIPLOMA");

				entity.Property(e => e.AssociateDegree)
									.HasMaxLength(1)
									.HasColumnName("ASSOCIATE_DEGREE");

				entity.Property(e => e.BilingualCode)
									.HasMaxLength(5)
									.HasColumnName("BILINGUAL_CODE")
									.HasComment("temp code - BL");

				entity.Property(e => e.BilingualDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("BILINGUAL_DATE")
									.HasComment("temp date - BL");

				entity.Property(e => e.BirthCertificateNum)
									.HasMaxLength(20)
									.HasColumnName("BIRTH_CERTIFICATE_NUM");

				entity.Property(e => e.BirthCountry)
									.HasMaxLength(5)
									.HasColumnName("BIRTH_COUNTRY")
									.HasComment("BC");

				entity.Property(e => e.BirthCounty)
									.HasMaxLength(5)
									.HasColumnName("BIRTH_COUNTY");

				entity.Property(e => e.BirthSpecialCircumstances)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("BIRTH_SPECIAL_CIRCUMSTANCES")
									.IsFixedLength()
									.HasComment("If the child was born in a foreign country and granted U.S. citizenship");

				entity.Property(e => e.BirthState)
									.HasMaxLength(5)
									.HasColumnName("BIRTH_STATE")
									.HasComment("BS");

				entity.Property(e => e.BirthVerification)
									.HasMaxLength(5)
									.HasColumnName("BIRTH_VERIFICATION")
									.HasComment("BV");

				entity.Property(e => e.BirthVerificationOther)
									.HasMaxLength(50)
									.HasColumnName("BIRTH_VERIFICATION_OTHER");

				entity.Property(e => e.CallOrder)
									.HasColumnType("numeric(2, 0)")
									.HasColumnName("CALL_ORDER");

				entity.Property(e => e.CdwPrescribedLoadOffset)
									.HasColumnType("numeric(7, 4)")
									.HasColumnName("CDW_PRESCRIBED_LOAD_OFFSET");

				entity.Property(e => e.CertGenStudies)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("CERT_GEN_STUDIES")
									.IsFixedLength();

				entity.Property(e => e.CertOfCmpltDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("CERT_OF_CMPLT_DATE");

				entity.Property(e => e.CertificationOfCompletion)
									.HasMaxLength(5)
									.HasColumnName("CERTIFICATION_OF_COMPLETION");

				entity.Property(e => e.ChangeDateTimeStamp)
									.HasColumnType("datetime")
									.HasColumnName("CHANGE_DATE_TIME_STAMP");

				entity.Property(e => e.ChangeIdStamp).HasColumnName("CHANGE_ID_STAMP");

				entity.Property(e => e.ChildHoldEnrollment)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("CHILD_HOLD_ENROLLMENT")
									.IsFixedLength();

				entity.Property(e => e.ChildInitalGrade)
									.HasMaxLength(5)
									.HasColumnName("CHILD_INITAL_GRADE");

				entity.Property(e => e.ChildInitialSchool).HasColumnName("CHILD_INITIAL_SCHOOL");

				entity.Property(e => e.ClassOf)
									.HasColumnType("numeric(4, 0)")
									.HasColumnName("CLASS_OF");

				entity.Property(e => e.CollegeReadyDiploma)
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("COLLEGE_READY_DIPLOMA");

				entity.Property(e => e.CommDatePassedForGrad)
									.HasColumnType("smalldatetime")
									.HasColumnName("COMM_DATE_PASSED_FOR_GRAD");

				entity.Property(e => e.CrdAccommodationCode)
									.HasMaxLength(5)
									.HasColumnName("CRD_ACCOMMODATION_CODE");

				entity.Property(e => e.CredentialTypeCode)
									.HasMaxLength(5)
									.HasColumnName("CREDENTIAL_TYPE_CODE");

				entity.Property(e => e.CreditAccommodation)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("CREDIT_ACCOMMODATION")
									.IsFixedLength();

				entity.Property(e => e.CriticalIllness)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("CRITICAL_ILLNESS")
									.IsFixedLength()
									.HasComment("CI");

				entity.Property(e => e.CsapAlternateAssess)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("CSAP_ALTERNATE_ASSESS")
									.IsFixedLength();

				entity.Property(e => e.CtePathway)
									.HasMaxLength(5)
									.HasColumnName("CTE_PATHWAY");

				entity.Property(e => e.CtePathwayCompleter)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("CTE_PATHWAY_COMPLETER")
									.IsFixedLength();

				entity.Property(e => e.CustodyCode)
									.HasMaxLength(5)
									.HasColumnName("CUSTODY_CODE")
									.HasComment("CD");

				entity.Property(e => e.DeviceAccess)
									.HasMaxLength(5)
									.HasColumnName("DEVICE_ACCESS");

				entity.Property(e => e.DigDeviceAcc)
									.HasMaxLength(5)
									.HasColumnName("DIG_DEVICE_ACC");

				entity.Property(e => e.DigDeviceProv)
									.HasMaxLength(5)
									.HasColumnName("DIG_DEVICE_PROV");

				entity.Property(e => e.DigitalDevice)
									.HasMaxLength(5)
									.HasColumnName("DIGITAL_DEVICE");

				entity.Property(e => e.DiplomaAttemptType1)
									.HasMaxLength(5)
									.HasColumnName("DIPLOMA_ATTEMPT_TYPE_1");

				entity.Property(e => e.DiplomaAttemptType2)
									.HasMaxLength(5)
									.HasColumnName("DIPLOMA_ATTEMPT_TYPE_2");

				entity.Property(e => e.DiplomaAttemptType3)
									.HasMaxLength(5)
									.HasColumnName("DIPLOMA_ATTEMPT_TYPE_3");

				entity.Property(e => e.DiplomaDesignation)
									.HasMaxLength(5)
									.HasColumnName("DIPLOMA_DESIGNATION");

				entity.Property(e => e.DiplomaOption)
									.HasMaxLength(5)
									.HasColumnName("DIPLOMA_OPTION");

				entity.Property(e => e.DiplomaSeal)
									.HasMaxLength(20)
									.HasColumnName("DIPLOMA_SEAL");

				entity.Property(e => e.DiplomaType)
									.HasMaxLength(5)
									.HasColumnName("DIPLOMA_TYPE");

				entity.Property(e => e.DirectoryListExclude)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("DIRECTORY_LIST_EXCLUDE")
									.IsFixedLength()
									.HasComment("Exclude student info for outside directory list (such as military): DT");

				entity.Property(e => e.Disadvantaged)
									.HasMaxLength(5)
									.HasColumnName("DISADVANTAGED");

				entity.Property(e => e.DisplacedHomemaker)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("DISPLACED_HOMEMAKER")
									.IsFixedLength();

				entity.Property(e => e.DistrictOfResidenceAddr)
									.HasMaxLength(10)
									.HasColumnName("DISTRICT_OF_RESIDENCE_ADDR");

				entity.Property(e => e.DwellingType)
									.HasMaxLength(5)
									.HasColumnName("DWELLING_TYPE");

				entity.Property(e => e.DwellingTypeOther)
									.HasMaxLength(50)
									.HasColumnName("DWELLING_TYPE_OTHER");

				entity.Property(e => e.EarlyCollegeScholar)
									.HasMaxLength(5)
									.HasColumnName("EARLY_COLLEGE_SCHOLAR");

				entity.Property(e => e.EarlyGrad)
									.HasMaxLength(5)
									.HasColumnName("EARLY_GRAD");

				entity.Property(e => e.EarnedBiliteracySeal)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("EARNED_BILITERACY_SEAL")
									.IsFixedLength();

				entity.Property(e => e.EnrRestrInclExcl)
									.HasMaxLength(5)
									.HasColumnName("ENR_RESTR_INCL_EXCL")
									.HasComment("If school types are included/excluded in the enrollment restrictions.");

				entity.Property(e => e.EnrRestrictOrganizationGu).HasColumnName("ENR_RESTRICT_ORGANIZATION_GU");

				entity.Property(e => e.EnrollLessThreeOvr)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("ENROLL_LESS_THREE_OVR")
									.IsFixedLength();

				entity.Property(e => e.EnrollResidentFamilyGu).HasColumnName("ENROLL_RESIDENT_FAMILY_GU");

				entity.Property(e => e.EnrollmentRestrictionCode)
									.HasMaxLength(5)
									.HasColumnName("ENROLLMENT_RESTRICTION_CODE")
									.HasComment("XT: Expelled students trying to re-enroll at another school; SASI3 blinks the name");

				entity.Property(e => e.EnrollmentRestrictionDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("ENROLLMENT_RESTRICTION_DATE")
									.HasComment("XD: The date teh restriction code was implemented");

				entity.Property(e => e.ExcessiveDebtIndicator)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("EXCESSIVE_DEBT_INDICATOR")
									.IsFixedLength()
									.HasComment("Yes - prevents mailing of grade/progress reports: DB");

				entity.Property(e => e.ExcludeFromAutoFteCalc)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("EXCLUDE_FROM_AUTO_FTE_CALC")
									.IsFixedLength();

				entity.Property(e => e.ExpectedGraduationMonth)
									.HasColumnType("numeric(2, 0)")
									.HasColumnName("EXPECTED_GRADUATION_MONTH");

				entity.Property(e => e.ExpectedGraduationYear)
									.HasColumnType("numeric(4, 0)")
									.HasColumnName("EXPECTED_GRADUATION_YEAR")
									.HasComment("GY - 5 years + 9th grade; calendar year in which you graduate");

				entity.Property(e => e.FamilyCode)
									.HasMaxLength(7)
									.HasColumnName("FAMILY_CODE")
									.HasComment("Type of family (one parent, two parent, etc.): EM");

				entity.Property(e => e.FinalWithdrawalDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("FINAL_WITHDRAWAL_DATE")
									.HasComment("Date left disctict; upon reactivation clear this date; The leave date or summer withdrawl date");

				entity.Property(e => e.FosterHome)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("FOSTER_HOME")
									.IsFixedLength();

				entity.Property(e => e.FosterId)
									.HasMaxLength(10)
									.HasColumnName("FOSTER_ID");

				entity.Property(e => e.GeneralEquivalencyDiploma)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("GENERAL_EQUIVALENCY_DIPLOMA")
									.IsFixedLength()
									.HasComment("GE");

				entity.Property(e => e.GpEligWaivDtHs)
									.HasColumnType("smalldatetime")
									.HasColumnName("GP_ELIG_WAIV_DT_HS");

				entity.Property(e => e.GpEligWaivDtMs)
									.HasColumnType("smalldatetime")
									.HasColumnName("GP_ELIG_WAIV_DT_MS");

				entity.Property(e => e.GradReqBasis)
									.HasMaxLength(2)
									.IsUnicode(false)
									.HasColumnName("GRAD_REQ_BASIS");

				entity.Property(e => e.GradReqDefGu).HasColumnName("GRAD_REQ_DEF_GU");

				entity.Property(e => e.GraduationDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("GRADUATION_DATE")
									.HasComment("ASTU.GRAD_DT is not used in Elementary");

				entity.Property(e => e.GraduationPlan)
									.HasMaxLength(5)
									.HasColumnName("GRADUATION_PLAN");

				entity.Property(e => e.GraduationSemester)
									.HasMaxLength(5)
									.HasColumnName("GRADUATION_SEMESTER");

				entity.Property(e => e.GraduationStatus)
									.HasMaxLength(5)
									.HasColumnName("GRADUATION_STATUS")
									.HasComment("K12.");

				entity.Property(e => e.GridCode)
									.HasMaxLength(10)
									.HasColumnName("GRID_CODE")
									.HasComment("Used during address validation - GC");

				entity.Property(e => e.HasInternetAtHome)
									.HasMaxLength(5)
									.HasColumnName("HAS_INTERNET_AT_HOME");

				entity.Property(e => e.HomeCounty)
									.HasMaxLength(20)
									.HasColumnName("HOME_COUNTY");

				entity.Property(e => e.HomeLanguage)
									.HasMaxLength(5)
									.HasColumnName("HOME_LANGUAGE")
									.HasComment("HL");

				entity.Property(e => e.HomeLanguageDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("HOME_LANGUAGE_DATE");

				entity.Property(e => e.HomeLess)
									.HasMaxLength(5)
									.HasColumnName("HOME_LESS")
									.HasComment("Renamed from ASTU.FAMILY_LINK");

				entity.Property(e => e.IbDiploma)
									.HasMaxLength(1)
									.HasColumnName("IB_DIPLOMA");

				entity.Property(e => e.Immigrant)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("IMMIGRANT")
									.IsFixedLength();

				entity.Property(e => e.ImmigrationDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("IMMIGRATION_DATE");

				entity.Property(e => e.Indicator1)
									.IsRequired()
									.HasMaxLength(5)
									.HasColumnName("INDICATOR_1");

				entity.Property(e => e.Indicator2)
									.IsRequired()
									.HasMaxLength(5)
									.HasColumnName("INDICATOR_2");

				entity.Property(e => e.Indicator3)
									.IsRequired()
									.HasMaxLength(5)
									.HasColumnName("INDICATOR_3");

				entity.Property(e => e.Indicator4)
									.IsRequired()
									.HasMaxLength(5)
									.HasColumnName("INDICATOR_4");

				entity.Property(e => e.Indicator5)
									.IsRequired()
									.HasMaxLength(5)
									.HasColumnName("INDICATOR_5");

				entity.Property(e => e.Indicator504)
									.HasMaxLength(5)
									.HasColumnName("INDICATOR_504");

				entity.Property(e => e.Indicator6)
									.IsRequired()
									.HasMaxLength(5)
									.HasColumnName("INDICATOR_6");

				entity.Property(e => e.Indicator7)
									.IsRequired()
									.HasMaxLength(5)
									.HasColumnName("INDICATOR_7");

				entity.Property(e => e.Indicator8)
									.IsRequired()
									.HasMaxLength(5)
									.HasColumnName("INDICATOR_8");

				entity.Property(e => e.IndicatorEll)
									.IsRequired()
									.HasMaxLength(5)
									.HasColumnName("INDICATOR_ELL");

				entity.Property(e => e.IndicatorSpeced)
									.IsRequired()
									.HasMaxLength(5)
									.HasColumnName("INDICATOR_SPECED");

				entity.Property(e => e.InitNinthGradeYear)
									.HasColumnType("numeric(4, 0)")
									.HasColumnName("INIT_NINTH_GRADE_YEAR");

				entity.Property(e => e.InitNinthGradeYearDt)
									.HasColumnType("smalldatetime")
									.HasColumnName("INIT_NINTH_GRADE_YEAR_DT");

				entity.Property(e => e.IntAccBarrier)
									.HasMaxLength(5)
									.HasColumnName("INT_ACC_BARRIER");

				entity.Property(e => e.IntAccType)
									.HasMaxLength(5)
									.HasColumnName("INT_ACC_TYPE");

				entity.Property(e => e.IntPerf)
									.HasMaxLength(5)
									.HasColumnName("INT_PERF");

				entity.Property(e => e.InternetAuthorization)
									.HasMaxLength(5)
									.HasColumnName("INTERNET_AUTHORIZATION")
									.HasComment("IN");

				entity.Property(e => e.InterpreterNeeded)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("INTERPRETER_NEEDED")
									.IsFixedLength();

				entity.Property(e => e.LocAwardCrd)
									.HasColumnType("numeric(2, 0)")
									.HasColumnName("LOC_AWARD_CRD");

				entity.Property(e => e.MailSameAsHomeAddress)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("MAIL_SAME_AS_HOME_ADDRESS")
									.IsFixedLength()
									.HasComment("Mail address is same as home address");

				entity.Property(e => e.MathDatePassedForGrad)
									.HasColumnType("smalldatetime")
									.HasColumnName("MATH_DATE_PASSED_FOR_GRAD");

				entity.Property(e => e.Medicaid)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("MEDICAID")
									.IsFixedLength()
									.HasComment("ASTU.GETS_AID - Called Medical in California");

				entity.Property(e => e.MiddleNameVerification)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("MIDDLE_NAME_VERIFICATION")
									.IsFixedLength();

				entity.Property(e => e.Migrant)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("MIGRANT")
									.IsFixedLength()
									.HasComment("MG");

				entity.Property(e => e.MigrantStudentId)
									.HasMaxLength(20)
									.HasColumnName("MIGRANT_STUDENT_ID");

				entity.Property(e => e.MilitaryEnlisted)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("MILITARY_ENLISTED")
									.IsFixedLength();

				entity.Property(e => e.MilitaryFamilyCode)
									.HasMaxLength(5)
									.HasColumnName("MILITARY_FAMILY_CODE");

				entity.Property(e => e.MonthsNonUsAttendance).HasColumnName("MONTHS_NON_US_ATTENDANCE");

				entity.Property(e => e.MonthsUsAttendance).HasColumnName("MONTHS_US_ATTENDANCE");

				entity.Property(e => e.MsixNumber)
									.HasMaxLength(20)
									.HasColumnName("MSIX_NUMBER");

				entity.Property(e => e.NatlAchieveScholar)
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("NATL_ACHIEVE_SCHOLAR");

				entity.Property(e => e.NatlHispScholar)
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("NATL_HISP_SCHOLAR");

				entity.Property(e => e.NatlMeritScholar)
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("NATL_MERIT_SCHOLAR");

				entity.Property(e => e.NoPhoneNeeded)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("NO_PHONE_NEEDED")
									.IsFixedLength()
									.HasComment("Mandatory to add telephone with option for no phone");

				entity.Property(e => e.Notes)
									.HasColumnType("ntext")
									.HasColumnName("NOTES");

				entity.Property(e => e.OldStateStudentNumber)
									.HasMaxLength(20)
									.HasColumnName("OLD_STATE_STUDENT_NUMBER");

				entity.Property(e => e.OnlineCrsExempt)
									.HasMaxLength(5)
									.HasColumnName("ONLINE_CRS_EXEMPT");

				entity.Property(e => e.OptOutDirectory)
									.HasMaxLength(5)
									.HasColumnName("OPT_OUT_DIRECTORY")
									.HasComment("A customized drop down list of opt out reasons");

				entity.Property(e => e.OptOutFamilyLifeEd)
									.HasMaxLength(5)
									.HasColumnName("OPT_OUT_FAMILY_LIFE_ED")
									.HasComment("A customized drop down list of opt out reasons");

				entity.Property(e => e.OptOutGuidance)
									.HasMaxLength(5)
									.HasColumnName("OPT_OUT_GUIDANCE")
									.HasComment("A customized drop down list of opt out reasons");

				entity.Property(e => e.OptOutMedicalFed)
									.HasMaxLength(5)
									.HasColumnName("OPT_OUT_MEDICAL_FED");

				entity.Property(e => e.OptOutMedicalState)
									.HasMaxLength(5)
									.HasColumnName("OPT_OUT_MEDICAL_STATE");

				entity.Property(e => e.OptOutMilitary)
									.HasMaxLength(5)
									.HasColumnName("OPT_OUT_MILITARY")
									.HasComment("A customized drop down list of opt out reasons");

				entity.Property(e => e.OptOutPhotoRelease)
									.HasMaxLength(5)
									.HasColumnName("OPT_OUT_PHOTO_RELEASE")
									.HasComment("A customized drop down list of opt out reasons");

				entity.Property(e => e.OriginalEnterCode)
									.HasMaxLength(5)
									.HasColumnName("ORIGINAL_ENTER_CODE")
									.HasComment("ASTU.ORIG_ENTER_DT, Lookup ENTER_CODE");

				entity.Property(e => e.OriginalEnterDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("ORIGINAL_ENTER_DATE");

				entity.Property(e => e.OriginalEnterGrade)
									.HasMaxLength(5)
									.HasColumnName("ORIGINAL_ENTER_GRADE");

				entity.Property(e => e.OriginalStateEnterDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("ORIGINAL_STATE_ENTER_DATE");

				entity.Property(e => e.OverrideContAndFunding)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("OVERRIDE_CONT_AND_FUNDING")
									.IsFixedLength();

				entity.Property(e => e.OwnedByGenesis)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("OWNED_BY_GENESIS")
									.IsFixedLength()
									.HasComment("Used by New Year Rollover from other SIS, does Synergy own this student");

				entity.Property(e => e.ParentalStatusCode)
									.HasMaxLength(10)
									.HasColumnName("PARENTAL_STATUS_CODE");

				entity.Property(e => e.PartnershipAcademyId)
									.HasMaxLength(5)
									.HasColumnName("PARTNERSHIP_ACADEMY_ID");

				entity.Property(e => e.PerspectiveCollege)
									.HasMaxLength(5)
									.HasColumnName("PERSPECTIVE_COLLEGE");

				entity.Property(e => e.PostSecSurvey)
									.HasMaxLength(50)
									.HasColumnName("POST_SEC_SURVEY");

				entity.Property(e => e.PostSecondary)
									.HasMaxLength(5)
									.HasColumnName("POST_SECONDARY");

				entity.Property(e => e.PrevSchoolId)
									.HasMaxLength(10)
									.HasColumnName("PREV_SCHOOL_ID")
									.HasComment("Previous School Entity ID");

				entity.Property(e => e.PrevSchoolStateId)
									.HasMaxLength(20)
									.HasColumnName("PREV_SCHOOL_STATE_ID")
									.HasComment("Previous school State ID");

				entity.Property(e => e.PrevStateCode)
									.HasMaxLength(5)
									.HasColumnName("PREV_STATE_CODE")
									.HasComment("Previous State Code");

				entity.Property(e => e.PrimaryCommFamilyGu).HasColumnName("PRIMARY_COMM_FAMILY_GU");

				entity.Property(e => e.PrimaryLanguageDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("PRIMARY_LANGUAGE_DATE");

				entity.Property(e => e.ProfAthlete)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("PROF_ATHLETE")
									.IsFixedLength();

				entity.Property(e => e.PsychologicalScreening)
									.HasMaxLength(5)
									.HasColumnName("PSYCHOLOGICAL_SCREENING");

				entity.Property(e => e.PublicSchStYr)
									.HasColumnType("numeric(4, 0)")
									.HasColumnName("PUBLIC_SCH_ST_YR");

				entity.Property(e => e.PushAssignCutoff)
									.HasColumnType("numeric(3, 0)")
									.HasColumnName("PUSH_ASSIGN_CUTOFF");

				entity.Property(e => e.PushGradeCutoff)
									.HasColumnType("numeric(3, 0)")
									.HasColumnName("PUSH_GRADE_CUTOFF");

				entity.Property(e => e.PushNoteAssign)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("PUSH_NOTE_ASSIGN")
									.IsFixedLength();

				entity.Property(e => e.PushNoteAtt)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("PUSH_NOTE_ATT")
									.IsFixedLength();

				entity.Property(e => e.PushNoteDiscp)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("PUSH_NOTE_DISCP")
									.IsFixedLength();

				entity.Property(e => e.PushNoteGrade)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("PUSH_NOTE_GRADE")
									.IsFixedLength();

				entity.Property(e => e.PushNoteHealth)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("PUSH_NOTE_HEALTH")
									.IsFixedLength();

				entity.Property(e => e.RaceSelectionDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("RACE_SELECTION_DATE");

				entity.Property(e => e.Refugee)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("REFUGEE")
									.IsFixedLength();

				entity.Property(e => e.RelationSelectRace)
									.HasMaxLength(5)
									.HasColumnName("RELATION_SELECT_RACE");

				entity.Property(e => e.ReqStateStuNum)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("REQ_STATE_STU_NUM")
									.IsFixedLength();

				entity.Property(e => e.ReqStateStudentNumber)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("REQ_STATE_STUDENT_NUMBER")
									.IsFixedLength();

				entity.Property(e => e.Retired)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("RETIRED")
									.IsFixedLength();

				entity.Property(e => e.SchoolingInUs)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("SCHOOLING_IN_US")
									.IsFixedLength()
									.HasComment("Foreign born schooling in the United States less than or equal to 3 academic years");

				entity.Property(e => e.SigStuDataChange)
									.HasColumnType("smalldatetime")
									.HasColumnName("SIG_STU_DATA_CHANGE");

				entity.Property(e => e.SisNumber)
									.IsRequired()
									.HasMaxLength(20)
									.HasColumnName("SIS_NUMBER")
									.HasComment("ID");

				entity.Property(e => e.SpecPermLocAwardCrd)
									.HasColumnType("numeric(2, 0)")
									.HasColumnName("SPEC_PERM_LOC_AWARD_CRD");

				entity.Property(e => e.SpecialEdScreeningDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("SPECIAL_ED_SCREENING_DATE")
									.HasComment("SG");

				entity.Property(e => e.SpedWeeklyTimePerct)
									.HasColumnType("numeric(3, 0)")
									.HasColumnName("SPED_WEEKLY_TIME_PERCT");

				entity.Property(e => e.SrDatetimeval01)
									.HasColumnType("smalldatetime")
									.HasColumnName("SR_DATETIMEVAL_01");

				entity.Property(e => e.SrUserCheck01)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("SR_USER_CHECK_01")
									.IsFixedLength();

				entity.Property(e => e.SrUserDd01)
									.HasMaxLength(5)
									.HasColumnName("SR_USER_DD_01");

				entity.Property(e => e.SrUserNum01)
									.HasColumnType("numeric(12, 3)")
									.HasColumnName("SR_USER_NUM_01");

				entity.Property(e => e.SrUserText1)
									.HasMaxLength(50)
									.HasColumnName("SR_USER_TEXT_1");

				entity.Property(e => e.StateStuNumSubmitted)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("STATE_STU_NUM_SUBMITTED")
									.IsFixedLength()
									.HasComment("Flag indicating if a request was sent to the state requesting the state number");

				entity.Property(e => e.StateStudentNumber)
									.HasMaxLength(20)
									.HasColumnName("STATE_STUDENT_NUMBER")
									.HasComment("SI: SAIS");

				entity.Property(e => e.SummerGrad)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("SUMMER_GRAD")
									.IsFixedLength();

				entity.Property(e => e.SurveyDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("SURVEY_DATE");

				entity.Property(e => e.TechPrepStatus)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("TECH_PREP_STATUS")
									.IsFixedLength();

				entity.Property(e => e.TeenParent)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("TEEN_PARENT")
									.IsFixedLength();

				entity.Property(e => e.Title3EntryDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("TITLE_3_ENTRY_DATE");

				entity.Property(e => e.TranscriptComment)
									.HasColumnType("ntext")
									.HasColumnName("TRANSCRIPT_COMMENT");

				entity.Property(e => e.UcGradReq)
									.HasMaxLength(5)
									.HasColumnName("UC_GRAD_REQ");

				entity.Property(e => e.UsEntryDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("US_ENTRY_DATE")
									.HasComment("First date student entered the US");

				entity.Property(e => e.UsEntryDateSchool)
									.HasColumnType("smalldatetime")
									.HasColumnName("US_ENTRY_DATE_SCHOOL")
									.HasComment("First date student entered a school in the US");

				entity.Property(e => e.UsEntryFromCountry)
									.HasMaxLength(5)
									.HasColumnName("US_ENTRY_FROM_COUNTRY")
									.HasComment("Country student came from when entering the US for the first time");

				entity.Property(e => e.UserCode1)
									.HasMaxLength(10)
									.HasColumnName("USER_CODE_1")
									.HasComment("User-defined code value");

				entity.Property(e => e.UserCode2)
									.HasMaxLength(10)
									.HasColumnName("USER_CODE_2")
									.HasComment("User-defined code value");

				entity.Property(e => e.UserCode3)
									.HasMaxLength(10)
									.HasColumnName("USER_CODE_3")
									.HasComment("User-defined code value");

				entity.Property(e => e.UserCode4)
									.HasMaxLength(10)
									.HasColumnName("USER_CODE_4")
									.HasComment("User-defined code value");

				entity.Property(e => e.UserCode5)
									.HasMaxLength(10)
									.HasColumnName("USER_CODE_5")
									.HasComment("User-defined code value");

				entity.Property(e => e.UserCode6)
									.HasMaxLength(10)
									.HasColumnName("USER_CODE_6")
									.HasComment("User-defined code value");

				entity.Property(e => e.UserCode7)
									.HasMaxLength(10)
									.HasColumnName("USER_CODE_7")
									.HasComment("User-defined code value");

				entity.Property(e => e.UserCode8)
									.HasMaxLength(10)
									.HasColumnName("USER_CODE_8")
									.HasComment("User-defined code value");

				entity.Property(e => e.ValDelDateTimeStamp)
									.HasColumnType("smalldatetime")
									.HasColumnName("VAL_DEL_DATE_TIME_STAMP");

				entity.Property(e => e.ValDelIdStamp).HasColumnName("VAL_DEL_ID_STAMP");

				entity.Property(e => e.VcReq)
									.HasMaxLength(5)
									.HasColumnName("VC_REQ");

				entity.Property(e => e.Wheelchair)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("WHEELCHAIR")
									.IsFixedLength();

				entity.Property(e => e.YearsInUsSch)
									.HasMaxLength(5)
									.HasColumnName("YEARS_IN_US_SCH");

				entity.HasOne(d => d.ChildInitialSchoolNavigation)
									.WithMany(p => p.Students)
									.HasForeignKey(d => d.ChildInitialSchool)
									.HasConstraintName("EPC_STU_F6");

				entity.HasOne(d => d.EnrRestrictOrganizationGuNavigation)
									.WithMany(p => p.Students)
									.HasForeignKey(d => d.EnrRestrictOrganizationGu)
									.HasConstraintName("EPC_STU_F2");

				entity.HasOne(d => d.Person)
									.WithOne(p => p.Student)
									.HasForeignKey<EpcStu>(d => d.StudentGu)
									.OnDelete(DeleteBehavior.ClientSetNull)
									.HasConstraintName("EPC_STU_F1");
			});

			modelBuilder.Entity<EpcStuSchYr>(entity =>
			{
				entity.HasKey(e => e.StudentSchoolYearGu)
									.HasName("EPC_STU_SCH_YR_P");

				entity.ToTable("EPC_STU_SCH_YR", "rev");

				entity.HasIndex(e => new { e.StudentGu, e.OrganizationYearGu }, "EPC_STU_SCH_YR_C1")
									.IsUnique();

				entity.HasIndex(e => new { e.OrganizationYearGu, e.YearGu }, "EPC_STU_SCH_YR_Cube");

				entity.HasIndex(e => new { e.OrganizationYearGu, e.StudentGu }, "EPC_STU_SCH_YR_I1");

				entity.HasIndex(e => new { e.OrganizationYearGu, e.OldSisStudentNum }, "EPC_STU_SCH_YR_I2");

				entity.HasIndex(e => e.CounselorSchoolYearGu, "EPC_STU_SCH_YR_I3");

				entity.HasIndex(e => e.YearGu, "EPC_STU_SCH_YR_I4");

				entity.HasIndex(e => e.TrackGu, "EPC_STU_SCH_YR_I5");

				entity.HasIndex(e => e.PickUpAddressGu, "EPC_STU_SCH_YR_I6");

				entity.HasIndex(e => e.DropOffAddressGu, "EPC_STU_SCH_YR_I7");

				entity.HasIndex(e => e.PickUpSchoolGu, "EPC_STU_SCH_YR_I8");

				entity.HasIndex(e => e.DropOffSchoolGu, "EPC_STU_SCH_YR_I9");

				entity.HasIndex(e => e.LastHomeroomSectionGu, "EPC_STU_SCH_YR_IA");

				entity.HasIndex(e => new { e.OrganizationYearGu, e.LeaveDate }, "EPC_STU_SCH_YR_IB");

				entity.HasIndex(e => new { e.StudentGu, e.OrganizationYearGu, e.LastHomeroomSectionGu, e.Grade }, "EPC_STU_SCH_YR_IC");

				entity.HasIndex(e => e.Grade, "EPC_STU_SCH_YR_a1");

				entity.Property(e => e.StudentSchoolYearGu)
									.ValueGeneratedNever()
									.HasColumnName("STUDENT_SCHOOL_YEAR_GU");

				entity.Property(e => e.AbsReportPolicy)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("ABS_REPORT_POLICY")
									.IsFixedLength();

				entity.Property(e => e.Access504)
									.HasMaxLength(5)
									.HasColumnName("ACCESS_504")
									.HasComment("bubble up theory");

				entity.Property(e => e.AddDateTimeStamp)
									.HasColumnType("smalldatetime")
									.HasColumnName("ADD_DATE_TIME_STAMP");

				entity.Property(e => e.AddIdStamp).HasColumnName("ADD_ID_STAMP");

				entity.Property(e => e.AdministratorSchYrGu).HasColumnName("ADMINISTRATOR_SCH_YR_GU");

				entity.Property(e => e.AllowIbuprofen)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("ALLOW_IBUPROFEN")
									.IsFixedLength();

				entity.Property(e => e.AllowMedication)
									.HasMaxLength(5)
									.HasColumnName("ALLOW_MEDICATION");

				entity.Property(e => e.AllowTylenol)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("ALLOW_TYLENOL")
									.IsFixedLength();

				entity.Property(e => e.AltEduStu)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("ALT_EDU_STU")
									.IsFixedLength();

				entity.Property(e => e.AttConfCode)
									.HasMaxLength(5)
									.HasColumnName("ATT_CONF_CODE");

				entity.Property(e => e.AttPlanCode)
									.HasMaxLength(5)
									.HasColumnName("ATT_PLAN_CODE");

				entity.Property(e => e.AttendPermitCode)
									.HasMaxLength(5)
									.HasColumnName("ATTEND_PERMIT_CODE")
									.HasComment("SASIxp Reason for Attendance code, Lookup ATP");

				entity.Property(e => e.AttendPermitDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("ATTEND_PERMIT_DATE")
									.HasComment("SASIxp Reason for Attendance date");

				entity.Property(e => e.BusEstimatedMileage)
									.HasColumnType("numeric(6, 2)")
									.HasColumnName("BUS_ESTIMATED_MILEAGE");

				entity.Property(e => e.BusRouteFromSchool)
									.HasMaxLength(20)
									.HasColumnName("BUS_ROUTE_FROM_SCHOOL")
									.HasComment("PB");

				entity.Property(e => e.BusRouteToSchool)
									.HasMaxLength(20)
									.HasColumnName("BUS_ROUTE_TO_SCHOOL")
									.HasComment("AB");

				entity.Property(e => e.CahseeElaRetake)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("CAHSEE_ELA_RETAKE")
									.IsFixedLength();

				entity.Property(e => e.CahseeMathRetake)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("CAHSEE_MATH_RETAKE")
									.IsFixedLength();

				entity.Property(e => e.CameFrom)
									.HasMaxLength(20)
									.HasColumnName("CAME_FROM");

				entity.Property(e => e.CareerAcademy1)
									.HasMaxLength(5)
									.HasColumnName("CAREER_ACADEMY_1");

				entity.Property(e => e.CareerAcademy2)
									.HasMaxLength(5)
									.HasColumnName("CAREER_ACADEMY_2");

				entity.Property(e => e.CareerAcademy3)
									.HasMaxLength(5)
									.HasColumnName("CAREER_ACADEMY_3");

				entity.Property(e => e.CbLastRequestUpdate)
									.HasColumnType("datetime")
									.HasColumnName("CB_LAST_REQUEST_UPDATE");

				entity.Property(e => e.ChangeDateTimeStamp)
									.HasColumnType("smalldatetime")
									.HasColumnName("CHANGE_DATE_TIME_STAMP");

				entity.Property(e => e.ChangeIdStamp).HasColumnName("CHANGE_ID_STAMP");

				entity.Property(e => e.CollegeEnrolled)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("COLLEGE_ENROLLED")
									.IsFixedLength();

				entity.Property(e => e.CompletionStatus)
									.HasMaxLength(5)
									.HasColumnName("COMPLETION_STATUS");

				entity.Property(e => e.ContinuousDistrict)
									.HasMaxLength(5)
									.HasColumnName("CONTINUOUS_DISTRICT");

				entity.Property(e => e.ContinuousSchool)
									.HasMaxLength(5)
									.HasColumnName("CONTINUOUS_SCHOOL");

				entity.Property(e => e.ContinuousState)
									.HasMaxLength(5)
									.HasColumnName("CONTINUOUS_STATE");

				entity.Property(e => e.CounselorSchoolYearGu)
									.HasColumnName("COUNSELOR_SCHOOL_YEAR_GU")
									.HasComment("CU");

				entity.Property(e => e.CountyResident)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("COUNTY_RESIDENT")
									.IsFixedLength();

				entity.Property(e => e.CountyResidentNew)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("COUNTY_RESIDENT_NEW")
									.IsFixedLength();

				entity.Property(e => e.CourseOfStudy)
									.HasMaxLength(5)
									.HasColumnName("COURSE_OF_STUDY");

				entity.Property(e => e.CourtReferralCode)
									.HasMaxLength(5)
									.HasColumnName("COURT_REFERRAL_CODE");

				entity.Property(e => e.CrntEnterCde)
									.HasMaxLength(5)
									.HasColumnName("CRNT_ENTER_CDE");

				entity.Property(e => e.DenyPhotoInterview)
									.HasMaxLength(5)
									.HasColumnName("DENY_PHOTO_INTERVIEW");

				entity.Property(e => e.DisasterAffectedStudent)
									.HasMaxLength(5)
									.HasColumnName("DISASTER_AFFECTED_STUDENT");

				entity.Property(e => e.DiscDetHours)
									.HasColumnType("numeric(6, 2)")
									.HasColumnName("DISC_DET_HOURS");

				entity.Property(e => e.DiscDetHoursServed)
									.HasColumnType("numeric(6, 2)")
									.HasColumnName("DISC_DET_HOURS_SERVED");

				entity.Property(e => e.DistrictOfResidence)
									.HasMaxLength(10)
									.HasColumnName("DISTRICT_OF_RESIDENCE")
									.HasComment("bubble up theory");

				entity.Property(e => e.DistrictSpedAccount)
									.HasMaxLength(7)
									.HasColumnName("DISTRICT_SPED_ACCOUNT");

				entity.Property(e => e.DropOffAddressGu)
									.HasColumnName("DROP_OFF_ADDRESS_GU")
									.HasComment("GUID for the drop off address");

				entity.Property(e => e.DropOffBusNumber)
									.HasMaxLength(20)
									.HasColumnName("DROP_OFF_BUS_NUMBER");

				entity.Property(e => e.DropOffBusStop)
									.HasMaxLength(50)
									.HasColumnName("DROP_OFF_BUS_STOP")
									.HasComment("Bus stop to be dropped off up at");

				entity.Property(e => e.DropOffComment)
									.HasColumnType("text")
									.HasColumnName("DROP_OFF_COMMENT")
									.HasComment("Notes about the drop off to school");

				entity.Property(e => e.DropOffGridCode)
									.HasMaxLength(10)
									.IsUnicode(false)
									.HasColumnName("DROP_OFF_GRID_CODE")
									.IsFixedLength();

				entity.Property(e => e.DropOffLocationType)
									.HasMaxLength(5)
									.HasColumnName("DROP_OFF_LOCATION_TYPE")
									.HasComment("Type of location of the drop off");

				entity.Property(e => e.DropOffRespPerson)
									.HasMaxLength(100)
									.HasColumnName("DROP_OFF_RESP_PERSON");

				entity.Property(e => e.DropOffRespPhone)
									.HasMaxLength(10)
									.HasColumnName("DROP_OFF_RESP_PHONE");

				entity.Property(e => e.DropOffSchoolGu).HasColumnName("DROP_OFF_SCHOOL_GU");

				entity.Property(e => e.DropOffTransReasCode)
									.HasMaxLength(5)
									.HasColumnName("DROP_OFF_TRANS_REAS_CODE");

				entity.Property(e => e.DropOffTransReasDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("DROP_OFF_TRANS_REAS_DATE");

				entity.Property(e => e.DropOffTransportTime)
									.HasColumnType("smalldatetime")
									.HasColumnName("DROP_OFF_TRANSPORT_TIME")
									.HasComment("Time of drop off");

				entity.Property(e => e.DropOffTransportType)
									.HasMaxLength(5)
									.HasColumnName("DROP_OFF_TRANSPORT_TYPE")
									.HasComment("Type of transport used for drop off to school");

				entity.Property(e => e.DropOffVehicleCat)
									.HasMaxLength(5)
									.HasColumnName("DROP_OFF_VEHICLE_CAT");

				entity.Property(e => e.DrpParticipant)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("DRP_PARTICIPANT")
									.IsFixedLength();

				entity.Property(e => e.EducationalChoice)
									.HasMaxLength(5)
									.HasColumnName("EDUCATIONAL_CHOICE");

				entity.Property(e => e.ElCaseMgrAssnDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("EL_CASE_MGR_ASSN_DATE");

				entity.Property(e => e.ElCaseMgrGu).HasColumnName("EL_CASE_MGR_GU");

				entity.Property(e => e.EmployedWhileEnrolled)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("EMPLOYED_WHILE_ENROLLED")
									.IsFixedLength();

				entity.Property(e => e.EnrPathway)
									.HasMaxLength(5)
									.HasColumnName("ENR_PATHWAY");

				entity.Property(e => e.EnrUser1)
									.HasMaxLength(50)
									.HasColumnName("ENR_USER_1");

				entity.Property(e => e.EnrUser2)
									.HasMaxLength(50)
									.HasColumnName("ENR_USER_2");

				entity.Property(e => e.EnrUser3)
									.HasMaxLength(50)
									.HasColumnName("ENR_USER_3");

				entity.Property(e => e.EnrUserCheck1)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("ENR_USER_CHECK_1")
									.IsFixedLength()
									.HasComment("Added for state specific uses.  Must bubble-up.");

				entity.Property(e => e.EnrUserCheck2)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("ENR_USER_CHECK_2")
									.IsFixedLength()
									.HasComment("Added for state specific uses.  Must bubble-up.");

				entity.Property(e => e.EnrUserCheck3)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("ENR_USER_CHECK_3")
									.IsFixedLength()
									.HasComment("Added for state specific uses.  Must bubble-up.");

				entity.Property(e => e.EnrUserDd1)
									.HasMaxLength(10)
									.HasColumnName("ENR_USER_DD_1");

				entity.Property(e => e.EnrUserDd2)
									.HasMaxLength(10)
									.HasColumnName("ENR_USER_DD_2");

				entity.Property(e => e.EnrUserDd3)
									.HasMaxLength(10)
									.HasColumnName("ENR_USER_DD_3");

				entity.Property(e => e.EnrUserDd4)
									.HasMaxLength(5)
									.HasColumnName("ENR_USER_DD_4");

				entity.Property(e => e.EnrUserDd5)
									.HasMaxLength(5)
									.HasColumnName("ENR_USER_DD_5");

				entity.Property(e => e.EnrUserDd6)
									.HasMaxLength(5)
									.HasColumnName("ENR_USER_DD_6");

				entity.Property(e => e.EnrUserNum1)
									.HasColumnType("numeric(8, 3)")
									.HasColumnName("ENR_USER_NUM_1")
									.HasComment("Added for state specific uses.  Must bubble-up.");

				entity.Property(e => e.EnrUserNum2)
									.HasColumnType("numeric(8, 3)")
									.HasColumnName("ENR_USER_NUM_2")
									.HasComment("Added for state specific uses.  Must bubble-up.");

				entity.Property(e => e.EnrUserNum3)
									.HasColumnType("numeric(8, 3)")
									.HasColumnName("ENR_USER_NUM_3")
									.HasComment("Added for state specific uses.  Must bubble-up.");

				entity.Property(e => e.EnrUserNum4)
									.HasColumnType("numeric(8, 3)")
									.HasColumnName("ENR_USER_NUM_4")
									.HasComment("Added for state specific uses.  Must bubble-up.");

				entity.Property(e => e.EnrUserNum5)
									.HasColumnType("numeric(8, 3)")
									.HasColumnName("ENR_USER_NUM_5")
									.HasComment("Added for state specific uses.  Must bubble-up.");

				entity.Property(e => e.EnterCode)
									.HasMaxLength(5)
									.HasColumnName("ENTER_CODE")
									.HasComment("Uses bubble up theory");

				entity.Property(e => e.EnterDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("ENTER_DATE")
									.HasComment("Uses bubble up theory");

				entity.Property(e => e.EnteredByUser)
									.HasMaxLength(100)
									.HasColumnName("ENTERED_BY_USER");

				entity.Property(e => e.ExcFrmAutoCalcFte)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("EXC_FRM_AUTO_CALC_FTE")
									.IsFixedLength();

				entity.Property(e => e.ExcludeAdaAdm)
									.HasMaxLength(5)
									.HasColumnName("EXCLUDE_ADA_ADM");

				entity.Property(e => e.ExpCode)
									.HasMaxLength(5)
									.HasColumnName("EXP_CODE");

				entity.Property(e => e.ExpTimeCode)
									.HasMaxLength(5)
									.HasColumnName("EXP_TIME_CODE");

				entity.Property(e => e.ExtendLearningProgram)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("EXTEND_LEARNING_PROGRAM")
									.IsFixedLength()
									.HasComment("Will eventually reside in Needs - for now here so we can populate back to SASI3: EL");

				entity.Property(e => e.ForbidAutoDial)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("FORBID_AUTO_DIAL")
									.IsFixedLength()
									.HasComment("ASTU.AUTO_DIAL");

				entity.Property(e => e.FosterHome)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("FOSTER_HOME")
									.IsFixedLength();

				entity.Property(e => e.Fte)
									.HasMaxLength(5)
									.HasColumnName("FTE")
									.HasComment("bubble up theory");

				entity.Property(e => e.FullTimeVirtual)
									.HasMaxLength(5)
									.HasColumnName("FULL_TIME_VIRTUAL");

				entity.Property(e => e.Grade)
									.HasMaxLength(5)
									.HasColumnName("GRADE")
									.HasComment("Uses bubble up theory");

				entity.Property(e => e.GradeExitCode)
									.HasMaxLength(5)
									.HasColumnName("GRADE_EXIT_CODE");

				entity.Property(e => e.GrdPromoStat)
									.HasMaxLength(5)
									.HasColumnName("GRD_PROMO_STAT");

				entity.Property(e => e.GrdPromoStatExempt)
									.HasMaxLength(5)
									.HasColumnName("GRD_PROMO_STAT_EXEMPT");

				entity.Property(e => e.HasChangedFlag)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("HAS_CHANGED_FLAG")
									.IsFixedLength()
									.HasComment("This is set to Y when something relevant has changed that will cause a form print (whatever we determine \"form\" means)");

				entity.Property(e => e.HazardousWalkingCode)
									.HasMaxLength(5)
									.HasColumnName("HAZARDOUS_WALKING_CODE");

				entity.Property(e => e.HomeSchooled)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("HOME_SCHOOLED")
									.IsFixedLength();

				entity.Property(e => e.Homebound)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("HOMEBOUND")
									.IsFixedLength()
									.HasComment("bubble up theory");

				entity.Property(e => e.HomeroomSectionGu).HasColumnName("HOMEROOM_SECTION_GU");

				entity.Property(e => e.HybridPattern)
									.HasMaxLength(10)
									.HasColumnName("HYBRID_PATTERN");

				entity.Property(e => e.Immigrant)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("IMMIGRANT")
									.IsFixedLength();

				entity.Property(e => e.InPersonPercentTime)
									.HasColumnType("numeric(8, 3)")
									.HasColumnName("IN_PERSON_PERCENT_TIME");

				entity.Property(e => e.InactivateComment).HasColumnName("INACTIVATE_COMMENT");

				entity.Property(e => e.InitNinthGradeYear)
									.HasColumnType("numeric(4, 0)")
									.HasColumnName("INIT_NINTH_GRADE_YEAR");

				entity.Property(e => e.InstructionalSetting)
									.HasMaxLength(5)
									.HasColumnName("INSTRUCTIONAL_SETTING")
									.HasComment("Uses bubble up theory");

				entity.Property(e => e.IntnsvSuppSvcBgn)
									.HasMaxLength(5)
									.HasColumnName("INTNSV_SUPP_SVC_BGN");

				entity.Property(e => e.IntnsvSuppSvcSem1)
									.HasMaxLength(5)
									.HasColumnName("INTNSV_SUPP_SVC_SEM1");

				entity.Property(e => e.IntnsvSuppSvcSem2)
									.HasMaxLength(5)
									.HasColumnName("INTNSV_SUPP_SVC_SEM2");

				entity.Property(e => e.IntnsvSuppSvcSum)
									.HasMaxLength(5)
									.HasColumnName("INTNSV_SUPP_SVC_SUM");

				entity.Property(e => e.Ivep)
									.HasMaxLength(5)
									.HasColumnName("IVEP")
									.HasComment("IV: go away when CTE module implemented");

				entity.Property(e => e.LastActivityDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("LAST_ACTIVITY_DATE")
									.HasComment("Uses bubble up theory, is the last activity date.  Any new activity must be greater than or equal to this date.");

				entity.Property(e => e.LastCovidContactDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("LAST_COVID_CONTACT_DATE");

				entity.Property(e => e.LastHomeroomSectionGu).HasColumnName("LAST_HOMEROOM_SECTION_GU");

				entity.Property(e => e.LastSchoolGu).HasColumnName("LAST_SCHOOL_GU");

				entity.Property(e => e.LeaveCode)
									.HasMaxLength(5)
									.HasColumnName("LEAVE_CODE")
									.HasComment("Uses bubble up theory");

				entity.Property(e => e.LeaveDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("LEAVE_DATE")
									.HasComment("Last day of enrollment - Uses bubble up theory");

				entity.Property(e => e.LeaveUnattended)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("LEAVE_UNATTENDED")
									.IsFixedLength();

				entity.Property(e => e.LockerNumber)
									.HasMaxLength(10)
									.HasColumnName("LOCKER_NUMBER")
									.HasComment("LK");

				entity.Property(e => e.ManualFteOverride)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("MANUAL_FTE_OVERRIDE")
									.IsFixedLength();

				entity.Property(e => e.MilitaryCompactStatute)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("MILITARY_COMPACT_STATUTE")
									.IsFixedLength();

				entity.Property(e => e.MilitaryConnection)
									.HasMaxLength(5)
									.HasColumnName("MILITARY_CONNECTION");

				entity.Property(e => e.MovedTo)
									.HasMaxLength(20)
									.HasColumnName("MOVED_TO");

				entity.Property(e => e.NextAttendPermitCode)
									.HasMaxLength(5)
									.HasColumnName("NEXT_ATTEND_PERMIT_CODE");

				entity.Property(e => e.NextAttendPermitDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("NEXT_ATTEND_PERMIT_DATE");

				entity.Property(e => e.NextConcurrentSchoolGu).HasColumnName("NEXT_CONCURRENT_SCHOOL_GU");

				entity.Property(e => e.NextEnrPathway)
									.HasMaxLength(5)
									.HasColumnName("NEXT_ENR_PATHWAY");

				entity.Property(e => e.NextGradeLevel)
									.HasMaxLength(5)
									.HasColumnName("NEXT_GRADE_LEVEL")
									.HasComment("NG");

				entity.Property(e => e.NextSchAttend)
									.HasMaxLength(100)
									.HasColumnName("NEXT_SCH_ATTEND");

				entity.Property(e => e.NextSchoolGu)
									.HasColumnName("NEXT_SCHOOL_GU")
									.HasComment("NS");

				entity.Property(e => e.NextTrackGu)
									.HasColumnName("NEXT_TRACK_GU")
									.HasComment("ASTU.NEXT_TRK Only visible for schools with more than 1 track.");

				entity.Property(e => e.NighttimeResidence)
									.HasMaxLength(5)
									.HasColumnName("NIGHTTIME_RESIDENCE");

				entity.Property(e => e.NoShowComment).HasColumnName("NO_SHOW_COMMENT");

				entity.Property(e => e.NoShowDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("NO_SHOW_DATE");

				entity.Property(e => e.NoShowReceiverDistrict)
									.HasMaxLength(10)
									.HasColumnName("NO_SHOW_RECEIVER_DISTRICT");

				entity.Property(e => e.NoShowReceiverSchool)
									.HasMaxLength(20)
									.HasColumnName("NO_SHOW_RECEIVER_SCHOOL");

				entity.Property(e => e.NoShowStudent)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("NO_SHOW_STUDENT")
									.IsFixedLength();

				entity.Property(e => e.NonResident)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("NON_RESIDENT")
									.IsFixedLength();

				entity.Property(e => e.NyrExclude)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("NYR_EXCLUDE")
									.IsFixedLength();

				entity.Property(e => e.OldSisStudentNum)
									.HasMaxLength(10)
									.HasColumnName("OLD_SIS_STUDENT_NUM")
									.HasComment("SN");

				entity.Property(e => e.OptOutMedicalFed)
									.HasMaxLength(5)
									.HasColumnName("OPT_OUT_MEDICAL_FED");

				entity.Property(e => e.OptOutMedicalState)
									.HasMaxLength(5)
									.HasColumnName("OPT_OUT_MEDICAL_STATE");

				entity.Property(e => e.OrganizationYearGu).HasColumnName("ORGANIZATION_YEAR_GU");

				entity.Property(e => e.OverrideContAndFunding)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("OVERRIDE_CONT_AND_FUNDING")
									.IsFixedLength();

				entity.Property(e => e.OverrideForceSts)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("OVERRIDE_FORCE_STS")
									.IsFixedLength();

				entity.Property(e => e.PickUpAddressGu)
									.HasColumnName("PICK_UP_ADDRESS_GU")
									.HasComment("GUID for the pickup address");

				entity.Property(e => e.PickUpBusNumber)
									.HasMaxLength(20)
									.HasColumnName("PICK_UP_BUS_NUMBER");

				entity.Property(e => e.PickUpBusStop)
									.HasMaxLength(50)
									.HasColumnName("PICK_UP_BUS_STOP")
									.HasComment("Bus stop to be picked up at");

				entity.Property(e => e.PickUpComment)
									.HasColumnType("text")
									.HasColumnName("PICK_UP_COMMENT")
									.HasComment("Notes about the pickup from school");

				entity.Property(e => e.PickUpGridCode)
									.HasMaxLength(10)
									.IsUnicode(false)
									.HasColumnName("PICK_UP_GRID_CODE")
									.IsFixedLength();

				entity.Property(e => e.PickUpLocationType)
									.HasMaxLength(5)
									.HasColumnName("PICK_UP_LOCATION_TYPE")
									.HasComment("Type of location of the pickup");

				entity.Property(e => e.PickUpRespPerson)
									.HasMaxLength(100)
									.HasColumnName("PICK_UP_RESP_PERSON");

				entity.Property(e => e.PickUpRespPhone)
									.HasMaxLength(10)
									.HasColumnName("PICK_UP_RESP_PHONE");

				entity.Property(e => e.PickUpSchoolGu).HasColumnName("PICK_UP_SCHOOL_GU");

				entity.Property(e => e.PickUpTransReasCode)
									.HasMaxLength(5)
									.HasColumnName("PICK_UP_TRANS_REAS_CODE");

				entity.Property(e => e.PickUpTransReasDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("PICK_UP_TRANS_REAS_DATE");

				entity.Property(e => e.PickUpTransportTime)
									.HasColumnType("smalldatetime")
									.HasColumnName("PICK_UP_TRANSPORT_TIME")
									.HasComment("Time of pickup");

				entity.Property(e => e.PickUpTransportType)
									.HasMaxLength(5)
									.HasColumnName("PICK_UP_TRANSPORT_TYPE")
									.HasComment("Type of transport used for pickup from school");

				entity.Property(e => e.PickUpVehicleCat)
									.HasMaxLength(5)
									.HasColumnName("PICK_UP_VEHICLE_CAT");

				entity.Property(e => e.PkFundingSource)
									.HasMaxLength(5)
									.HasColumnName("PK_FUNDING_SOURCE");

				entity.Property(e => e.PrevInGrade)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("PREV_IN_GRADE")
									.IsFixedLength();

				entity.Property(e => e.PreviousLocationType)
									.HasMaxLength(5)
									.HasColumnName("PREVIOUS_LOCATION_TYPE");

				entity.Property(e => e.PreviousYearEndStatus)
									.HasMaxLength(5)
									.HasColumnName("PREVIOUS_YEAR_END_STATUS");

				entity.Property(e => e.PriorSchoolCountry)
									.HasMaxLength(5)
									.HasColumnName("PRIOR_SCHOOL_COUNTRY");

				entity.Property(e => e.PriorSchoolDistrict)
									.HasMaxLength(5)
									.HasColumnName("PRIOR_SCHOOL_DISTRICT");

				entity.Property(e => e.PriorSchoolState)
									.HasMaxLength(5)
									.HasColumnName("PRIOR_SCHOOL_STATE");

				entity.Property(e => e.ProgramCode)
									.HasMaxLength(5)
									.HasColumnName("PROGRAM_CODE")
									.HasComment("bubble up theory");

				entity.Property(e => e.PrvWithdrawalCde)
									.HasMaxLength(5)
									.HasColumnName("PRV_WITHDRAWAL_CDE");

				entity.Property(e => e.PupilAttInfo)
									.HasMaxLength(5)
									.HasColumnName("PUPIL_ATT_INFO");

				entity.Property(e => e.PxpOcrLockedIn)
									.IsRequired()
									.HasMaxLength(5)
									.HasColumnName("PXP_OCR_LOCKED_IN");

				entity.Property(e => e.PxpOcrLockedInDt)
									.HasColumnType("smalldatetime")
									.HasColumnName("PXP_OCR_LOCKED_IN_DT");

				entity.Property(e => e.PxpOcrValidated)
									.IsRequired()
									.HasMaxLength(5)
									.HasColumnName("PXP_OCR_VALIDATED");

				entity.Property(e => e.PxpOcrValidatedDt)
									.HasColumnType("smalldatetime")
									.HasColumnName("PXP_OCR_VALIDATED_DT");

				entity.Property(e => e.ReceiverDistrict)
									.HasMaxLength(10)
									.HasColumnName("RECEIVER_DISTRICT");

				entity.Property(e => e.ReceiverSchool)
									.HasMaxLength(20)
									.HasColumnName("RECEIVER_SCHOOL");

				entity.Property(e => e.Refugee)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("REFUGEE")
									.IsFixedLength();

				entity.Property(e => e.RegistrationReceived)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("REGISTRATION_RECEIVED")
									.IsFixedLength();

				entity.Property(e => e.RegistrationUpdated)
									.HasColumnType("smalldatetime")
									.HasColumnName("REGISTRATION_UPDATED");

				entity.Property(e => e.RemotePercentTime)
									.HasColumnType("numeric(8, 3)")
									.HasColumnName("REMOTE_PERCENT_TIME");

				entity.Property(e => e.ReportedToStateLeave)
									.HasColumnType("smalldatetime")
									.HasColumnName("REPORTED_TO_STATE_LEAVE");

				entity.Property(e => e.ReportedToStateNoshow)
									.HasColumnType("smalldatetime")
									.HasColumnName("REPORTED_TO_STATE_NOSHOW");

				entity.Property(e => e.ReportingSchool)
									.HasMaxLength(5)
									.HasColumnName("REPORTING_SCHOOL");

				entity.Property(e => e.ResWaiverDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("RES_WAIVER_DATE");

				entity.Property(e => e.ResWaiverReason)
									.HasMaxLength(5)
									.HasColumnName("RES_WAIVER_REASON");

				entity.Property(e => e.ResidentDistrict)
									.HasMaxLength(5)
									.HasColumnName("RESIDENT_DISTRICT");

				entity.Property(e => e.ResidentStatus)
									.HasMaxLength(5)
									.HasColumnName("RESIDENT_STATUS");

				entity.Property(e => e.ResidentTown)
									.HasMaxLength(5)
									.HasColumnName("RESIDENT_TOWN");

				entity.Property(e => e.ResponDistrict)
									.HasMaxLength(5)
									.HasColumnName("RESPON_DISTRICT");

				entity.Property(e => e.ResponSchool)
									.HasMaxLength(5)
									.HasColumnName("RESPON_SCHOOL");

				entity.Property(e => e.SchComplCode)
									.HasMaxLength(5)
									.HasColumnName("SCH_COMPL_CODE");

				entity.Property(e => e.SchDismissTime)
									.HasColumnType("smalldatetime")
									.HasColumnName("SCH_DISMISS_TIME");

				entity.Property(e => e.SchStartTime)
									.HasColumnType("smalldatetime")
									.HasColumnName("SCH_START_TIME");

				entity.Property(e => e.SchdStatus)
									.HasMaxLength(5)
									.HasColumnName("SCHD_STATUS");

				entity.Property(e => e.SchedBalance)
									.HasMaxLength(10)
									.HasColumnName("SCHED_BALANCE")
									.HasComment("Value to influence the balancing of scheduling classes");

				entity.Property(e => e.SchedExemptHouse)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("SCHED_EXEMPT_HOUSE")
									.IsFixedLength()
									.HasComment("Do not require student to have the same house for all house marked sections");

				entity.Property(e => e.SchedExemptTeam)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("SCHED_EXEMPT_TEAM")
									.IsFixedLength()
									.HasComment("Do not require student to have the same team for all team marked sections");

				entity.Property(e => e.SchedHighPeriod)
									.HasColumnType("numeric(3, 0)")
									.HasColumnName("SCHED_HIGH_PERIOD")
									.HasComment("scheduling high period limit for this student (no classes to be scheduled above this period number)");

				entity.Property(e => e.SchedHouse)
									.HasMaxLength(10)
									.HasColumnName("SCHED_HOUSE")
									.HasComment("Scheduling house K12.MassScheduling.HOUSE");

				entity.Property(e => e.SchedLowPeriod)
									.HasColumnType("numeric(3, 0)")
									.HasColumnName("SCHED_LOW_PERIOD")
									.HasComment("scheduling low period limit for this student (no classes to be scheduled below this period number)");

				entity.Property(e => e.SchedPathwayHouse)
									.HasMaxLength(10)
									.HasColumnName("SCHED_PATHWAY_HOUSE");

				entity.Property(e => e.SchedPathwayTeam)
									.HasMaxLength(10)
									.HasColumnName("SCHED_PATHWAY_TEAM");

				entity.Property(e => e.SchedStamp)
									.HasColumnType("datetime")
									.HasColumnName("SCHED_STAMP")
									.HasComment("Last date/time the student course request(s) was changed  upon updating this stamp, also update stamp in school year opt");

				entity.Property(e => e.SchedTeam)
									.HasMaxLength(10)
									.HasColumnName("SCHED_TEAM")
									.HasComment("Scheduling Team K12.MassScheduling.TEAM");

				entity.Property(e => e.SchedWeight)
									.HasColumnType("numeric(4, 2)")
									.HasColumnName("SCHED_WEIGHT");

				entity.Property(e => e.SchoolChoiceStatus)
									.HasMaxLength(5)
									.HasColumnName("SCHOOL_CHOICE_STATUS");

				entity.Property(e => e.SchoolResidenceGu)
									.HasColumnName("SCHOOL_RESIDENCE_GU")
									.HasComment("ASTU.SCHL_RESIDENCE");

				entity.Property(e => e.ServDistrict)
									.HasMaxLength(5)
									.HasColumnName("SERV_DISTRICT");

				entity.Property(e => e.ServSchool)
									.HasMaxLength(5)
									.HasColumnName("SERV_SCHOOL");

				entity.Property(e => e.SmrWithdrawalReasonCode)
									.HasMaxLength(5)
									.HasColumnName("SMR_WITHDRAWAL_REASON_CODE");

				entity.Property(e => e.SpclPrgmTchSchYrGu).HasColumnName("SPCL_PRGM_TCH_SCH_YR_GU");

				entity.Property(e => e.SpecEdSchOfAtt)
									.HasMaxLength(5)
									.HasColumnName("SPEC_ED_SCH_OF_ATT");

				entity.Property(e => e.SpecTransReqComment)
									.HasColumnType("text")
									.HasColumnName("SPEC_TRANS_REQ_COMMENT")
									.HasComment("Description of the reasons for special transportation");

				entity.Property(e => e.SpecialEnrollmentCode)
									.HasMaxLength(5)
									.HasColumnName("SPECIAL_ENROLLMENT_CODE")
									.HasComment("bubble up theory");

				entity.Property(e => e.SpecialProgramCode)
									.HasMaxLength(5)
									.HasColumnName("SPECIAL_PROGRAM_CODE")
									.HasComment("bubble up theory");

				entity.Property(e => e.Sped1stSemReimbrsmnt)
									.HasColumnType("numeric(9, 2)")
									.HasColumnName("SPED_1ST_SEM_REIMBRSMNT");

				entity.Property(e => e.Sped2ndSemReimbrsmnt)
									.HasColumnType("numeric(9, 2)")
									.HasColumnName("SPED_2ND_SEM_REIMBRSMNT");

				entity.Property(e => e.SpedReimbrsmntDsbltCd)
									.HasMaxLength(5)
									.HasColumnName("SPED_REIMBRSMNT_DSBLT_CD");

				entity.Property(e => e.SpedSumSemReimbrsmnt)
									.HasColumnType("numeric(9, 2)")
									.HasColumnName("SPED_SUM_SEM_REIMBRSMNT");

				entity.Property(e => e.SrEnrText1)
									.HasMaxLength(50)
									.HasColumnName("SR_ENR_TEXT_1");

				entity.Property(e => e.SrEnrText10)
									.HasMaxLength(50)
									.HasColumnName("SR_ENR_TEXT_10");

				entity.Property(e => e.SrEnrText2)
									.HasMaxLength(50)
									.HasColumnName("SR_ENR_TEXT_2");

				entity.Property(e => e.SrEnrText3)
									.HasMaxLength(50)
									.HasColumnName("SR_ENR_TEXT_3");

				entity.Property(e => e.SrEnrText4)
									.HasMaxLength(50)
									.HasColumnName("SR_ENR_TEXT_4");

				entity.Property(e => e.SrEnrText5)
									.HasMaxLength(50)
									.HasColumnName("SR_ENR_TEXT_5");

				entity.Property(e => e.SrEnrText6)
									.HasMaxLength(50)
									.HasColumnName("SR_ENR_TEXT_6");

				entity.Property(e => e.SrEnrText7)
									.HasMaxLength(50)
									.HasColumnName("SR_ENR_TEXT_7");

				entity.Property(e => e.SrEnrText8)
									.HasMaxLength(50)
									.HasColumnName("SR_ENR_TEXT_8");

				entity.Property(e => e.SrEnrText9)
									.HasMaxLength(50)
									.HasColumnName("SR_ENR_TEXT_9");

				entity.Property(e => e.SrEnrUserCheck01)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("SR_ENR_USER_CHECK_01")
									.IsFixedLength();

				entity.Property(e => e.SrEnrUserCheck02)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("SR_ENR_USER_CHECK_02")
									.IsFixedLength();

				entity.Property(e => e.SrEnrUserCheck03)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("SR_ENR_USER_CHECK_03")
									.IsFixedLength();

				entity.Property(e => e.SrEnrUserCheck04)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("SR_ENR_USER_CHECK_04")
									.IsFixedLength();

				entity.Property(e => e.SrEnrUserCheck05)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("SR_ENR_USER_CHECK_05")
									.IsFixedLength();

				entity.Property(e => e.SrEnrUserCheck06)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("SR_ENR_USER_CHECK_06")
									.IsFixedLength();

				entity.Property(e => e.SrEnrUserCheck07)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("SR_ENR_USER_CHECK_07")
									.IsFixedLength();

				entity.Property(e => e.SrEnrUserCheck08)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("SR_ENR_USER_CHECK_08")
									.IsFixedLength();

				entity.Property(e => e.SrEnrUserCheck09)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("SR_ENR_USER_CHECK_09")
									.IsFixedLength();

				entity.Property(e => e.SrEnrUserCheck10)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("SR_ENR_USER_CHECK_10")
									.IsFixedLength();

				entity.Property(e => e.SrEnrUserCheck11)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("SR_ENR_USER_CHECK_11")
									.IsFixedLength();

				entity.Property(e => e.SrEnrUserCheck12)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("SR_ENR_USER_CHECK_12")
									.IsFixedLength();

				entity.Property(e => e.SrEnrUserCheck13)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("SR_ENR_USER_CHECK_13")
									.IsFixedLength();

				entity.Property(e => e.SrEnrUserCheck14)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("SR_ENR_USER_CHECK_14")
									.IsFixedLength();

				entity.Property(e => e.SrEnrUserCheck15)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("SR_ENR_USER_CHECK_15")
									.IsFixedLength();

				entity.Property(e => e.SrEnrUserDate01)
									.HasColumnType("smalldatetime")
									.HasColumnName("SR_ENR_USER_DATE_01");

				entity.Property(e => e.SrEnrUserDate02)
									.HasColumnType("smalldatetime")
									.HasColumnName("SR_ENR_USER_DATE_02");

				entity.Property(e => e.SrEnrUserDate03)
									.HasColumnType("smalldatetime")
									.HasColumnName("SR_ENR_USER_DATE_03");

				entity.Property(e => e.SrEnrUserDate04)
									.HasColumnType("smalldatetime")
									.HasColumnName("SR_ENR_USER_DATE_04");

				entity.Property(e => e.SrEnrUserDate05)
									.HasColumnType("smalldatetime")
									.HasColumnName("SR_ENR_USER_DATE_05");

				entity.Property(e => e.SrEnrUserDd01)
									.HasMaxLength(5)
									.HasColumnName("SR_ENR_USER_DD_01");

				entity.Property(e => e.SrEnrUserDd02)
									.HasMaxLength(5)
									.HasColumnName("SR_ENR_USER_DD_02");

				entity.Property(e => e.SrEnrUserDd03)
									.HasMaxLength(5)
									.HasColumnName("SR_ENR_USER_DD_03");

				entity.Property(e => e.SrEnrUserDd04)
									.HasMaxLength(5)
									.HasColumnName("SR_ENR_USER_DD_04");

				entity.Property(e => e.SrEnrUserDd05)
									.HasMaxLength(5)
									.HasColumnName("SR_ENR_USER_DD_05");

				entity.Property(e => e.SrEnrUserDd06)
									.HasMaxLength(5)
									.HasColumnName("SR_ENR_USER_DD_06");

				entity.Property(e => e.SrEnrUserDd07)
									.HasMaxLength(5)
									.HasColumnName("SR_ENR_USER_DD_07");

				entity.Property(e => e.SrEnrUserDd08)
									.HasMaxLength(5)
									.HasColumnName("SR_ENR_USER_DD_08");

				entity.Property(e => e.SrEnrUserDd09)
									.HasMaxLength(5)
									.HasColumnName("SR_ENR_USER_DD_09");

				entity.Property(e => e.SrEnrUserDd10)
									.HasMaxLength(5)
									.HasColumnName("SR_ENR_USER_DD_10");

				entity.Property(e => e.SrEnrUserDd11)
									.HasMaxLength(5)
									.HasColumnName("SR_ENR_USER_DD_11");

				entity.Property(e => e.SrEnrUserDd12)
									.HasMaxLength(5)
									.HasColumnName("SR_ENR_USER_DD_12");

				entity.Property(e => e.SrEnrUserDd13)
									.HasMaxLength(5)
									.HasColumnName("SR_ENR_USER_DD_13");

				entity.Property(e => e.SrEnrUserDd14)
									.HasMaxLength(5)
									.HasColumnName("SR_ENR_USER_DD_14");

				entity.Property(e => e.SrEnrUserDd15)
									.HasMaxLength(5)
									.HasColumnName("SR_ENR_USER_DD_15");

				entity.Property(e => e.SrEnrUserDd16)
									.HasMaxLength(5)
									.HasColumnName("SR_ENR_USER_DD_16");

				entity.Property(e => e.SrEnrUserDd17)
									.HasMaxLength(5)
									.HasColumnName("SR_ENR_USER_DD_17");

				entity.Property(e => e.SrEnrUserDd18)
									.HasMaxLength(5)
									.HasColumnName("SR_ENR_USER_DD_18");

				entity.Property(e => e.SrEnrUserDd19)
									.HasMaxLength(5)
									.HasColumnName("SR_ENR_USER_DD_19");

				entity.Property(e => e.SrEnrUserDd20)
									.HasMaxLength(5)
									.HasColumnName("SR_ENR_USER_DD_20");

				entity.Property(e => e.SrEnrUserDd23)
									.HasMaxLength(5)
									.HasColumnName("SR_ENR_USER_DD_23");

				entity.Property(e => e.SrEnrUserDd24)
									.HasMaxLength(5)
									.HasColumnName("SR_ENR_USER_DD_24");

				entity.Property(e => e.SrEnrUserNum01)
									.HasColumnType("numeric(8, 3)")
									.HasColumnName("SR_ENR_USER_NUM_01");

				entity.Property(e => e.SrEnrUserNum02)
									.HasColumnType("numeric(8, 3)")
									.HasColumnName("SR_ENR_USER_NUM_02");

				entity.Property(e => e.SrEnrUserNum03)
									.HasColumnType("numeric(8, 3)")
									.HasColumnName("SR_ENR_USER_NUM_03");

				entity.Property(e => e.SrEnrUserNum04)
									.HasColumnType("numeric(8, 3)")
									.HasColumnName("SR_ENR_USER_NUM_04");

				entity.Property(e => e.SrEnrUserNum05)
									.HasColumnType("numeric(8, 3)")
									.HasColumnName("SR_ENR_USER_NUM_05");

				entity.Property(e => e.SrUserCheck01)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("SR_USER_CHECK_01")
									.IsFixedLength();

				entity.Property(e => e.SrUserCheck02)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("SR_USER_CHECK_02")
									.IsFixedLength();

				entity.Property(e => e.SrUserCheck03)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("SR_USER_CHECK_03")
									.IsFixedLength();

				entity.Property(e => e.SrUserCheck04)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("SR_USER_CHECK_04")
									.IsFixedLength();

				entity.Property(e => e.SrUserCheck05)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("SR_USER_CHECK_05")
									.IsFixedLength();

				entity.Property(e => e.SrUserCodeDd01)
									.HasMaxLength(5)
									.HasColumnName("SR_USER_CODE_DD_01");

				entity.Property(e => e.SrUserCodeDd02)
									.HasMaxLength(5)
									.HasColumnName("SR_USER_CODE_DD_02");

				entity.Property(e => e.SrUserCodeDd03)
									.HasMaxLength(5)
									.HasColumnName("SR_USER_CODE_DD_03");

				entity.Property(e => e.SrUserCodeDd04)
									.HasMaxLength(5)
									.HasColumnName("SR_USER_CODE_DD_04");

				entity.Property(e => e.SrUserCodeDd05)
									.HasMaxLength(5)
									.HasColumnName("SR_USER_CODE_DD_05");

				entity.Property(e => e.SrUserCodeDd06)
									.HasMaxLength(5)
									.HasColumnName("SR_USER_CODE_DD_06");

				entity.Property(e => e.SrUserCodeDd07)
									.HasMaxLength(5)
									.HasColumnName("SR_USER_CODE_DD_07");

				entity.Property(e => e.SrUserCodeDd08)
									.HasMaxLength(5)
									.HasColumnName("SR_USER_CODE_DD_08");

				entity.Property(e => e.SrUserCodeDd09)
									.HasMaxLength(5)
									.HasColumnName("SR_USER_CODE_DD_09");

				entity.Property(e => e.SrUserCodeDd10)
									.HasMaxLength(5)
									.HasColumnName("SR_USER_CODE_DD_10");

				entity.Property(e => e.SrUserCodeDd11)
									.HasMaxLength(5)
									.HasColumnName("SR_USER_CODE_DD_11");

				entity.Property(e => e.SrUserCodeDd12)
									.HasMaxLength(5)
									.HasColumnName("SR_USER_CODE_DD_12");

				entity.Property(e => e.SrUserCodeDd13)
									.HasMaxLength(5)
									.HasColumnName("SR_USER_CODE_DD_13");

				entity.Property(e => e.SrUserCodeDd14)
									.HasMaxLength(5)
									.HasColumnName("SR_USER_CODE_DD_14");

				entity.Property(e => e.SrUserCodeDd15)
									.HasMaxLength(5)
									.HasColumnName("SR_USER_CODE_DD_15");

				entity.Property(e => e.SrUserCodeDd16)
									.HasMaxLength(5)
									.HasColumnName("SR_USER_CODE_DD_16");

				entity.Property(e => e.SrUserCodeDd17)
									.HasMaxLength(5)
									.HasColumnName("SR_USER_CODE_DD_17");

				entity.Property(e => e.SrUserCodeDd18)
									.HasMaxLength(5)
									.HasColumnName("SR_USER_CODE_DD_18");

				entity.Property(e => e.SrUserCodeDd19)
									.HasMaxLength(5)
									.HasColumnName("SR_USER_CODE_DD_19");

				entity.Property(e => e.SrUserCodeDd20)
									.HasMaxLength(5)
									.HasColumnName("SR_USER_CODE_DD_20");

				entity.Property(e => e.SrUserCodeDd21)
									.HasMaxLength(5)
									.HasColumnName("SR_USER_CODE_DD_21");

				entity.Property(e => e.SrUserCodeDd22)
									.HasMaxLength(5)
									.HasColumnName("SR_USER_CODE_DD_22");

				entity.Property(e => e.SrUserCodeDd23)
									.HasMaxLength(5)
									.HasColumnName("SR_USER_CODE_DD_23");

				entity.Property(e => e.SrUserCodeDd24)
									.HasMaxLength(5)
									.HasColumnName("SR_USER_CODE_DD_24");

				entity.Property(e => e.SrUserDate1)
									.HasColumnType("smalldatetime")
									.HasColumnName("SR_USER_DATE_1");

				entity.Property(e => e.SrUserDate2)
									.HasColumnType("smalldatetime")
									.HasColumnName("SR_USER_DATE_2");

				entity.Property(e => e.SrUserDate3)
									.HasColumnType("smalldatetime")
									.HasColumnName("SR_USER_DATE_3");

				entity.Property(e => e.SrUserDate4)
									.HasColumnType("smalldatetime")
									.HasColumnName("SR_USER_DATE_4");

				entity.Property(e => e.SrUserDate5)
									.HasColumnType("smalldatetime")
									.HasColumnName("SR_USER_DATE_5");

				entity.Property(e => e.SrUserNum1)
									.HasColumnType("numeric(10, 2)")
									.HasColumnName("SR_USER_NUM_1");

				entity.Property(e => e.SrUserNum2)
									.HasColumnType("numeric(10, 2)")
									.HasColumnName("SR_USER_NUM_2");

				entity.Property(e => e.SrUserNum3)
									.HasColumnType("numeric(10, 2)")
									.HasColumnName("SR_USER_NUM_3");

				entity.Property(e => e.SrUserNum4)
									.HasColumnType("numeric(10, 2)")
									.HasColumnName("SR_USER_NUM_4");

				entity.Property(e => e.SrUserNum5)
									.HasColumnType("numeric(10, 2)")
									.HasColumnName("SR_USER_NUM_5");

				entity.Property(e => e.SrUserNumExt1)
									.HasColumnType("numeric(10, 4)")
									.HasColumnName("SR_USER_NUM_EXT_1");

				entity.Property(e => e.SrUserText1)
									.HasMaxLength(50)
									.HasColumnName("SR_USER_TEXT_1");

				entity.Property(e => e.SrUserText10)
									.HasMaxLength(50)
									.HasColumnName("SR_USER_TEXT_10");

				entity.Property(e => e.SrUserText2)
									.HasMaxLength(50)
									.HasColumnName("SR_USER_TEXT_2");

				entity.Property(e => e.SrUserText3)
									.HasMaxLength(50)
									.HasColumnName("SR_USER_TEXT_3");

				entity.Property(e => e.SrUserText4)
									.HasMaxLength(50)
									.HasColumnName("SR_USER_TEXT_4");

				entity.Property(e => e.SrUserText5)
									.HasMaxLength(50)
									.HasColumnName("SR_USER_TEXT_5");

				entity.Property(e => e.SrUserText6)
									.HasMaxLength(50)
									.HasColumnName("SR_USER_TEXT_6");

				entity.Property(e => e.SrUserText7)
									.HasMaxLength(50)
									.HasColumnName("SR_USER_TEXT_7");

				entity.Property(e => e.SrUserText8)
									.HasMaxLength(50)
									.HasColumnName("SR_USER_TEXT_8");

				entity.Property(e => e.SrUserText9)
									.HasMaxLength(50)
									.HasColumnName("SR_USER_TEXT_9");

				entity.Property(e => e.StandardDayMinutes).HasColumnName("STANDARD_DAY_MINUTES");

				entity.Property(e => e.StateEnrollmentType)
									.HasMaxLength(5)
									.HasColumnName("STATE_ENROLLMENT_TYPE");

				entity.Property(e => e.StateFundingStatus)
									.HasMaxLength(5)
									.HasColumnName("STATE_FUNDING_STATUS");

				entity.Property(e => e.StateGradeLvlOverride)
									.HasMaxLength(5)
									.HasColumnName("STATE_GRADE_LVL_OVERRIDE");

				entity.Property(e => e.StatementOfAwareness)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("STATEMENT_OF_AWARENESS")
									.IsFixedLength();

				entity.Property(e => e.Status)
									.HasMaxLength(5)
									.HasColumnName("STATUS")
									.HasComment("TG - SASI3 status flag");

				entity.Property(e => e.StuCtdsNumber)
									.HasMaxLength(10)
									.HasColumnName("STU_CTDS_NUMBER");

				entity.Property(e => e.StuInstructionalHours)
									.HasColumnType("numeric(6, 2)")
									.HasColumnName("STU_INSTRUCTIONAL_HOURS");

				entity.Property(e => e.StudentGu).HasColumnName("STUDENT_GU");

				entity.Property(e => e.StudentOffenderTransfer)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("STUDENT_OFFENDER_TRANSFER")
									.IsFixedLength();

				entity.Property(e => e.SubSchool)
									.HasColumnType("numeric(10, 0)")
									.HasColumnName("SUB_SCHOOL");

				entity.Property(e => e.SummerGradeLevel)
									.HasMaxLength(5)
									.HasColumnName("SUMMER_GRADE_LEVEL")
									.HasComment("NG");

				entity.Property(e => e.SummerSchoolGu)
									.HasColumnName("SUMMER_SCHOOL_GU")
									.HasComment("NS");

				entity.Property(e => e.SummerWithdrawlCode)
									.HasMaxLength(5)
									.HasColumnName("SUMMER_WITHDRAWL_CODE")
									.HasComment("ATS.LC; ATS.EC make \"E3\"");

				entity.Property(e => e.SummerWithdrawlDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("SUMMER_WITHDRAWL_DATE")
									.HasComment("ATS.LD as first day of the calendar; ATS.ED also first day of calendar");

				entity.Property(e => e.TechPrep)
									.HasMaxLength(5)
									.HasColumnName("TECH_PREP")
									.HasComment("TE: go away when CTE module implemented");

				entity.Property(e => e.Title1Exit)
									.HasMaxLength(5)
									.HasColumnName("TITLE_1_EXIT")
									.HasComment("C2 byte 2 - will eventually be moved to needs to be time tracked");

				entity.Property(e => e.Title1Program)
									.HasMaxLength(5)
									.HasColumnName("TITLE_1_PROGRAM")
									.HasComment("C1 - will eventually be moved to needs to be time tracked");

				entity.Property(e => e.Title1Service)
									.HasMaxLength(5)
									.HasColumnName("TITLE_1_SERVICE")
									.HasComment("C2 byte 1 - will eventually be moved to needs to be time tracked");

				entity.Property(e => e.TrackGu)
									.HasColumnName("TRACK_GU")
									.HasComment("bubble up theory");

				entity.Property(e => e.TransportEligible)
									.HasMaxLength(5)
									.HasColumnName("TRANSPORT_ELIGIBLE")
									.HasComment("Code that indicates student's eligiblity for transportation");

				entity.Property(e => e.TransportMembershipCat)
									.HasMaxLength(5)
									.HasColumnName("TRANSPORT_MEMBERSHIP_CAT");

				entity.Property(e => e.TransportRequestDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("TRANSPORT_REQUEST_DATE");

				entity.Property(e => e.TransportStartDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("TRANSPORT_START_DATE");

				entity.Property(e => e.TransportatingDistrict)
									.HasMaxLength(10)
									.HasColumnName("TRANSPORTATING_DISTRICT")
									.HasComment("Transporting district number.  Used in MN MARSS.  Uses the same lookup as MARSS district of residence.");

				entity.Property(e => e.TruancyConference)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("TRUANCY_CONFERENCE")
									.IsFixedLength();

				entity.Property(e => e.TutionPayerCode)
									.HasMaxLength(5)
									.HasColumnName("TUTION_PAYER_CODE")
									.HasComment("bubble up theory");

				entity.Property(e => e.TypeOfInstruction)
									.HasMaxLength(5)
									.HasColumnName("TYPE_OF_INSTRUCTION");

				entity.Property(e => e.UnaccompaniedYouth)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("UNACCOMPANIED_YOUTH")
									.IsFixedLength();

				entity.Property(e => e.UserCheck1)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("USER_CHECK1")
									.IsFixedLength();

				entity.Property(e => e.UserCheck2)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("USER_CHECK2")
									.IsFixedLength();

				entity.Property(e => e.UserCheck3)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("USER_CHECK3")
									.IsFixedLength();

				entity.Property(e => e.UserCheck4)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("USER_CHECK4")
									.IsFixedLength();

				entity.Property(e => e.UserCheck5)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("USER_CHECK5")
									.IsFixedLength();

				entity.Property(e => e.UserCheck6)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("USER_CHECK6")
									.IsFixedLength();

				entity.Property(e => e.UserCheck7)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("USER_CHECK7")
									.IsFixedLength();

				entity.Property(e => e.UserCheck8)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("USER_CHECK8")
									.IsFixedLength();

				entity.Property(e => e.UserCode1)
									.HasMaxLength(10)
									.HasColumnName("USER_CODE1");

				entity.Property(e => e.UserCode2)
									.HasMaxLength(10)
									.HasColumnName("USER_CODE2");

				entity.Property(e => e.UserCode3)
									.HasMaxLength(10)
									.HasColumnName("USER_CODE3");

				entity.Property(e => e.UserCode4)
									.HasMaxLength(10)
									.HasColumnName("USER_CODE4");

				entity.Property(e => e.UserCode5)
									.HasMaxLength(10)
									.HasColumnName("USER_CODE5");

				entity.Property(e => e.UserCode6)
									.HasMaxLength(10)
									.HasColumnName("USER_CODE6");

				entity.Property(e => e.UserCode7)
									.HasMaxLength(10)
									.HasColumnName("USER_CODE7");

				entity.Property(e => e.UserCode8)
									.HasMaxLength(10)
									.HasColumnName("USER_CODE8");

				entity.Property(e => e.UserCode9)
									.HasMaxLength(10)
									.HasColumnName("USER_CODE9");

				entity.Property(e => e.UserDate1)
									.HasColumnType("smalldatetime")
									.HasColumnName("USER_DATE1");

				entity.Property(e => e.UserDate2)
									.HasColumnType("smalldatetime")
									.HasColumnName("USER_DATE2");

				entity.Property(e => e.UserDate3)
									.HasColumnType("smalldatetime")
									.HasColumnName("USER_DATE3");

				entity.Property(e => e.UserDate4)
									.HasColumnType("smalldatetime")
									.HasColumnName("USER_DATE4");

				entity.Property(e => e.UserNum1)
									.HasColumnType("numeric(10, 2)")
									.HasColumnName("USER_NUM1");

				entity.Property(e => e.UserNum2)
									.HasColumnType("numeric(10, 2)")
									.HasColumnName("USER_NUM2");

				entity.Property(e => e.UserNum3)
									.HasColumnType("numeric(10, 2)")
									.HasColumnName("USER_NUM3");

				entity.Property(e => e.UserNum4)
									.HasColumnType("numeric(10, 2)")
									.HasColumnName("USER_NUM4");

				entity.Property(e => e.UserNum5)
									.HasColumnType("numeric(10, 2)")
									.HasColumnName("USER_NUM5");

				entity.Property(e => e.UserNum6)
									.HasColumnType("numeric(10, 2)")
									.HasColumnName("USER_NUM6");

				entity.Property(e => e.UserNum7)
									.HasColumnType("numeric(10, 2)")
									.HasColumnName("USER_NUM7");

				entity.Property(e => e.UserNum8)
									.HasColumnType("numeric(10, 2)")
									.HasColumnName("USER_NUM8");

				entity.Property(e => e.Vocational)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("VOCATIONAL")
									.IsFixedLength()
									.HasComment("VO - go away when CTE module implemented");

				entity.Property(e => e.WithdrawalReasonCode)
									.HasMaxLength(5)
									.HasColumnName("WITHDRAWAL_REASON_CODE")
									.HasComment("Withdrawal Reason Code");

				entity.Property(e => e.YearEndStatus)
									.HasMaxLength(5)
									.HasColumnName("YEAR_END_STATUS")
									.HasComment("YE - SAIS");

				entity.Property(e => e.YearGu)
									.HasColumnName("YEAR_GU")
									.HasComment("Need to be able to read all stu school year rows for a given student by year - to do validation");

				entity.Property(e => e.Z349585)
									.HasMaxLength(1)
									.HasColumnName("Z_349585");

				entity.HasOne(d => d.OrganizationYear)
									.WithMany(p => p.StudentSchoolYears)
									.HasForeignKey(d => d.OrganizationYearGu)
									.OnDelete(DeleteBehavior.ClientSetNull)
									.HasConstraintName("EPC_STU_SCH_YR_F5");

				entity.HasOne(d => d.Student)
									.WithMany(p => p.EpcStuSchYrs)
									.HasForeignKey(d => d.StudentGu)
									.OnDelete(DeleteBehavior.ClientSetNull)
									.HasConstraintName("EPC_STU_SCH_YR_F1");

				entity.HasOne(d => d.Year)
									.WithMany(p => p.StudentSchoolYears)
									.HasForeignKey(d => d.YearGu)
									.OnDelete(DeleteBehavior.ClientSetNull)
									.HasConstraintName("EPC_STU_SCH_YR_F4");
			});

			modelBuilder.Entity<RevOrganization>(entity =>
			{
				entity.HasKey(e => e.OrganizationGu)
									.HasName("REV_ORGANIZATION_P");

				entity.ToTable("REV_ORGANIZATION", "rev");

				entity.HasIndex(e => e.AddressGu, "REV_ORGANIZATION_I1");

				entity.HasIndex(e => e.EdfiKeyGu, "REV_ORGANIZATION_I2");

				entity.Property(e => e.OrganizationGu)
									.ValueGeneratedNever()
									.HasColumnName("ORGANIZATION_GU");

				entity.Property(e => e.AddDateTimeStamp)
									.HasColumnType("smalldatetime")
									.HasColumnName("ADD_DATE_TIME_STAMP");

				entity.Property(e => e.AddressGu).HasColumnName("ADDRESS_GU");

				entity.Property(e => e.AllowAsVirtualRootNode)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("ALLOW_AS_VIRTUAL_ROOT_NODE")
									.IsFixedLength()
									.HasComment("Used to determine which Organization nodes appear in the drop-down list of Virtual Root Nodes");

				entity.Property(e => e.CentralPrintId)
									.HasMaxLength(55)
									.HasColumnName("CENTRAL_PRINT_ID");

				entity.Property(e => e.ChangeDateTimeStamp)
									.HasColumnType("smalldatetime")
									.HasColumnName("CHANGE_DATE_TIME_STAMP");

				entity.Property(e => e.ChangeIdStamp).HasColumnName("CHANGE_ID_STAMP");

				entity.Property(e => e.DefaultEmail)
									.HasMaxLength(100)
									.HasColumnName("DEFAULT_EMAIL");

				entity.Property(e => e.EdfiAltKeyGu).HasColumnName("EDFI_ALT_KEY_GU");

				entity.Property(e => e.EdfiDistrictId)
									.HasMaxLength(10)
									.HasColumnName("EDFI_DISTRICT_ID");

				entity.Property(e => e.EdfiKeyGu).HasColumnName("EDFI_KEY_GU");

				entity.Property(e => e.HideOrganization)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("HIDE_ORGANIZATION")
									.IsFixedLength();

				entity.Property(e => e.IncludeOnerosterApi)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("INCLUDE_ONEROSTER_API")
									.IsFixedLength();

				entity.Property(e => e.IsLeaf)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("IS_LEAF")
									.IsFixedLength();

				entity.Property(e => e.OrganizationAbbrName)
									.HasMaxLength(20)
									.HasColumnName("ORGANIZATION_ABBR_NAME")
									.HasComment("Abbreviated Organization Name");

				entity.Property(e => e.OrganizationName)
									.IsRequired()
									.HasMaxLength(100)
									.HasColumnName("ORGANIZATION_NAME");

				entity.Property(e => e.ParentGu).HasColumnName("PARENT_GU");

				entity.Property(e => e.Phone)
									.HasMaxLength(10)
									.HasColumnName("PHONE");

				entity.Property(e => e.Phone2)
									.HasMaxLength(10)
									.HasColumnName("PHONE2");

				entity.Property(e => e.Type)
									.HasMaxLength(2)
									.HasColumnName("TYPE");

				entity.Property(e => e.WebsiteUrl)
									.HasMaxLength(100)
									.HasColumnName("WEBSITE_URL")
									.HasComment("an Organization's website");
			});

			modelBuilder.Entity<RevOrganizationYear>(entity =>
			{
				entity.HasKey(e => e.OrganizationYearGu)
									.HasName("REV_ORGANIZATION_YEAR_P");

				entity.ToTable("REV_ORGANIZATION_YEAR", "rev");

				entity.HasIndex(e => new { e.OrganizationGu, e.YearGu }, "REV_ORGANIZATION_YEAR_C1")
									.IsUnique();

				entity.HasIndex(e => e.YearGu, "REV_ORGANIZATION_YEAR_I1");

				entity.Property(e => e.OrganizationYearGu)
									.ValueGeneratedNever()
									.HasColumnName("ORGANIZATION_YEAR_GU");

				entity.Property(e => e.AddDateTimeStamp)
									.HasColumnType("smalldatetime")
									.HasColumnName("ADD_DATE_TIME_STAMP");

				entity.Property(e => e.AddIdStamp).HasColumnName("ADD_ID_STAMP");

				entity.Property(e => e.ChangeDateTimeStamp)
									.HasColumnType("smalldatetime")
									.HasColumnName("CHANGE_DATE_TIME_STAMP");

				entity.Property(e => e.ChangeIdStamp).HasColumnName("CHANGE_ID_STAMP");

				entity.Property(e => e.OrganizationGu).HasColumnName("ORGANIZATION_GU");

				entity.Property(e => e.YearGu).HasColumnName("YEAR_GU");

				entity.HasOne(d => d.Organization)
									.WithMany(p => p.OrganizationYears)
									.HasForeignKey(d => d.OrganizationGu)
									.OnDelete(DeleteBehavior.ClientSetNull)
									.HasConstraintName("REV_ORGANIZATION_YEAR_F1");

				entity.HasOne(d => d.Year)
									.WithMany(p => p.OrganizationYears)
									.HasForeignKey(d => d.YearGu)
									.OnDelete(DeleteBehavior.ClientSetNull)
									.HasConstraintName("REV_ORGANIZATION_YEAR_F2");
			});

			modelBuilder.Entity<RevPerson>(entity =>
			{
				entity.HasKey(e => e.PersonGu)
									.HasName("REV_PERSON_P");

				entity.ToTable("REV_PERSON", "rev");

				entity.HasIndex(e => new { e.LastName, e.FirstName, e.MiddleName, e.PersonGu }, "REV_PERSON_I1");

				entity.HasIndex(e => new { e.ScrollCompositeKey, e.PersonGu }, "REV_PERSON_I2");

				entity.HasIndex(e => e.HomeAddressGu, "REV_PERSON_I3");

				entity.HasIndex(e => e.MailAddressGu, "REV_PERSON_I4");

				entity.HasIndex(e => e.WorkAddressGu, "REV_PERSON_I5");

				entity.HasIndex(e => e.Email, "REV_PERSON_I6");

				entity.Property(e => e.PersonGu)
									.ValueGeneratedNever()
									.HasColumnName("PERSON_GU");

				entity.Property(e => e.AkaFirstName)
									.HasMaxLength(40)
									.HasColumnName("AKA_FIRST_NAME")
									.HasComment("FN");

				entity.Property(e => e.AkaLastName)
									.HasMaxLength(40)
									.HasColumnName("AKA_LAST_NAME")
									.HasComment("LN");

				entity.Property(e => e.AkaMiddleName)
									.HasMaxLength(20)
									.HasColumnName("AKA_MIDDLE_NAME")
									.HasComment("MN");

				entity.Property(e => e.AkaSuffix)
									.HasMaxLength(10)
									.HasColumnName("AKA_SUFFIX")
									.HasComment("Append to LN");

				entity.Property(e => e.BirthDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("BIRTH_DATE")
									.HasComment("BD");

				entity.Property(e => e.BirthPlace)
									.HasMaxLength(30)
									.HasColumnName("BIRTH_PLACE")
									.HasComment("BP");

				entity.Property(e => e.ChangeDateTimeStamp)
									.HasColumnType("smalldatetime")
									.HasColumnName("CHANGE_DATE_TIME_STAMP");

				entity.Property(e => e.ChangeIdStamp).HasColumnName("CHANGE_ID_STAMP");

				entity.Property(e => e.CountryOfCitizenship)
									.HasMaxLength(5)
									.HasColumnName("COUNTRY_OF_CITIZENSHIP")
									.HasComment("BC");

				entity.Property(e => e.Deceased)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("DECEASED")
									.IsFixedLength()
									.HasComment("Indicates if a person is living or dead");

				entity.Property(e => e.DeceasedDate)
									.HasColumnType("smalldatetime")
									.HasColumnName("DECEASED_DATE");

				entity.Property(e => e.EdfiId)
									.HasMaxLength(20)
									.HasColumnName("EDFI_ID");

				entity.Property(e => e.Email)
									.HasMaxLength(100)
									.HasColumnName("EMAIL");

				entity.Property(e => e.EmailReqValidDate)
									.HasColumnType("datetime")
									.HasColumnName("EMAIL_REQ_VALID_DATE");

				entity.Property(e => e.EmailValidDate)
									.HasColumnType("datetime")
									.HasColumnName("EMAIL_VALID_DATE");

				entity.Property(e => e.EthnicCode)
									.HasMaxLength(5)
									.HasColumnName("ETHNIC_CODE")
									.HasComment("EC");

				entity.Property(e => e.FirstName)
									.IsRequired()
									.HasMaxLength(60)
									.HasColumnName("FIRST_NAME")
									.HasComment("FN");

				entity.Property(e => e.Gender)
									.HasMaxLength(5)
									.HasColumnName("GENDER")
									.HasComment("SX");

				entity.Property(e => e.GenderNonBinary)
									.HasMaxLength(5)
									.HasColumnName("GENDER_NON_BINARY");

				entity.Property(e => e.HispanicIndicator)
									.HasMaxLength(5)
									.HasColumnName("HISPANIC_INDICATOR");

				entity.Property(e => e.HomeAddressGu).HasColumnName("HOME_ADDRESS_GU");

				entity.Property(e => e.JobTitle)
									.HasMaxLength(50)
									.HasColumnName("JOB_TITLE");

				entity.Property(e => e.LastName)
									.IsRequired()
									.HasMaxLength(60)
									.HasColumnName("LAST_NAME")
									.HasComment("LN");

				entity.Property(e => e.LastNameGoesBy)
									.HasMaxLength(40)
									.HasColumnName("LAST_NAME_GOES_BY");

				entity.Property(e => e.LegalFn)
									.HasMaxLength(60)
									.HasColumnName("LEGAL_FN");

				entity.Property(e => e.LegalLn)
									.HasMaxLength(60)
									.HasColumnName("LEGAL_LN");

				entity.Property(e => e.LegalMn)
									.HasMaxLength(40)
									.HasColumnName("LEGAL_MN");

				entity.Property(e => e.LegalSx)
									.HasMaxLength(10)
									.HasColumnName("LEGAL_SX");

				entity.Property(e => e.MailAddressGu).HasColumnName("MAIL_ADDRESS_GU");

				entity.Property(e => e.MiddleName)
									.HasMaxLength(40)
									.HasColumnName("MIDDLE_NAME")
									.HasComment("MN");

				entity.Property(e => e.NickName)
									.HasMaxLength(20)
									.HasColumnName("NICK_NAME");

				entity.Property(e => e.NonCitizenType)
									.HasMaxLength(5)
									.HasColumnName("NON_CITIZEN_TYPE");

				entity.Property(e => e.PreviousSocialSecurityNum)
									.HasMaxLength(10)
									.HasColumnName("PREVIOUS_SOCIAL_SECURITY_NUM");

				entity.Property(e => e.PrimaryLanguage)
									.HasMaxLength(5)
									.HasColumnName("PRIMARY_LANGUAGE");

				entity.Property(e => e.PrimaryLanguageOther)
									.HasMaxLength(50)
									.HasColumnName("PRIMARY_LANGUAGE_OTHER");

				entity.Property(e => e.PrimaryPhone)
									.HasMaxLength(10)
									.HasColumnName("PRIMARY_PHONE")
									.HasComment("Read only BO Property - updated from rev person phone - redundant data to provide quick access to the persons main phone number info used in most reports");

				entity.Property(e => e.PrimaryPhoneAcceptText)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("PRIMARY_PHONE_ACCEPT_TEXT")
									.IsFixedLength();

				entity.Property(e => e.PrimaryPhoneCommLevel)
									.HasMaxLength(5)
									.HasColumnName("PRIMARY_PHONE_COMM_LEVEL");

				entity.Property(e => e.PrimaryPhoneContact)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("PRIMARY_PHONE_CONTACT")
									.IsFixedLength()
									.HasComment("Read only BO Property - updated from rev person phone - redundant data to provide quick access to the persons main phone number info used in most reports");

				entity.Property(e => e.PrimaryPhoneExtn)
									.HasMaxLength(20)
									.HasColumnName("PRIMARY_PHONE_EXTN")
									.HasComment("Read only BO Property - updated from rev person phone - redundant data to provide quick access to the persons main phone number info used in most reports");

				entity.Property(e => e.PrimaryPhoneListed)
									.IsRequired()
									.HasMaxLength(1)
									.IsUnicode(false)
									.HasColumnName("PRIMARY_PHONE_LISTED")
									.IsFixedLength()
									.HasComment("Read only BO Property - updated from rev person phone - redundant data to provide quick access to the persons main phone number info used in most reports");

				entity.Property(e => e.PrimaryPhoneType)
									.HasMaxLength(5)
									.HasColumnName("PRIMARY_PHONE_TYPE")
									.HasComment("Read only BO Property - updated from rev person phone - redundant data to provide quick access to the persons main phone number info used in most reports");

				entity.Property(e => e.PrimaryRaceIndicator)
									.HasMaxLength(5)
									.HasColumnName("PRIMARY_RACE_INDICATOR");

				entity.Property(e => e.PrimaryTextCommLevel)
									.HasMaxLength(5)
									.HasColumnName("PRIMARY_TEXT_COMM_LEVEL");

				entity.Property(e => e.ResolvedEthnicityRace)
									.HasMaxLength(5)
									.HasColumnName("RESOLVED_ETHNICITY_RACE")
									.HasComment("The person's federal ethnic code");

				entity.Property(e => e.ScrollCompositeKey)
									.HasMaxLength(160)
									.HasColumnName("SCROLL_COMPOSITE_KEY");

				entity.Property(e => e.ScrollCompositeKeyUpdate)
									.HasMaxLength(1)
									.HasColumnName("SCROLL_COMPOSITE_KEY_UPDATE");

				entity.Property(e => e.ScrollSoundex)
									.HasMaxLength(4)
									.HasColumnName("SCROLL_SOUNDEX");

				entity.Property(e => e.SocialSecurityNumber)
									.HasMaxLength(10)
									.HasColumnName("SOCIAL_SECURITY_NUMBER");

				entity.Property(e => e.StateEthnicity)
									.HasMaxLength(5)
									.HasColumnName("STATE_ETHNICITY");

				entity.Property(e => e.Suffix)
									.HasMaxLength(10)
									.HasColumnName("SUFFIX")
									.HasComment("Append to LN");

				entity.Property(e => e.SuffixDd)
									.HasMaxLength(5)
									.HasColumnName("SUFFIX_DD");

				entity.Property(e => e.Title)
									.HasMaxLength(10)
									.HasColumnName("TITLE");

				entity.Property(e => e.UsCitizen)
									.HasMaxLength(5)
									.HasColumnName("US_CITIZEN");

				entity.Property(e => e.WorkAddressGu).HasColumnName("WORK_ADDRESS_GU");
			});

			modelBuilder.Entity<RevYear>(entity =>
			{
				entity.HasKey(e => e.YearGu)
									.HasName("REV_YEAR_P");

				entity.ToTable("REV_YEAR", "rev");

				entity.HasIndex(e => new { e.SchoolYear, e.Extension }, "REV_YEAR_C1")
									.IsUnique();

				entity.Property(e => e.YearGu)
									.ValueGeneratedNever()
									.HasColumnName("YEAR_GU");

				entity.Property(e => e.AddDateTimeStamp)
									.HasColumnType("smalldatetime")
									.HasColumnName("ADD_DATE_TIME_STAMP");

				entity.Property(e => e.AddIdStamp).HasColumnName("ADD_ID_STAMP");

				entity.Property(e => e.ChangeDateTimeStamp)
									.HasColumnType("smalldatetime")
									.HasColumnName("CHANGE_DATE_TIME_STAMP");

				entity.Property(e => e.ChangeIdStamp).HasColumnName("CHANGE_ID_STAMP");

				entity.Property(e => e.Extension)
									.IsRequired()
									.HasMaxLength(5)
									.HasColumnName("EXTENSION");

				entity.Property(e => e.SchoolYear)
									.HasColumnType("numeric(4, 0)")
									.HasColumnName("SCHOOL_YEAR");
			});
		}
	}
}