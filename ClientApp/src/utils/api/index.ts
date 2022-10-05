import { LocalTime } from '@js-joda/core'
import axios from 'axios'

function recursiveObjectSearch (object: any) {
  if (object === {}) return

  for (const [key, value] of Object.entries(object)) {
    if (value && typeof value === 'object') {
      if ('hour' in value && 'minute' in value) {
        //@ts-ignore
        object[key] = LocalTime.of(value.hour, value.minute)
      } else recursiveObjectSearch(value)
    }
  }
}

export abstract class AxiosIdentityConfig {
  public static identity: {
    organizationYearGuid: undefined,
    organizationGuid: undefined,
    yearGuid: undefined
  }

  public static initialize (organizationGuid, yearGuid, organizationYearGuid, userGuid): void {
    const lastOrganizationGuid = localStorage.getItem(`organizationGuid-${userGuid}`)
    const lastYearGuid = localStorage.getItem(`yearGuid-${userGuid}`)

    if (!lastOrganizationGuid || !lastYearGuid)
      AxiosIdentityConfig.setOrganizationYear(organizationGuid, yearGuid, organizationYearGuid, userGuid)
    else {
      AxiosIdentityConfig.identity = { organizationGuid, yearGuid, organizationYearGuid: undefined }
    }
  }

  public static setOrganizationYear (organizationGuid, yearGuid, organizationYearGuid, userGuid): void {
    if (!AxiosIdentityConfig.identity 
      || AxiosIdentityConfig.identity.organizationGuid !== organizationGuid 
      || AxiosIdentityConfig.identity.yearGuid !== yearGuid
      || AxiosIdentityConfig.identity.organizationYearGuid !== organizationYearGuid
      ){
      AxiosIdentityConfig.identity = { organizationYearGuid, organizationGuid, yearGuid }

      localStorage.setItem(`organizationGuid-${userGuid}`, organizationGuid)
      localStorage.setItem(`yearGuid-${userGuid}`, yearGuid)
    }
  }
}

export default axios.create({
  withCredentials: true,
  baseURL: 'http://localhost:44394'
  //http://granttracker2022/
  //http://localhost:44394
  /*transformResponse: [
		(data, headers) => {
			try {
				let result: any = JSON.parse(data)
				recursiveObjectSearch(result)
				return result
			} catch (err) {
				return null
			}
		}
	]*/
})
