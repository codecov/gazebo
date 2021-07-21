import Api from 'shared/api'
import { useQuery } from 'react-query'
import _ from 'lodash'

export function useFileCoverage({ provider, owner, repo, ref, path }) {
  const query = `
    query Commit($owner: String!, $repo: String!, $ref: String!, $path: String!) {
        owner(username: $owner) {
            repository(name: $repo){
              commit(id: $ref) {
                commitid
                coverageFile(path: $path) {
                  content
                  coverage {
                    line
                    coverage
                  }
                }
              }
              branch(name: $ref) {
                name
                head {
                  commitid
                  coverageFile(path: $path) {
                    content
                    coverage {
                      line
                      coverage
                    }
                  }
                }
              }
            }
        }
    }
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
      const fileCoverage = _.chain(coverageFile.coverage)
        .keyBy('line')
        .mapValues('coverage')
        .value()

      return {
        content: coverageFile.content,
        coverage: fileCoverage,
      }
    })
  })
}
