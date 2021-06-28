import camelCase from 'lodash/camelCase'
import snakeCase from 'lodash/snakeCase'
import qs from 'qs'

import config from 'config'

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
  const queryString = qs.stringify(snakeifyKeys(query), {})

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

export function camelizeKeys(obj = {}) {
  if (Array.isArray(obj)) {
    return obj.map((v) => camelizeKeys(v))
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [camelCase(key)]: camelizeKeys(obj[key]),
      }),
      {}
    )
  }
  return obj
}

export function snakeifyKeys(obj = {}) {
  if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [snakeCase(key)]: snakeifyKeys(obj[key]),
      }),
      {}
    )
  }
  return obj
}
