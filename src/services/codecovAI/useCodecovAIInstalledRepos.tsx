import { useQuery } from '@tanstack/react-query'
import z from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'

const ResponseSchema = z.object({
  owner: z
    .object({
      aiEnabledRepos: z.array(z.string().nullable()).nullable(),
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
          console.log(res?.data)
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useCodecovAIInstalledRepos - 404 failed to parse',
          } satisfies NetworkErrorObject)
        }

        return parsedRes.data.owner?.aiEnabledRepos
      })
    },
  })
}
