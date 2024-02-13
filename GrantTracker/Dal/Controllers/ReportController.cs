using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using GrantTracker.Dal.Repositories.ReportRepository;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Schema;
using GrantTracker.Dal.Schema.Sprocs.Reporting;

namespace GrantTracker.Dal.Controllers;

[ApiController]
//this should be restricted to Admin only
[Route("report")]
public class ReportController : ControllerBase
{
	private class ReportBounds
	{
		public DateOnly StartDateBound { get; set; }
		public DateOnly EndDateBound { get; set; }
    }
    private readonly ILogger<ReportController> _logger;

    private readonly IReportRepository _reportRepository;
	//cache settings
	private readonly IMemoryCache _memoryCache;
	private readonly MemoryCacheEntryOptions _cacheEntryOptions = new MemoryCacheEntryOptions();
	//TEMPORARY until a table is created.
	private readonly List<ReportBounds> _standardReportBounds = new()
	{
		//Summer: 6/1/22-7/31/22
		new()
		{
			StartDateBound = new DateOnly(2022, 6, 1),
			EndDateBound = new DateOnly(2022, 7, 31)
		},
		//Fall: 8/1/22-12/31/22
		new()
		{
			StartDateBound = new DateOnly(2022, 8, 1),
			EndDateBound = new DateOnly(2022, 12, 31)
		},
		//Spring: 1/1/23-5/25/23
		new()
		{
			StartDateBound = new DateOnly(2023, 1, 23),
			EndDateBound = new DateOnly(2023, 5, 25)
		},
		//Program Year: 2022-23: 6/1/22-5/25/23
		new()
		{
			StartDateBound = new DateOnly(2022, 6, 1),
			EndDateBound = new DateOnly(2023, 5, 25)
		},
		//Academic Year: 8/1/22-5/25/23
		new()
		{
			StartDateBound = new DateOnly(2022, 8, 1),
			EndDateBound = new DateOnly(2023, 5, 25)
		},
	};

	public ReportController(IReportRepository reportRepository, IMemoryCache memoryCache, ILogger<ReportController> logger)
	{
		_reportRepository = reportRepository;
		_memoryCache = memoryCache;
		_logger = logger;

		//get the next whole hour from now, expirations should be on each hour of the day.
		DateTime now = DateTime.Now;
		DateTime currentTime = new(now.Year, now.Month, now.Day, now.Hour, 0, 0);
		_cacheEntryOptions.SetAbsoluteExpiration(new DateTimeOffset(currentTime.AddHours(1)));
	}

	private async Task<Report<T>> GetReportAsync<T>(DateOnly startDate, DateOnly endDate, Guid organizationGuid, Func<DateOnly, DateOnly, Guid, Task<List<T>>> databaseCall)
	{
		Report<T> report;
		var isStandardRequest = _standardReportBounds.Any(bound => bound.StartDateBound == startDate && bound.EndDateBound == endDate);

		
		//if not a standard request, fetch a new report from the database
		report = new(await databaseCall(startDate, endDate, organizationGuid));

		return report;
	}

	//except for site sessions rn
	[HttpGet]
	public async Task<ActionResult<ReportsViewModel>> GetAllReportsAsync(string startDateStr, string endDateStr, Guid organizationYearGuid, Guid organizationGuid = default)
	{
		try
		{
			DateOnly startDate = DateOnly.Parse(startDateStr);
			DateOnly endDate = DateOnly.Parse(endDateStr);
			var reports = await _reportRepository.RunAllReportQueriesAsync(startDate, endDate, organizationYearGuid, organizationGuid);
			return Ok(reports);
		}
		catch (Exception ex)
		{
			_logger.LogError(ex, "{Function} - An unhandled error occured while fetching all reports.", nameof(GetAllReportsAsync));
            return StatusCode(500);
		}
	}

	[HttpGet("siteSessions")]
	public async Task<ActionResult<List<SiteSessionViewModel>>> GetSiteSessionsAsync(string startDateStr, string endDateStr, Guid organizationGuid = default)
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

