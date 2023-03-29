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
      repository(name: $repo) {
        commit(id: $commitid) {
          compareWithParent {
            ...ComparisonFragment
          }
        }
      }
    }
  }
  ${ComparisonFragment}
`
