export const query = `
  query PullComponentComparison(
    $owner: String!
    $repo: String!
    $pullId: Int!
  ) {
    owner(username: $owner) {
      repository: repositoryDeprecated(name: $repo) {
        pull(id: $pullId) {
          compareWithBase {
            __typename
            ... on Comparison {
              componentComparisons {
                name
                patchTotals {
                  percentCovered
                }
                headTotals {
                  percentCovered
                }
                baseTotals {
                  percentCovered
                }
              }
            }
          }
        }
      }
    }
  }
`
