import { ComparisonFragment } from '../constants'

export const query = `
  query ImpactedFileComparedWithParent(
    $owner: String!
    $repo: String!
    $commitid: String!
    $path: String!
    $filters: SegmentsFilters
  ) {
    owner(username: $owner) {
      repository: repositoryDeprecated(name: $repo) {
        commit(id: $commitid) {
          compareWithParent {
            ...ComparisonFragment
            ... on FirstPullRequest {
              message
            }
            ... on MissingBaseCommit {
              message
            }
            ... on MissingHeadCommit {
              message
            }
            ... on MissingComparison {
              message
            }
            ... on MissingBaseReport {
              message
            }
            ... on MissingHeadReport {
              message
            }
          }
        }
      }
    }
  }
  ${ComparisonFragment}
`
