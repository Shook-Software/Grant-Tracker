using GrantTracker.Dal.Schema;
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
}


