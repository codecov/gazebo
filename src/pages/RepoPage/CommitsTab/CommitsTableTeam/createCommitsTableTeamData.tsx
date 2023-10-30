import isArray from 'lodash/isArray'
import isEmpty from 'lodash/isEmpty'

import { Commit } from 'services/commits/useCommitsTeam'
import TotalsNumber from 'ui/TotalsNumber'

import CIStatus from '../shared/CIStatus'
import Title from '../shared/Title'

export const createCommitsTableTeamData = ({
  pages,
}: {
  pages?: Array<{ commits: Array<Commit | null> }>
}) => {
  let commits: Array<Commit | null> = []
  if (isArray(pages) && !isEmpty(pages)) {
    commits = pages?.map((page) => page?.commits).flat()
  }
  if (!isEmpty(commits)) {
    return commits.filter(Boolean).map((commit) => {
      let patchPercentage = NaN
      let patch = <p className="text-right">No report uploaded</p>
      if (commit?.compareWithParent?.__typename === 'Comparison') {
        patchPercentage =
          commit?.compareWithParent?.patchTotals?.percentCovered ?? 0
        patch = (
          <div className="text-right">
            <TotalsNumber
              plain={true}
              large={false}
              light={false}
              value={patchPercentage}
              showChange={false}
            />
          </div>
        )
      }

      return {
        name: (
          <Title
            message={commit?.message}
            author={commit?.author}
            commitid={commit?.commitid}
            createdAt={commit?.createdAt}
          />
        ),
        ciStatus: (
          <CIStatus
            ciPassed={commit?.ciPassed}
            commitid={commit?.commitid}
            coverage={patchPercentage}
          />
        ),
        patch,
      }
    })
  }

  return []
}
