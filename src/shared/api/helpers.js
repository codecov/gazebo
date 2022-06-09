import qs from 'qs'

import config from 'config'

import { snakeifyKeys } from 'shared/utils/snakeifyKeys'

export const ProviderCookieKeyMapping = {
  gh: 'github-token',
  gl: 'gitlab-token',
  bb: 'bitbucket-token',
  github: 'github-token',
  gitlab: 'gitlab-token',
  bitbucket: 'bitbucket-token',
}

export function generatePath({ path, query }) {
  const baseUrl = `${config.API_URL}/internal`
  const queryString = qs.stringify(snakeifyKeys(query), {
    arrayFormat: 'repeat',
  })

  return `${baseUrl}${path}${queryString && '?' + queryString}`
}

export function getHeaders(provider) {
  const baseHeader = {
    Accept: 'application/json',
  }

  if (typeof provider !== 'string') return baseHeader

  const p = provider.toLowerCase()
  const tokenType = ProviderCookieKeyMapping[p]

  return {
    ...baseHeader,
    'Token-Type': tokenType,
  }
}
