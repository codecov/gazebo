import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'
import { mapEdges } from 'shared/utils/graphql'

const query = `
  query GetAllBranches($owner: String!, $repo: String!) {
    owner(username: $owner) {
      repository(name: $repo) {
        branches {
          edges {
            node {
              name
              head {
                commitid
              }
            }
          }
        }
      }
    }
  }
`

// WARNING: Use this hook if only necessary, it loads all of the branches and could
// possibly increase load times substantially, please reach for the paginated
// version first, and then reach for this hook.

export const useAllBranches = ({ provider, owner, repo, opts = {} }) =>
  useQuery({
    queryKey: ['GetAllBranches', provider, owner, repo],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
        },
      }).then((res) => ({
        branches: mapEdges(res?.data?.owner?.repository?.branches),
      })),
    ...opts,
  })
