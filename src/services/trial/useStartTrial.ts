import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import { LOCAL_STORAGE_USER_STARTED_TRIAL_KEY } from 'pages/OwnerPage/OwnerPage'
import { renderToast } from 'services/toast/renderToast'
import Api from 'shared/api'
import { useRedirect } from 'shared/useRedirect'

const StartTrialSchema = z.object({
  startTrial: z
    .object({
      error: z
        .object({
          message: z.string(),
        })
        .nullable(),
    })
    .nullable(),
})

const mutationQuery = `
  mutation startTrial(
    $input: StartTrialInput!
  ) {
    startTrial(
      input: $input
    ) {
      error {
        ... on UnauthenticatedError {
          message
        }  
        ... on ValidationError {
          message
        }
      }
    }
  }
`

interface Params {
  provider: string
}

interface StartTrialMutationArgs {
  owner: string
}

// need to take owner as an arg here because
// onboarding won't have it in the url
export const useStartTrial = () => {
  const { provider } = useParams<Params>()
  const queryClient = useQueryClient()
  const { hardRedirect } = useRedirect({ href: `/${provider}` })

  const mutation = useMutation({
    mutationFn: ({ owner }: StartTrialMutationArgs) => {
      const variables = {
        input: { orgUsername: owner },
      }

      return Api.graphqlMutation({
        provider,
        query: mutationQuery,
        variables,
        mutationPath: 'startTrial',
      })
    },
    onSuccess: ({ data }) => {
      const parsedData = StartTrialSchema.parse(data)

      const error = parsedData.startTrial?.error

      if (error) {
        throw new Error(error.message)
      }

      queryClient.invalidateQueries(['accountDetails'])
      queryClient.invalidateQueries(['GetPlanData'])
      queryClient.invalidateQueries(['GetAvailablePlans'])
      localStorage.setItem(LOCAL_STORAGE_USER_STARTED_TRIAL_KEY, 'true')
      hardRedirect()
    },
    onError: () => {
      renderToast({
        type: 'error',
        title: 'Error starting trial',
        content:
          'Please try again. If the error persists please contact support',
        options: {
          duration: 10000,
        },
      })
    },
  })

  return mutation
}
