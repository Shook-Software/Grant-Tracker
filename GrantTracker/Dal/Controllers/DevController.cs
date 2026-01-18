using GrantTracker.Dal.Models.DTO;
using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Repositories.AuthRepository;
using GrantTracker.Dal.Repositories.DevRepository;
using GrantTracker.Dal.Repositories.DropdownRepository;
using GrantTracker.Dal.Repositories.InstructorRepository;
using GrantTracker.Dal.Repositories.YearRepository;
using GrantTracker.Dal.Repositories.OrganizationRepository;
using GrantTracker.Dal.Repositories.OrganizationYearRepository;
using GrantTracker.Dal.Schema;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Net.Http;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using PdfSharp.Pdf;
using PdfSharp.Pdf.IO;
using PdfSharp.Pdf.Content;
using PdfSharp.Pdf.Content.Objects;
using GrantTracker.Utilities;
using System.ComponentModel.DataAnnotations;
using GrantTracker.Dal.Models.Dto;
using GrantTracker.Dal.Repositories.InstructorSchoolYearRepository;

namespace GrantTracker.Dal.Controllers;

[ApiController]
//this should be restricted to Admin only
[Route("developer")]
public class DevController(
    IDevRepository devRepository, 
    IDropdownRepository dropdownRepository,
    IAuthRepository authRepository, 
    IInstructorRepository staffRepository,
    IInstructorSchoolYearRepository staffYearRepository,
    IYearRepository yearRepository, 
    IOrganizationRepository organizationRepository,
    IOrganizationYearRepository organizationYearRepository, 
    ILogger<DevController> logger
) : ControllerBase
{
    private readonly IDevRepository _devRepository = devRepository;
    private readonly IDropdownRepository _dropdownRepository = dropdownRepository;
    private readonly IAuthRepository _authRepository = authRepository;
    private readonly IInstructorRepository _instructorRepository = staffRepository;
    private readonly IInstructorSchoolYearRepository _instructorSchoolYearRepository = staffYearRepository;
    private readonly IYearRepository _yearRepository = yearRepository;
    private readonly IOrganizationRepository _organizationRepository = organizationRepository;
    private readonly IOrganizationYearRepository _organizationYearRepository = organizationYearRepository;
    private readonly ILogger<DevController> _logger = logger;

    [HttpGet("dropdowns")]
    public async Task<ActionResult<DropdownOptions>> GetDropdownOptions()
    {
        try
        {
            var options = await _dropdownRepository.GetAllDropdownOptionsAsync();
            return Ok(options);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function}", nameof(GetDropdownOptions));
            return StatusCode(500);
        }
    }

    [HttpGet("authentication")]
    public async Task<ActionResult<List<UserIdentity>>> GetUserAuthentication()
    {
        try
        {
            var users = await _authRepository.GetCurrentUsersAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function}", nameof(GetUserAuthentication));
            return StatusCode(500);
        }
    }

    [HttpGet("instructors")]
    public async Task<ActionResult<List<InstructorSchoolYearViewModel>>> GetInstructorsPendingDeletionAsync()
    {
        try
        {
            var instructors = (await _instructorRepository.GetInstructorsAsync()).Where(isy => isy.IsPendingDeletion).ToList();
            return Ok(instructors);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function}", nameof(GetInstructorsPendingDeletionAsync));
            return StatusCode(500);
        }
    }

    [HttpGet("organizationYear")]
    public async Task<ActionResult<List<OrganizationYearView>>> GetOrganizations()
    {
        try
        {
            var organizationYears = await _authRepository.GetOrganizationYearsForCurrentYear();
            return Ok(organizationYears);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function}", nameof(GetOrganizations));
            return StatusCode(500);
        }
    }

    #region School Year Controls

    [HttpGet("year")]
    public async Task<ActionResult<List<Year>>> GetYears()
    {
        try
        {
            var schoolYears = await _yearRepository.GetAsync();
            return Ok(schoolYears);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function}", nameof(GetYears));
            return StatusCode(500);
        }
    }

    [HttpPatch("year")]
    public async Task<IActionResult> UpdateYear([FromBody] YearForm yearModel)
    {
        try
        {
            if (yearModel is null)
                throw new Exception("Parameter object cannot be null.");

            await _yearRepository.UpdateAsync(yearModel);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - YearGuid: {YearGuid}", nameof(UpdateYear), yearModel?.YearGuid);
            return StatusCode(500);
        }
    }

    [HttpPatch("year/{YearGuid:Guid}/grades/sync")]
    public async Task<ActionResult<int>> SynchronizeSynergyGrades(Guid YearGuid)
    {
        try
        {
            var numRecordsUpdated = await _devRepository.SynchronizeStudentGradesWithSynergyAsync(YearGuid);
            return Ok(numRecordsUpdated);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - YearGuid: {YearGuid}", nameof(SynchronizeSynergyGrades), YearGuid);
            return StatusCode(500);
        }
    }

    [HttpPost("year")]
    public async Task<IActionResult> AddYear([FromBody] YearForm year)
    {
        try
        {
            if (year is null)
                throw new Exception("Parameter object cannot be null.");

            var errors = await _yearRepository.ValidateYearAsync(year);
            if (errors.Count > 0)
                return BadRequest(errors);

            await _yearRepository.AddAsync(year);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - SchoolYear: {SchoolYear}, Quarter: {Quarter}", nameof(AddYear), year?.SchoolYear, year?.Quarter);
            return StatusCode(500);
        }
    }

    #endregion School Year Controls

    [HttpPost("dropdown")]
    public async Task<IActionResult> AddDropdownOption(DropdownOptionType type, DropdownOption option)
    {
        try
        {
            await _dropdownRepository.CreateAsync(type, option);
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - type: {type}, optionLabel: {optionLabel}", nameof(AddDropdownOption), type, option?.Label);
            return StatusCode(500);
        }
    }

    [HttpPatch("dropdown")]
    public async Task<IActionResult> UpdateDropdownOption(DropdownOptionType type, DropdownOption[] options)
    {
        try
        {
            await _dropdownRepository.UpdateAsync(type, options);
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - type: {type}, optionsCount: {optionsCount}", nameof(UpdateDropdownOption), type, options?.Length);
            return StatusCode(500);
        }
    }

    public class PayrollYearFormDto
    {
        public string Name { get; set; }
        public List<Guid> YearGuids { get; set; }
        [DataType(DataType.Upload)]
        public IFormFile File { get; set; }
    }

    [HttpPost("PayrollYear")]
    public async Task<IActionResult> UploadPayrollYearPDFAsync([FromForm] PayrollYearFormDto form)
    {
        try
        {
            if (!Request.HasFormContentType || !HttpContext.Request.Form.Files.Any() || HttpContext.Request.Form.Files[0].ContentType != "application/pdf")
                throw new UnsupportedContentTypeException("Requires a PDF File, with PDF file upload only.");

            using Stream fileStream = form.File.OpenReadStream();

            PdfDocument file = PdfReader.Open(fileStream, PdfDocumentOpenMode.Import);

            var page = file.Pages[0];
            var content = ContentReader.ReadContent(page);

            var unparsedText = content.ExtractText();

            List<string> textParsed = new();

            string parsedSnippet = string.Empty;
            bool snippetOpen = false;
            string snippetOpenSymbol = "startString"; //a little jank, but we can revise if/when we need expanded and spread out functionality for PDF reading.
            string snippetCloseSymbol = "endString";

            foreach (var snippet in unparsedText)
            {
                if (!snippetOpen && snippet == snippetOpenSymbol)
                {
                    snippetOpen = true;
                    parsedSnippet = "";
                }
                else if (snippetOpen && snippet != snippetCloseSymbol)
                {
                    parsedSnippet = $"{parsedSnippet}{snippet}";
                }
                else if (snippet == snippetCloseSymbol)
                {
                    snippetOpen = false;
                    textParsed.Add(parsedSnippet);
                }
            }

            List<PayrollPeriod> payPeriods = new();

            for (int idx = textParsed.FindIndex(text => text.StartsWith("PR ")); idx < textParsed.Count; idx = idx + 6)
            {
                try
                {
                    string text = textParsed[idx];

                    if (text.StartsWith("PR "))
                    {
                        var portalStringSplit = textParsed[idx + 4].Split(" to ");

                        payPeriods.Add(new()
                        {
                            Period = Int32.Parse(text.Replace("PR ", "")),
                            StartDate = DateOnly.Parse(textParsed[idx + 1]),
                            EndDate = DateOnly.Parse(textParsed[idx + 2]),
                            AdjustmentDeadline = DateOnly.Parse(textParsed[idx + 3]),
                            PortalChangeStartDate = portalStringSplit.Count() > 1 ? DateOnly.Parse(portalStringSplit[0]) : null,
                            PortalChangeEndDate = portalStringSplit.Count() > 1 ? DateOnly.Parse(portalStringSplit[1]) : null,
                            PaymentDate = DateOnly.Parse(textParsed[idx + 5])
                        });
                    }
                }
                catch (Exception ex)
                {
                    continue;
                }
            }

            await _devRepository.AddPayrollYearAsync(form.YearGuids, new PayrollYear()
            {
                Name = form.Name,
                Periods = payPeriods
            });

            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - Name: {Name}", nameof(UploadPayrollYearPDFAsync), form?.Name);
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("instructor/{instructorSchoolYearGuid:guid}")]
    public async Task<IActionResult> DeleteInstructorSchoolYearAsync(Guid instructorSchoolYearGuid)
    {
        try
        {
            Guid instructorGuid = (await _instructorSchoolYearRepository.GetAsync(instructorSchoolYearGuid)).Instructor.Guid;
            List<Guid> instructorSchoolYearIds = await _instructorSchoolYearRepository.GetSchoolYearsIdsAsync(instructorGuid);

            await _instructorSchoolYearRepository.DeleteInstructorSchoolYearAsync(instructorSchoolYearGuid);
            instructorSchoolYearIds.Remove(instructorSchoolYearGuid);

            if (instructorSchoolYearIds.Count == 0)
                await _instructorRepository.DeleteInstructorAsync(instructorGuid);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "{Function} - instructorSchoolYearGuid: {instructorSchoolYearGuid}", nameof(DeleteInstructorSchoolYearAsync), instructorSchoolYearGuid);
            return BadRequest(ex.Message);
        }
    }
}