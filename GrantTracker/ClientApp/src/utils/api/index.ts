import axios from 'axios'

const siteURL: string = 'https://granttracker2022.tusd1.org'
  //https://granttracker2022.tusd1.org
  //https://localhost:44394


export default axios.create({
  withCredentials: true,
  baseURL: siteURL
})
