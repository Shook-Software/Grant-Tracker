

using GrantTracker.Dal.Schema;
using System.Security.Claims;

namespace GrantTracker.Utilities;

public static class Extensions
{


    public static Guid HomeOrganizationGuid(this ClaimsPrincipal Principal)
    {
        return new Guid(Principal.Claims.FirstOrDefault(x => x.Type == "HomeOrg")?.Value);
    }

    public static bool IsAdmin(this ClaimsPrincipal Principal)
    {
        return Principal.Claims.First(x => x.Type == "UserRole").Value == "Administrator";
    }

    public static bool IsAuthorizedToViewOrganization(this ClaimsPrincipal User, Guid? OrganizationGuid)
    {
        return User.IsAdmin() || User.HomeOrganizationGuid() == OrganizationGuid;
    }
}
