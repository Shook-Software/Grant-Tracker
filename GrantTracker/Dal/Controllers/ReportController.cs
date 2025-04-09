using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using GrantTracker.Dal.Repositories.ReportRepository;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Models.DTO;
using GrantTracker.Dal.Schema;
using GrantTracker.Dal.Schema.Sprocs.Reporting;
using GrantTracker.Utilities;
using Microsoft.AspNetCore.Authorization;
using GrantTracker.Dal.Schema.Sprocs;

namespace GrantTracker.Dal.Controllers;

[ApiController]
[Route("report")]
public class ReportController : ControllerBase
{
    private readonly ILogger<ReportController> _logger;
    private readonly IReportRepository _reportRepository;

	public ReportController(IReportRepository reportRepository, IMemoryCache memoryCache, ILogger<ReportController> logger)
	{
		_reportRepository = reportRepository;
		_logger = logger;
	}

	[HttpGet("CCLC10")]
	public async Task<ActionResult<List<CCLC10ViewModel>>> GetAzEDSCCLC10ReportAsync(string startDateStr, string endDateStr)
	{
		try
        {
            if (!HttpContext.User.IsAdmin())
                return Unauthorized();

            var report = await _reportRepository.GetCCLC10Async(DateOnly.Parse(startDateStr), DateOnly.Parse(endDateStr));
			return Ok(report);
        }
		catch (Exception ex)
		{
            _logger.LogError(ex, "{Function} - An unhandled error occured while fetching the CCLC10 report.", nameof(GetSiteSessionsAsync));
            return StatusCode(500);
        }
    }

    [HttpGet("payrollAudit")]
    public async Task<ActionResult<List<PayrollAuditView>>> GetPayrollAuditReportAsync(string startDateStr, string endDateStr, Guid? organizationGuid = null)
    {
        try
        {
            var report = await _reportRepository.GetPayrollAuditAsync(DateOnly.Parse(startDateStr), DateOnly.Parse(endDateStr), organizationGuid);
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - An unhandled error occured while fetching the payroll audit report.", nameof(GetPayrollAuditReportAsync));
            return StatusCode(500);
        }
    }

    [HttpGet("attendanceCheck")]
    public async Task<ActionResult<List<AttendanceCheckViewModel>>> GetAttendanceCheckReportAsync(string startDateStr, string endDateStr, Guid? organizationGuid = null)
    {
        try
        {
            var report = await _reportRepository.GetAttendanceCheckAsync(DateOnly.Parse(startDateStr), DateOnly.Parse(endDateStr), organizationGuid);
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - An unhandled error occured while fetching the attendance check report.", nameof(GetAttendanceCheckReportAsync));
            return StatusCode(500);
        }
    }

    [HttpGet("programOverview")]
    public async Task<ActionResult<List<ProgramViewModel>>> GetProgramOverviewReportAsync(string startDateStr, string endDateStr, Guid? organizationGuid = null)
    {
        try
        {
            var report = await _reportRepository.GetProgramOverviewAsync(DateOnly.Parse(startDateStr), DateOnly.Parse(endDateStr), organizationGuid);
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - An unhandled error occured while fetching the program overview report.", nameof(GetProgramOverviewReportAsync));
            return StatusCode(500);
        }
    }

    [HttpGet("staffSummary")]
    public async Task<ActionResult<List<StaffSummaryViewModel>>> GetStaffSummaryReportAsync(Guid yearGuid, Guid? organizationGuid = null)
    {
        try
        {
            var report = await _reportRepository.GetStaffSummaryAsync(yearGuid, organizationGuid);
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - An unhandled error occured while fetching the staff summary report.", nameof(GetStaffSummaryReportAsync));
            return StatusCode(500);
        }
    }

    [HttpGet("studentAttendance")]
    public async Task<ActionResult<List<TotalStudentAttendanceViewModel>>> GetStudentAttendanceReportAsync(string startDateStr, string endDateStr, Guid? organizationGuid = null)
    {
        try
        {
            var report = await _reportRepository.GetStudentAttendanceAsync(DateOnly.Parse(startDateStr), DateOnly.Parse(endDateStr), organizationGuid);
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - An unhandled error occured while fetching the student attendance report.", nameof(GetStudentAttendanceReportAsync));
            return StatusCode(500);
        }
    }

