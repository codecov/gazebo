export const queryForCommitFile = `
query CoverageForFile(
  $owner: String!
  $repo: String!
  $ref: String!
  $path: String!
) {
  owner(username: $owner) {
    repository: repositoryDeprecated(name: $repo) {
      commit(id: $ref) {
        ...CoverageForFile
      }
      branch(name: $ref) {
        name
        head {
          ...CoverageForFile
        }
      }
    }
  }
}

fragment CoverageForFile on Commit {
  commitid
  flagNames
  coverageFile(path: $path) {
    hashedPath
    isCriticalFile
    content
    coverage {
      line
      coverage
    }
    totals {
      coverage # Absolute coverage of the commit
    }
  }
}
`
