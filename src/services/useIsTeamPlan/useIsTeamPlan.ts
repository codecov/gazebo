import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

export const PlanSchema = z
  .object({
    owner: z
      .object({
        plan: z
          .object({
            isTeamPlan: z.boolean(),
          })
          .nullable(),
      })
      .nullable(),
  })
  .nullable()

export interface UseIsTeamPlanArgs {
  provider: string
  owner: string
}

const query = `
  query IsTeamPlan($owner: String!) {
    owner(username:$owner){
      plan {
        isTeamPlan
      }
    }
  }
`

export const useIsTeamPlan = ({ provider, owner }: UseIsTeamPlanArgs) =>
  useQuery({
    queryKey: ['IsTeamPlan', provider, owner, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
        },
      }).then((res) => {
        const parsedRes = PlanSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: null,
          })
        }

        return parsedRes.data?.owner?.plan?.isTeamPlan ?? null
      }),
  })
