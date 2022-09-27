import { useMutation, useQueryClient } from '@tanstack/react-query'

import Api from 'shared/api'

export function useActivateFlagMeasurements({ provider, owner, repo }) {
  const queryClient = useQueryClient()
  return useMutation(
    () => {
      const query = `
          mutation ActivateFlagsMeasurements($input: ActivateFlagsMeasurementsInput!) {
            activateFlagsMeasurements(input: $input) {
              error {
                __typename
              }
            }
          }
        `
      const variables = { input: { owner, repoName: repo } }
      return Api.graphqlMutation({
        provider,
        query,
        variables,
        mutationPath: 'activateFlagsMeasurements',
      })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          'BackfillFlagMemberships',
          provider,
          owner,
          repo,
        ])
      },
    }
  )
}
