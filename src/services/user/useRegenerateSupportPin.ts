import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import Api from 'shared/api'
import { Provider } from 'shared/api/helpers'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'

const query = `
  mutation RegenerateSupportPin {
    regenerateSupportPin {
      me {
        supportPin
      }
      error {
        __typename
      }
    }
  }
`

const ResponseSchema = z.object({
  regenerateSupportPin: z
    .object({
      me: z
        .object({
          supportPin: z.string().nullable(),
        })
        .nullish(),
      error: z
        .discriminatedUnion('__typename', [
          z.object({
            __typename: z.literal('UnauthenticatedError'),
          }),
        ])
        .nullish(),
    })
    .nullish(),
})

interface URLParams {
  provider: Provider
}

interface UseRegenerateSupportPinProps {
  onSuccess?: (
    data: z.infer<typeof ResponseSchema>['regenerateSupportPin']
  ) => void
}

export function useRegenerateSupportPin({
  onSuccess = () => {},
}: UseRegenerateSupportPinProps = {}) {
  const { provider } = useParams<URLParams>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => {
      return Api.graphqlMutation({
        provider,
        query,
        mutationPath: 'regenerateSupportPin',
      }).then(({ data }) => {
        const callingFn = 'useRegenerateSupportPin'
        const parsedRes = ResponseSchema.safeParse(data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: { callingFn, error: parsedRes.error },
          })
        }

        return parsedRes.data.regenerateSupportPin
      })
    },
    useErrorBoundary: true,
    onSuccess: (res) => {
      onSuccess(res)
      queryClient.invalidateQueries(['currentUser'])
    },
  })
}
