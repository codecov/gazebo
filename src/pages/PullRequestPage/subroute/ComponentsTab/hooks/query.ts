export const query = `
  query PullComponentComparison($owner: String!, $repo: String!, $pullId: Int!) {
    owner(username: $owner) {
      repository(name: $repo) {
        __typename
        ... on Repository {
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
        ... on NotFoundError {
          message
        }
        ... on OwnerNotActivatedError {
          message
        }
      }
    }
  }
`
