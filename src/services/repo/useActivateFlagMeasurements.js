import { useMutation, useQueryClient } from '@tanstack/react-query'

import Api from 'shared/api'

export const MEASUREMENT_TYPE = Object.freeze({
  FLAG_COVERAGE: 'FLAG_COVERAGE',
})

export function useActivateFlagMeasurements({ provider, owner, repo }) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => {
      const query = `
          mutation ActivateMeasurements($input: ActivateMeasurementsInput!) {
            activateMeasurements(input: $input) {
              error {
                __typename
              }
            }
          }
        `
      const variables = {
        input: {
          owner,
          repoName: repo,
          measurementType: MEASUREMENT_TYPE.FLAG_COVERAGE,
        },
      }
      return Api.graphqlMutation({
        provider,
        query,
        variables,
        mutationPath: 'activateMeasurements',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries([
        'BackfillFlagMemberships',
        provider,
        owner,
        repo,
      ])
    },
  })
}
