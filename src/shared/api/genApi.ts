import { useParams } from 'react-router-dom'

import config from 'config'

import { getHeaders } from './helpers'

export function useFetchData<TData, TVariables>(
  query: string,
  variables: TVariables
): () => Promise<TData> {
  const { provider } = useParams<{ provider: string }>()
  const uri = `${config.API_URL}/graphql/${provider}`
  const headers = {
    ...getHeaders(provider),
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
  }

  return async () => {
    const res = await fetch(uri, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })

    const json = await res.json()

    if (json.errors) {
      const { message } = json.errors[0] || 'Error..'
      throw new Error(message)
    }

    return json.data
  }
}
