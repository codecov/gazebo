import { useQuery } from '@tanstack/react-query'
import isArray from 'lodash/isArray'
import { z } from 'zod'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import A from 'ui/A'

const CommitSchema = z.object({
  commitid: z.string(),
})

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  commits: z
    .object({
      edges: z.array(
        z
          .object({
            node: CommitSchema,
          })
          .nullable()
      ),
    })
    .nullable(),
})

const GetBranchCommitsSchema = z.object({
  owner: z
    .object({
      repository: z.discriminatedUnion('__typename', [
        RepositorySchema,
        RepoNotFoundErrorSchema,
        RepoOwnerNotActivatedErrorSchema,
      ]),
    })
    .nullable(),
})

const query = `
  query GetBranchCommits($owner: String!, $repo: String!, $branch: String!) {
    owner(username: $owner) {
      repository(name: $repo) {
        __typename
        ... on Repository {
          commits(first: 1, filters: { branchName: $branch }) {
            edges {
              node {
                commitid
              }
            }
          }
        }
        ... on NotFoundError {
          message
        }
        ... on OwnerNotActivatedError {
          message
        }
      }
    }
  }`

interface UseBranchCommitsArgs {
  provider: string
  owner: string
  repo: string
  branch: string
  opts?: {
    suspense?: boolean
    enabled?: boolean
  }
}

export const useBranchHasCommits = ({
  provider,
  owner,
  repo,
  branch,
  opts,
}: UseBranchCommitsArgs) => {
  return useQuery({
    queryKey: ['GetBranchCommits', provider, owner, repo, branch],
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
      }).then((res) => {
        const parsedData = GetBranchCommitsSchema.safeParse(res.data)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
          })
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
          })
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return Promise.reject({
            status: 403,
            data: {
              detail: (
                <p>
                  Activation is required to view this repo, please{' '}
                  {/* @ts-expect-error - A hasn't been typed yet */}
                  <A to={{ pageName: 'membersTab' }}>click here </A> to activate
                  your account.
                </p>
              ),
            },
          })
        }

        const edges = data?.owner?.repository?.commits?.edges
        if (isArray(edges)) {
          return edges?.length > 0
        }

        return false
      }),
    ...(!!opts && opts),
  })
}
