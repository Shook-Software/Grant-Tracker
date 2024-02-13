import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import reportWebVitals from './reportWebVitals'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import axios from 'utils/api'

//const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href')
const container = document.getElementById('root')

if (module.hot) {
  module.hot.accept()
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({queryKey: [url] }) => {
        if (typeof url === 'string') {
          const {data} = await axios.get(`/${url.toLowerCase()}`)
          return data
        }
        throw new Error('Invalid QueryKey')
      }
    }
  }
});

const root = createRoot(container)
root.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter basename='/'>
      <App />
    </BrowserRouter>
  </QueryClientProvider>
)
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
