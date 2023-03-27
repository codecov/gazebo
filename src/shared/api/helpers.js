/* eslint-disable camelcase */
import qs from 'qs'

import config from 'config'

import { snakeifyKeys } from 'shared/utils/snakeifyKeys'

export const ProviderCookieKeyMapping = Object.freeze({
  gh: 'github-token',
  gl: 'gitlab-token',
  bb: 'bitbucket-token',
  ghe: 'github_enterprise-token',
  gle: 'gitlab_enterprise-token',
  bbs: 'bitbucket_server-token',
  github: 'github-token',
  gitlab: 'gitlab-token',
  bitbucket: 'bitbucket-token',
  github_enterprise: 'github_enterprise-token',
  gitlab_enterprise: 'gitlab_enterprise-token',
  bitbucket_server: 'bitbucket_server-token',
})

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
