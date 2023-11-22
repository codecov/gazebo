import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import { renderToast } from 'services/toast'
import Api from 'shared/api'

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

interface StarTrialMutationArgs {
  owner: string
}

// need to take owner as an arg here because
// onboarding won't have it in the url
export const useStartTrial = () => {
  const { provider } = useParams<Params>()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ owner }: StarTrialMutationArgs) => {
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

      renderToast({
        type: 'generic',
        title: '14 day trial has started',
        content: '',
        options: {
          duration: 5000,
          position: 'bottom-left',
        },
      })
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
