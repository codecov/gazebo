import get from 'lodash/get'

import config from 'config'

import { camelizeKeys } from 'shared/utils/camelizeKeys'
import { snakeifyKeys } from 'shared/utils/snakeifyKeys'

import { generatePath, getHeaders, isProvider } from './helpers'

function _fetch({
  path,
  query,
  method = 'GET',
  body,
  provider = 'gh',
  extraHeaders = {},
  signal,
}) {
  const uri = generatePath({ path, query })
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
    ...getHeaders(provider),
    ...extraHeaders,
  }

  return fetch(uri, {
    headers,
    method,
    signal,
    credentials: 'include',
    body: body ? JSON.stringify(snakeifyKeys(body)) : null,
  }).then(async (res) => {
    let data = null
    try {
      data = camelizeKeys(await res.json())
    } catch {
      // nothing to do, body can be empty
    }

    return res.ok
      ? data
      : Promise.reject({
          status: res.status,
          data,
        })
  })
}

function prefillMethod(method) {
  return (config) =>
    _fetch({
      ...config,
      method,
    })
}

function graphql({
  provider,
  query,
  variables = {},
  signal,
  supportsServiceless = false,
}) {
  let uri = `${config.API_URL}/graphql/`

  if (provider && isProvider(provider) && !supportsServiceless) {
    uri = `${config.API_URL}/graphql/${provider}`
  }

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
    ...getHeaders(provider),
  }

  for (const [key, value] of Object.entries(variables)) {
    if (typeof value === 'string') {
      variables[key] = decodeURIComponent(variables[key])
    }
  }

  return fetch(uri, {
    headers,
    method: 'POST',
    signal,
    credentials: 'include',
    body: JSON.stringify({
      query,
      variables,
    }),
  })
    .then(async (res) => {
      const data = await res.json()

      if (data?.errors) {
        if (
          data?.errors?.[0]?.extensions?.status === 403 &&
          config.IS_SELF_HOSTED
        ) {
          window.location.href = '/login'
        }
      }

      if (res.ok) {
        return data
      }

      return Promise.reject({
        status: res.status,
        data: data,
      })
    })
    .catch((error) => {
      return Promise.reject(error)
    })
}

function graphqlMutation({ mutationPath, ...graphqlParams }) {
  return graphql(graphqlParams).then((res) => {
    const mutationData = get(res.data, mutationPath)
    // only throw if we encounter these errors to get a full page error via NetworkErrorBoundary
    const throwableErrors = [
      'UnauthenticatedError',
      'UnauthorizedError',
      'NotFoundError',
    ]
    const error = mutationData?.error
    if (error && throwableErrors.includes(error.__typename)) {
      throw error
    }
    return res
  })
}

const Api = {
  get: prefillMethod('GET'),
  post: prefillMethod('POST'),
  patch: prefillMethod('PATCH'),
  delete: prefillMethod('DELETE'),
  graphql,
  graphqlMutation,
}

export default Api
