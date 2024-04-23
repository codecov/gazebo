export const query = `
  query CommitPathContents(
    $name: String!
    $commit: String!
    $repo: String!
    $path: String!
    $filters: PathContentsFilters!
  ) {
    owner(username: $name) {
      username
      repository: repositoryDeprecated(name: $repo) {
        repositoryConfig {
          indicationRange {
            upperRange
            lowerRange
          }
        }
        commit(id: $commit) {
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
              __typename
            }
            ... on UnknownPath {
              message
            }
            ... on MissingCoverage {
              message
            }
            ... on MissingHeadReport {
              message
            }
            ... on UnknownFlags {
              message
            }
          }
        }
      }
    }
  }
`
