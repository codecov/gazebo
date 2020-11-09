import qs from 'qs'
import * as Cookie from 'js-cookie'

const ProviderCookieKeyMapping = {
  gh: 'github-token',
  gl: 'gitlab-token',
  bb: 'bitbucket-token',
}

function generatePath({ path, query }) {
  const baseUrl = 'https://stage-api.codecov.dev/internal'
  const queryString = qs.stringify(query, {})

  return `${baseUrl}${path}?${queryString}`
}

function getHeaders(provider) {
  const token = Cookie.get(ProviderCookieKeyMapping[provider])

  const authorizationHeader = token
    ? {
        Authorization: `frontend ${token}`,
      }
    : {}

  return {
    Accept: 'application/json',
    ...authorizationHeader,
  }
}

export async function get({ path, query, provider = 'gh', extraHeaders = {} }) {
  const uri = generatePath({ path, query })
  const headers = {
    ...getHeaders(provider),
    ...extraHeaders,
  }

  const res = await fetch(uri, { headers })
  const data = await res.json()

  return {
    data,
    ...res,
  }
}

const Service = {
  get,
}

export default Service
