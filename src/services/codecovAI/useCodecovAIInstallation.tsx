import { useQuery } from '@tanstack/react-query'
import z from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'

const ResponseSchema = z.object({
  owner: z
    .object({
      aiFeaturesEnabled: z.boolean(),
    })
    .nullable(),
})

const query = `
  query GetCodecovAIAppInstallInfo($username: String!) {
    owner(username: $username) {
      aiFeaturesEnabled
  	}
	}
`

interface CodecovAIInstallationProps {
  owner: string
  provider: string
}

export function useCodecovAIInstallation({
  owner,
  provider,
}: CodecovAIInstallationProps) {
  return useQuery({
    queryKey: ['GetCodecovAIAppInstallInfo', provider, owner],
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
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useCodecovAIInstallation - 404 failed to parse',
          } satisfies NetworkErrorObject)
        }

        return parsedRes.data.owner?.aiFeaturesEnabled
      })
    },
  })
}
