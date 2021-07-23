import Api from 'shared/api'
import { useQuery } from 'react-query'
import keyBy from 'lodash/keyBy'
import mapValues from 'lodash/mapValues'

const coverageFileFragment = `
    fragment CoverageForFile on Commit {
        commitid
        coverageFile(path: $path) {
            content
            coverage {
              line
              coverage
            }
        }
    }

`

export function useFileCoverage({ provider, owner, repo, ref, path }) {
  const query = `
    query Commit($owner: String!, $repo: String!, $ref: String!, $path: String!) {
        owner(username: $owner) {
            repository(name: $repo){
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
    ${coverageFileFragment}
    `
  return useQuery(['commit', provider, owner, repo, ref, path], () => {
    return Api.graphql({
      provider,
      query,
      variables: {
        provider,
        owner,
        repo,
        ref,
        path,
      },
    }).then((res) => {
      const commit = res?.data?.owner?.repository?.commit
      const branch = res?.data?.owner?.repository?.branch?.head
      const coverageSource = commit || branch
      const coverageFile = coverageSource.coverageFile
      if (!coverageFile) return null
      const lineWithCoverage = keyBy(coverageFile.coverage, 'line')
      const fileCoverage = mapValues(lineWithCoverage, 'coverage')
      return {
        content: coverageFile.content,
        coverage: fileCoverage,
      }
    })
  })
}
