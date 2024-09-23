using GrantTracker.Dal.Schema;
using PdfSharp.Pdf.Content.Objects;
using System.Security.Claims;
using System.Text.Json;

namespace GrantTracker.Utilities;

public static class Extensions
{
    public static List<Guid> HomeOrganizationGuids(this ClaimsPrincipal Principal)
    {
        var organizationsJSON = Principal.Claims.FirstOrDefault(x => x.Type == "HomeOrg")?.Value;
        return JsonSerializer.Deserialize<List<Guid>>(organizationsJSON);
    }

    public static bool IsAdmin(this ClaimsPrincipal Principal)
    {
        return Principal.Claims.FirstOrDefault(x => x.Type == "UserRole")?.Value == "Administrator";
    }

    public static bool IsCoordinator(this ClaimsPrincipal Principal)
    {
        return Principal.Claims.FirstOrDefault(x => x.Type == "UserRole")?.Value == "Coordinator";
    }

    public static bool IsTeacher(this ClaimsPrincipal Principal)
    {
        return Principal.Claims.FirstOrDefault(x => x.Type == "UserRole")?.Value == "Teacher";
    }

    public static bool IsAuthorizedToViewOrganization(this ClaimsPrincipal User, Guid? OrganizationGuid)
    {
        return User.IsAdmin() || (OrganizationGuid is not null && User.HomeOrganizationGuids().Contains(OrganizationGuid.Value));
    }

    public static string Id(this ClaimsPrincipal user) => user.Claims.FirstOrDefault(x => x.Type == "Id")?.Value ?? "";

    public static string ToDisplayString(this Quarter quarter) => quarter switch
    {
        Quarter.Summer => "Summer",
        Quarter.AcademicYear => "Academic Year",
        _ => ""
    };

    public static IEnumerable<string> ExtractText(this CObject cObject)
    {
        if (cObject is COperator cOperator)
        {
            if (cOperator.OpCode.Name == OpCodeName.Tj.ToString() ||
                cOperator.OpCode.Name == OpCodeName.TJ.ToString())
            {
                foreach (var cOperand in cOperator.Operands)
                    foreach (var txt in ExtractText(cOperand))
                        yield return txt;
            }
            else if (cOperator.OpCode.Name == OpCodeName.BDC.ToString())
            {
                yield return "startString";
            }
            else if (cOperator.OpCode.Name == OpCodeName.EMC.ToString())
            {
                yield return "endString";
            }
        }
        else if (cObject is CSequence)
        {
            var cSequence = cObject as CSequence;
            foreach (var element in cSequence)
                foreach (var txt in ExtractText(element))
                    yield return txt;
        }
        else if (cObject is CString)
        {
            var cString = cObject as CString;
            yield return cString.Value;
        }
    }
}



