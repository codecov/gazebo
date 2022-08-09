import get from 'lodash/get'

import config from 'config'

import { camelizeKeys } from 'shared/utils/camelizeKeys'

import { generatePath, getHeaders } from './helpers'

function _fetch({
  path,
  query,
  method = 'GET',
  body,
  provider = 'gh',
  extraHeaders = {},
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
    credentials: 'include',
    body: body ? JSON.stringify(body) : null,
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

function transformErrors(body) {
  const unhandledErrors = []
  if (body.errors) {
    body.errors.forEach((error) => {
      if (error.path && error.path.length > 0) {
        let node = body.data
        error.path.forEach((key) => {
          if (!node[key]) {
            // the node where an error arose will often be null
            node[key] = {}
          }
          node = node[key]
        })

        // move the error to the resolver where it occurred
        if (!node._errors) {
          node._errors = []
        }
        node._errors.push(error)
      } else {
        unhandledErrors.push(error)
      }
    })
    body.errors = unhandledErrors
  }
  return body
}

function graphql({ provider, query, variables = {} }) {
  const uri = `${config.API_URL}/graphql/${provider}`
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
    credentials: 'include',
    body: JSON.stringify({
      query,
      variables,
    }),
  })
    .then((d) => d.json())
    .then(transformErrors)
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
