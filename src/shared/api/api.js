import { camelizeKeys, generatePath, getHeaders } from './helpers'

async function _fetch({
  path,
  query,
  method = 'GET',
  data,
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

  const res = await fetch(uri, {
    headers,
    method,
    body: data ? JSON.stringify(data) : null,
  })

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`)
  }

  return camelizeKeys(await res.json())
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

const Api = {
  get,
  post,
  patch,
}

export default Api
