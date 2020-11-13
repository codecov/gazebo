import { camelizeKeys, generatePath, getHeaders } from './helpers'

export async function get({ path, query, provider = 'gh', extraHeaders = {} }) {
  const uri = generatePath({ path, query })
  const headers = {
    ...getHeaders(provider),
    ...extraHeaders,
  }

  const res = await fetch(uri, { headers })
  const data = camelizeKeys(await res.json())

  return {
    data,
    res,
  }
}

const Api = {
  get,
}

export default Api
