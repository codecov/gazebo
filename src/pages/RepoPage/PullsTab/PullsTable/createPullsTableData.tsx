import isArray from 'lodash/isArray'

import { Pull } from 'services/pulls/usePulls'
import TotalsNumber from 'ui/TotalsNumber'

import Coverage from './Coverage'

import Title from '../shared/Title'

export const createPullsTableData = ({ pulls }: { pulls?: Array<Pull> }) => {
  if (!isArray(pulls)) {
    return []
  }
  return pulls.filter(Boolean).map((pull: Pull) => {
    if (!pull) {
      return {
        title: <div>-</div>,
        patch: <div>-</div>,
        coverage: <div>-</div>,
        change: <div>-</div>,
      }
    }

    let patch, change
    if (pull?.compareWithBase?.__typename === 'Comparison') {
      patch = pull?.compareWithBase?.patchTotals?.percentCovered ?? 0
      change = pull?.compareWithBase?.changeCoverage ?? 0
    }

    const updatestamp = pull?.updatestamp ?? undefined
    const title = pull?.title ?? 'Pull Request'
    const pullId = pull?.pullId ?? NaN

    return {
      title: (
        <Title
          author={{
            username: pull?.author?.username,
            avatarUrl: pull?.author?.avatarUrl,
          }}
          pullId={pullId}
          title={title}
          updatestamp={updatestamp}
          compareWithBaseType={pull?.compareWithBase?.__typename}
        />
      ),
      patch: (
        <div className="text-right">
          <TotalsNumber
            plain={true}
            large={false}
            light={false}
            value={patch}
            showChange={false}
          />
        </div>
      ),
      coverage: (
        <Coverage head={pull?.head} state={pull.state} pullId={pullId} />
      ),
      change: (
        <TotalsNumber
          value={change}
          showChange
          data-testid="change-value"
          plain={true}
          light={false}
          large={false}
        />
      ),
    }
  })
}