	/*
	[HttpGet("totalStudentAttendance")]
	public async Task<ActionResult<Report<TotalStudentAttendanceViewModel>>> GetTotalStudentAttendanceAsync(string startDateStr, string endDateStr, Guid organizationGuid = default)
	{
		DateOnly startDate = DateOnly.Parse(startDateStr);
		DateOnly endDate = DateOnly.Parse(endDateStr);
		var report = await GetReportAsync<TotalStudentAttendanceViewModel>(startDate, endDate, organizationGuid, _reportRepository.GetTotalStudentAttendanceAsync);
		return Ok(report);
	}

	[HttpGet("totalFamilyAttendance")]
	public async Task<ActionResult<Report<TotalStudentAttendanceViewModel>>> GetTotalFamilyAttendanceAsync(string startDateStr, string endDateStr, Guid organizationGuid = default)
	{
		DateOnly startDate = DateOnly.Parse(startDateStr);
		DateOnly endDate = DateOnly.Parse(endDateStr);
		var report = await GetReportAsync<TotalFamilyAttendanceViewModel>(startDate, endDate, organizationGuid, _reportRepository.GetFamilyMemberAttendanceAsync);
		return Ok(report);
	}

	[HttpGet("totalActivity")]
	public async Task<ActionResult<Report<TotalActivityViewModel>>> GetTotalActivityAsync(string startDateStr, string endDateStr, Guid organizationGuid = default)
	{
		DateOnly startDate = DateOnly.Parse(startDateStr);
		DateOnly endDate = DateOnly.Parse(endDateStr);
		var report = await GetReportAsync<TotalActivityViewModel>(startDate, endDate, organizationGuid, _reportRepository.GetTotalActivityAsync);
		return Ok(report);
	}

	[HttpGet("siteSessions")]
	public async Task<ActionResult<List<SiteSessionViewModel>>> GetSiteSessionsAsync(string startDateStr, string endDateStr, Guid organizationGuid = default)
	{
		DateOnly startDate = DateOnly.Parse(startDateStr);
		DateOnly endDate = DateOnly.Parse(endDateStr);
		var siteSessions = await _reportRepository.GetSiteSessionsAsync(startDate, endDate, organizationGuid);
		return Ok(siteSessions);
	}

	[HttpGet("summaryOfClasses")]
	public async Task<ActionResult<List<ClassSummaryViewModel>>> GetSummaryOfClassesAsync(string startDateStr, string endDateStr, Guid organizationGuid = default)
	{
		DateOnly startDate = DateOnly.Parse(startDateStr);
		DateOnly endDate = DateOnly.Parse(endDateStr);
		var summaryOfClasses = await _reportRepository.GetSummaryOfClassesAsync(startDate, endDate, organizationGuid);
		return Ok(summaryOfClasses);
	}

	[HttpGet("programOverview")]
	public async Task<ActionResult<List<ProgramViewModel>>> GetProgramOverviewAsync(string startDateStr, string endDateStr, Guid organizationGuid = default)
	{
		DateOnly startDate = DateOnly.Parse(startDateStr);
		DateOnly endDate = DateOnly.Parse(endDateStr);
		var programOverview = await _reportRepository.GetProgramOverviewAsync(startDate, endDate, organizationGuid);
		return Ok(programOverview);
	}

	[HttpGet("staffingSummary")]
	public async Task<ActionResult<List<StaffSummaryViewModel>>> GetStaffingSummaryAsync(short schoolYear, Quarter quarter, Guid organizationGuid = default)
	{
		var staffingSummary = await _reportRepository.GetStaffingSummaryAsync(schoolYear, quarter, organizationGuid);
		return Ok(staffingSummary);
	}

	[HttpGet("studentSummary")]
	public async Task<ActionResult<List<StudentSummaryViewModel>>> GetStudentSummaryAsync(string startDateStr, string endDateStr, Guid organizationGuid = default)
	{
		DateOnly startDate = DateOnly.Parse(startDateStr);
		DateOnly endDate = DateOnly.Parse(endDateStr);
		var studentSummary = await _reportRepository.GetStudentSummaryAsync(startDate, endDate, organizationGuid);
		return Ok(studentSummary);
	}
	*/
}