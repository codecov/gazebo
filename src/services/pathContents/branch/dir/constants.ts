export const query = `
query BranchContents(
  $name: String!
  $repo: String!
  $branch: String!
  $path: String!
  $filters: PathContentsFilters!
  $after: String
) {
  owner(username: $name) {
    username
    repository(name: $repo) {
      __typename
      ... on Repository {
        repositoryConfig {
          indicationRange {
            upperRange
            lowerRange
          }
        }
        branch(name: $branch) {
          head {
            deprecatedPathContents(path: $path, filters: $filters, first: 20, after: $after) {
              __typename
              ... on PathContentConnection {
                edges {
                  node {
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
                pageInfo {
                  hasNextPage
                  endCursor
                }
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
      ... on NotFoundError {
        message
      }
      ... on OwnerNotActivatedError {
        message
      }
    }
  }
}`
