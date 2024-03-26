import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

const IndicationRangeSchema = z
  .object({
    lowerRange: z.number(),
    upperRange: z.number(),
  })
  .nullish()

export const RepoConfig = z
  .object({
    indicationRange: IndicationRangeSchema,
  })
  .nullish()

type RepoConfigData = z.infer<typeof RepoConfig>
export type IndicationRangeType = z.infer<typeof IndicationRangeSchema>

export interface UseRepoConfigArgs {
  provider: string
  owner: string
  repo: string
  opts?: UseQueryOptions<RepoConfigData>
}

const query = `
  query RepoConfig($owner: String!, $repo: String!) {
    owner(username:$owner){
      repository: repositoryDeprecated(name:$repo){
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

export const useRepoConfig = ({
  provider,
  owner,
  repo,
  opts,
}: UseRepoConfigArgs) =>
  useQuery({
    queryKey: ['RepoConfig', provider, owner, repo, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
        },
      }).then(
        (res) =>
          RepoConfig.parse(res?.data?.owner?.repository?.repositoryConfig) ?? {}
      ),
    ...(!!opts && opts),
  })
