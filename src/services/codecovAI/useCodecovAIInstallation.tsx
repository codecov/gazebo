import { useQuery } from '@tanstack/react-query'
import z from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'

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
        const callingFn = 'useCodecovAIInstallation'
        const parsedRes = ResponseSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: { callingFn, error: parsedRes.error },
          })
        }

        return {
          aiFeaturesEnabled: parsedRes.data.owner?.aiFeaturesEnabled,
        }
      })
    },
  })
}
