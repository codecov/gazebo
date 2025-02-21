import { useQuery } from '@tanstack/react-query'
import z from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'

const ResponseSchema = z.object({
  owner: z
    .object({
      aiEnabledRepos: z.array(z.string()).nullable(),
    })
    .nullable(),
})

const query = `
  query GetCodecovAIInstalledRepos($username: String!) {
    owner(username: $username) {
      aiEnabledRepos
  	}
	}
`

interface CodecovAIInstalledReposProps {
  owner: string
  provider: string
}

export function useCodecovAIInstalledRepos({
  owner,
  provider,
}: CodecovAIInstalledReposProps) {
  return useQuery({
    queryKey: ['GetCodecovAIInstalledRepos', provider, owner],
    queryFn: ({ signal }) => {
      return Api.graphql({
        provider,
        query,
        signal,
        variables: {
          username: owner,
        },
      }).then((res) => {
        const parsedRes = ResponseSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: {
              callingFn: 'useCodecovAIInstalledRepos',
              error: parsedRes.error,
            },
          })
        }

        return {
          aiEnabledRepos: parsedRes.data.owner?.aiEnabledRepos,
        }
      })
    },
  })
}
