import { useMutation, useQueryClient } from '@tanstack/react-query'
import z from 'zod'

import { renderToast } from 'services/toast'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'

export const MEASUREMENT_TYPE = {
  FLAG_COVERAGE: 'FLAG_COVERAGE',
  COMPONENT_COVERAGE: 'COMPONENT_COVERAGE',
} as const

export type MeasurementType = keyof typeof MEASUREMENT_TYPE

interface ActivateFlagMeasurementsProps {
  provider: string
  owner: string
  repo: string
  measurementType: MeasurementType
}

const ResponseSchema = z.object({
  activateMeasurements: z
    .object({
      error: z.union([
        z.object({
          __typename: z.literal('UnauthenticatedError'),
          message: z.string(),
        }),
        z.object({
          __typename: z.literal('ValidationError'),
          message: z.string(),
        }),
      ]),
    })
    .nullable(),
})

const query = `
  mutation ActivateMeasurements($input: ActivateMeasurementsInput!) {
    activateMeasurements(input: $input) {
      error {
        ... on UnauthenticatedError {
          __typename
          message
        }
        ... on ValidationError {
          __typename
          message
        }
      }
    }
  }
`

export function useActivateMeasurements({
  provider,
  owner,
  repo,
  measurementType,
}: ActivateFlagMeasurementsProps) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => {
      const variables = {
        input: {
          owner,
          repoName: repo,
          measurementType,
        },
      }

      return Api.graphqlMutation({
        provider,
        query,
        variables,
        mutationPath: 'activateMeasurements',
      })
    },
    onSuccess: ({ data }) => {
      const callingFn = 'useActivateMeasurements'
      const parsedData = ResponseSchema.safeParse(data)

      if (!parsedData.success) {
        return rejectNetworkError({
          errorName: 'Parsing Error',
          errorDetails: { callingFn, error: parsedData.error },
        })
      }

      const error = parsedData.data.activateMeasurements?.error
      if (error) {
        throw new Error(error.message)
      }

      queryClient.invalidateQueries([
        'BackfillFlagMemberships',
        provider,
        owner,
        repo,
      ])
      queryClient.invalidateQueries([
        'BackfillComponentMemberships',
        provider,
        owner,
        repo,
      ])
    },
    onError: () => {
      const measurementString =
        measurementType === 'FLAG_COVERAGE' ? 'flag' : 'component'
      renderToast({
        type: 'error',
        title: `Error activating ${measurementString} measurements`,
        content:
          'Please try again. If the error persists please contact support',
        options: {
          duration: 10000,
        },
      })
    },
  })
}
