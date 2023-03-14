import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

export const BranchConfig = z
  .object({
    branch: z
      .object({
        name: z.string(),
        head: z
          .object({
            commitid: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
  })
  .optional()

type BranchConfigData = z.infer<typeof BranchConfig>

export interface UseBranchArgs {
  provider: string
  owner: string
  repo: string
  branch: string
  opts?: UseQueryOptions<BranchConfigData>
}

const query = `
  query GetBranch($owner: String!, $repo: String!, $branch: String!) {
    owner(username: $owner) {
      repository(name: $repo) {
        branch(name: $branch) {
          name
          head {
            commitid
          }
        }
      }
    }
  }
`

export const useBranch = ({
  provider,
  owner,
  repo,
  branch,
  opts,
}: UseBranchArgs) =>
  useQuery({
    queryKey: ['GetBranch', provider, owner, repo, branch, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
          branch,
        },
      }).then((res) => BranchConfig.parse(res?.data?.owner?.repository) ?? {}),
    ...(!!opts && opts),
  })
