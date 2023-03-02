import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

export interface UseRepoConfigArgs {
  provider: string
  owner: string
  repo: string
}

const RepoConfig = z.object({
  indicationRange: z
    .object({
      lowerRange: z.number(),
      upperRange: z.number(),
    })
    .nullable(),
})

export type UseRepoConfig = z.infer<typeof RepoConfig>

const query = `
  query RepoConfig($owner: String!, $repo: String!) {
    owner(username:$owner){
      repository(name:$repo){
        repositoryConfig {
          indicationRange {
            lowerRange
            upperRange
          }
        }
      }
    }
  }
`

export const useRepoConfig = ({ provider, owner, repo }: UseRepoConfigArgs) =>
  useQuery({
    queryKey: ['RepoConfig', provider, owner, repo, query],
    queryFn: ({ signal }): Promise<UseRepoConfig | {}> =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
        },
      }).then((res) => {
        const zRes = RepoConfig.safeParse(
          res?.data?.owner?.repository?.repositoryConfig
        )

        if (!zRes.success) {
          return {}
        }

        return zRes.data
      }),
  })
