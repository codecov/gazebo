import camelCase from 'lodash/camelCase'
import qs from 'qs'
import * as Cookie from 'js-cookie'

import config from 'config'

const ProviderCookieKeyMapping = {
  gh: 'github-token',
  gl: 'gitlab-token',
  bb: 'bitbucket-token',
}

export function generatePath({ path, query }) {
  const baseUrl = `${config.API_URL}/internal`
  const queryString = qs.stringify(query, {})

  return `${baseUrl}${path}?${queryString}`
}

export function getHeaders(provider) {
  const token = Cookie.get(ProviderCookieKeyMapping[provider])

  const authorizationHeader = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {}

  return {
    Accept: 'application/json',
    ...authorizationHeader,
  }
}

export function camelizeKeys(obj) {
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
