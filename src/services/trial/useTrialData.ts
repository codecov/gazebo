import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

export const TrialStatuses = {
  NOT_STARTED: 'NOT_STARTED',
  ONGOING: 'ONGOING',
  EXPIRED: 'EXPIRED',
} as const

export const TrialConfig = z
  .object({
    plan: z
      .object({
        trialStatus: z.nativeEnum(TrialStatuses).nullish(),
        trialStartDate: z.string().nullish(),
        trialEndDate: z.string().nullish(),
      })
      .nullish(),
  })
  .nullish()

type TrialConfigData = z.infer<typeof TrialConfig>

export interface UseTrialArgs {
  provider: string
  owner: string
  opts?: UseQueryOptions<TrialConfigData>
}

export const query = `
  query GetTrialData($owner: String!) {
    owner(username: $owner) {
      plan {
        trialStatus
        trialStartDate
        trialEndDate
      }
    }
  }
`

export const useTrialData = ({ provider, owner, opts }: UseTrialArgs) =>
  useQuery({
    queryKey: ['GetTrialData', provider, owner, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
        },
      }).then((res) => TrialConfig.parse(res?.data?.owner) ?? {}),
    ...(!!opts && opts),
  })
