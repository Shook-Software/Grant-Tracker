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

const siteURL: string = 'https://granttracker2022.tusd1.org'
  //https://granttracker2022.tusd1.org
  //https://localhost:44394

export abstract class AxiosIdentityConfig {
  public static identity: {
    organizationYearGuid: string | undefined,
    organizationGuid: string | undefined,
    yearGuid: string | undefined
  }

  public static initialize (organizationGuid, yearGuid, organizationYearGuid, userGuid): void {

    AxiosIdentityConfig.identity = { organizationGuid, yearGuid, organizationYearGuid }

    if (!AxiosIdentityConfig.identity.organizationYearGuid)
    {
      console.log('cant do it', organizationYearGuid)
      axios.create({
        withCredentials: true,
        baseURL: siteURL
      })
        .get('user/organizationYear', { params: { organizationGuid, yearGuid }})
        .then(res => AxiosIdentityConfig.identity.organizationYearGuid = res.data)
    }
  }

  public static setOrganizationYear (organizationGuid, yearGuid, organizationYearGuid, userGuid): void {
    if (!AxiosIdentityConfig.identity 
      || AxiosIdentityConfig.identity.organizationGuid !== organizationGuid 
      || AxiosIdentityConfig.identity.yearGuid !== yearGuid
      || AxiosIdentityConfig.identity.organizationYearGuid !== organizationYearGuid
      )
    {
      AxiosIdentityConfig.identity = { organizationYearGuid, organizationGuid, yearGuid }
    }
    
    if (!organizationYearGuid)
    {
      axios.create({
        withCredentials: true,
        baseURL: siteURL
      })
        .get('user/organizationYear')
        .then(res => AxiosIdentityConfig.identity.organizationYearGuid = res.data)
    }
  }
}

export default axios.create({
  withCredentials: true,
  baseURL: siteURL

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
