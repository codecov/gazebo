export const query = `
  query PullPathContents(
    $owner: String!,
    $repo: String!,
    $pullId: Int!
    $path: String!
    $filters: PathContentsFilters!
  ) {
    owner(username: $owner) {
      repository: repositoryDeprecated(name: $repo) {
        repositoryConfig {
          indicationRange {
            upperRange
            lowerRange
          }
        }
        pull(id: $pullId) {
          head {
            commitid
            pathContents(path: $path, filters: $filters) {
              __typename
              ... on PathContents {
                results {
                  __typename
                  hits
                  misses
                  partials
                  lines
                  name
                  path
                  percentCovered
                  ... on PathContentFile {
                    isCriticalFile
                  }
                }
              }
              ... on UnknownPath {
                message
              }
              ... on MissingCoverage {
                message
              }
            }
          }
        }
      }
    }
  }
`