    [HttpGet("summaryOfClasses")]
    public async Task<ActionResult<List<ClassSummaryViewModel>>> GetSummaryOfClassesReportAsync(string startDateStr, string endDateStr, Guid? organizationGuid = null)
    {
        try
        {
            var report = await _reportRepository.GetSummaryOfClassesAsync(DateOnly.Parse(startDateStr), DateOnly.Parse(endDateStr), organizationGuid);
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - An unhandled error occured while fetching the summary of classes report.", nameof(GetStaffSummaryReportAsync));
            return StatusCode(500);
        }
    }

    [HttpGet("totalActivity")]
    public async Task<ActionResult<List<TotalActivityViewModel>>> GetTotalActivityReportAsync(string startDateStr, string endDateStr, Guid? organizationGuid = null)
    {
        try
        {
            var report = await _reportRepository.GetTotalActivityAsync(DateOnly.Parse(startDateStr), DateOnly.Parse(endDateStr), organizationGuid);
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - An unhandled error occured while fetching the total activity report.", nameof(GetTotalActivityReportAsync));
            return StatusCode(500);
        }
    }

    [HttpGet("familyAttendance")]
    public async Task<ActionResult<List<TotalFamilyAttendanceViewModel>>> GetFamilyAttendanceReportAsync(string startDateStr, string endDateStr, Guid? organizationGuid = null)
    {
        try
        {
            var report = await _reportRepository.GetFamilyAttendanceAsync(DateOnly.Parse(startDateStr), DateOnly.Parse(endDateStr), organizationGuid);
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - An unhandled error occured while fetching the family report.", nameof(GetFamilyAttendanceReportAsync));
            return StatusCode(500);
        }
    }

    [HttpGet("studentSurvey")]
    public async Task<ActionResult<List<StudentSurveyViewModel>>> GetStudentSurveyReportAsync(string startDateStr, string endDateStr, Guid? organizationGuid = null)
    {
        try
        {
            var report = await _reportRepository.GetStudentSurveyAsync(DateOnly.Parse(startDateStr), DateOnly.Parse(endDateStr), organizationGuid);
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - An unhandled error occured while fetching the student survey report.", nameof(GetStudentSurveyReportAsync));
            return StatusCode(500);
        }
    }

    [HttpGet("siteSessions")]
	public async Task<ActionResult<List<SiteSessionViewModel>>> GetSiteSessionsAsync(string startDateStr, string endDateStr, Guid? organizationGuid = null)
	{
		try
        {
            DateOnly startDate = DateOnly.Parse(startDateStr);
			DateOnly endDate = DateOnly.Parse(endDateStr);
			var siteSessions = await _reportRepository.GetSiteSessionsAsync(startDate, endDate, organizationGuid);
			return Ok(siteSessions);
		}
		catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - An unhandled error occured while fetching the site session report.", nameof(GetSiteSessionsAsync));
            return StatusCode(500);
		}
    }

    [HttpGet("schedule")]
    public async Task<ActionResult<List<ScheduleReport>>> GetScheduleReportAsync(string startDateStr, string endDateStr, Guid? organizationGuid = null)
    {
        try
        {
            DateOnly startDate = DateOnly.Parse(startDateStr);
            DateOnly endDate = DateOnly.Parse(endDateStr);
            var scheduleReport = await _reportRepository.GetScheduleReportAsync(startDate, endDate, organizationGuid);
            return Ok(scheduleReport);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - An unhandled error occured while fetching the site session report.", nameof(GetSiteSessionsAsync));
            return StatusCode(500);
        }
    }

    [HttpGet("all-staff")]
    [Authorize(Policy = "Administrator")]
    public async Task<ActionResult<List<StaffMember>>> GetStaffingReportAsync()
    {
        try
        {
            if (!HttpContext.User.IsAdmin())
                return Unauthorized();

            var staff = await _reportRepository.GetStaffMembersAsync();
            return Ok(staff.OrderBy(x => x.OrganizationName).ThenByDescending(x => x.SchoolYear).ThenByDescending(x => x.Quarter).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - An unhandled error occured while fetching the site session report.", nameof(GetSiteSessionsAsync));
            return StatusCode(500);
        }
    }

    [HttpGet("studentDaysAttended")]
    public async Task<ActionResult<List<StudentDaysAttendedDTO>>> GetStudentDaysAttendedAsync(string startDateStr, string endDateStr, Guid? organizationGuid = null)
    {
        try
        {
            DateOnly startDate = DateOnly.Parse(startDateStr), endDate = DateOnly.Parse(endDateStr);
            return Ok(await _reportRepository.GetStudentDaysAttendedAsync(startDate, endDate, organizationGuid));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - An unhandled error occured while fetching the site session report.", nameof(GetSiteSessionsAsync));
            return StatusCode(500);
        }
    }
}