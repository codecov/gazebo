import isArray from 'lodash/isArray'
import isEmpty from 'lodash/isEmpty'

import { Pull } from 'services/pulls/usePullsTeam'
import TotalsNumber from 'ui/TotalsNumber'

import Title from '../shared/Title'

export const createPullsTableTeamData = ({
  pages,
}: {
  pages?: Array<{ pulls: Array<Pull> }>
}) => {
  if (!isArray(pages)) {
    return []
  }

  const pulls = pages?.map((pull) => pull?.pulls).flat()

  if (isEmpty(pulls)) {
    return []
  }

  return pulls.filter(Boolean).map((pull) => {
    let patch = <p className="text-right">No report uploaded</p>
    if (pull?.compareWithBase?.__typename === 'Comparison') {
      const patchPercentage =
        pull?.compareWithBase?.patchTotals?.percentCovered ?? 0
      patch = (
        <TotalsNumber
          plain={true}
          large={false}
          light={false}
          value={patchPercentage}
          showChange={false}
        />
      )
    }

    let bundleAnalysis = undefined
    if (
      pull?.head?.bundleAnalysisReport?.__typename === 'BundleAnalysisReport'
    ) {
      bundleAnalysis = <>Upload: &#x2705;</>
    } else {
      bundleAnalysis = <>Upload: &#x274C;</>
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
      patch,
      bundleAnalysis,
    }
  })
}
