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
    ...getHeaders(provider),
    ...extraHeaders,
  }

  const res = await fetch(uri, {
    headers,
    method,
    body: data ? JSON.stringify(data) : null,
  })

  return {
    data: camelizeKeys(await res.json()),
    res,
  }
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

const Api = {
  get,
  post,
}

export default Api
