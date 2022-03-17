import some from 'lodash/some'

import CommitTitle from './CommitTitle'
import { usePullCommits } from './hooks'

import Card from '../Card'

function Commits() {
  const { data: commits } = usePullCommits()
  const hasHeadCoverage = some(commits, (commit) => commit?.headCoverage)
  const hasPatchCoverage = some(commits, (commit) => commit?.patchCoverage)
  const hasChangeCoverage = some(commits, (commit) => commit?.changeCoverage)

  return (
    <Card
      title={
        <CommitTitle
          hasHeadCoverage={hasHeadCoverage}
          hasPatchCoverage={hasPatchCoverage}
          hasChangeCoverage={hasChangeCoverage}
        />
      }
    >
      {commits.map(
        ({
          headCoverage,
          patchCoverage,
          changeCoverage,
          message,
          commitid,
          author,
        }) => {
          return (
            <div
              key={commitid}
              className="py-4 flex justify-between items-center first:pt-0 last:pb-0 text-ds-gray-octonary"
            >
              <div className="text-sm">
                <p className="font-semibold">{message}</p>
                <p>
                  <span className="text-ds-gray-quaternary">by</span> {author}
                </p>
              </div>
              {headCoverage && <div>{headCoverage}</div>}
              {patchCoverage && <div>{patchCoverage}</div>}
              {changeCoverage && <div>{changeCoverage}</div>}
            </div>
          )
        }
      )}
    </Card>
  )
}

export default Commits
