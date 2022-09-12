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

export default axios.create({
  withCredentials: true,
  baseURL: ''
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
