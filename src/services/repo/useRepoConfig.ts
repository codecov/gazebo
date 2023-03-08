import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

export interface UseRepoConfigArgs {
  provider: string
  owner: string
  repo: string
}

export const RepoConfig = z
  .object({
    indicationRange: z
      .object({
        lowerRange: z.number(),
        upperRange: z.number(),
      })
      .nullish(),
  })
  .nullish()

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
  })
