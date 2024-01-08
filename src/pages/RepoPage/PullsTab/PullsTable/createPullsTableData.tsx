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
        <TotalsNumber
          plain={true}
          large={false}
          light={false}
          value={patch}
          showChange={false}
        />
      ),
      coverage: (
        <Coverage
          head={pull?.head}
          state={pull?.state ?? 'OPEN'}
          pullId={pullId}
        />
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
