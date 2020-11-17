import { useRouteMatch } from 'react-router-dom'

/*
 ** gives the base url of a route, this is relevant for
 ** nested router, to make sure to get the baseURL of previous
 ** router and make sure it always ends with a slash
 */
function useBaseUrl() {
  const routeMatch = useRouteMatch()
  const baseUrl = routeMatch.url.endsWith('/')
    ? routeMatch.url
    : routeMatch.url + '/'

  return baseUrl
}

export default useBaseUrl
