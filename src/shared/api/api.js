import { camelizeKeys, generatePath, getHeaders } from './helpers'

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
    body: body ? JSON.stringify(body) : null,
  }).then(async (res) => {
    const data = camelizeKeys(await res.json())

    return res.ok
      ? data
      : Promise.reject({
          status: res.status,
          data,
        })
  })
}

export function get(config) {
  return _fetch(config)
}

export function post(config) {
  return _fetch({
    ...config,
    method: 'POST',
  })
}

export function patch(config) {
  return _fetch({
    ...config,
    method: 'PATCH',
  })
}

export function put(config) {
  return _fetch({
    ...config,
    method: 'PUT',
  })
}

const Api = {
  get,
  post,
  patch,
  put,
}

export default Api
