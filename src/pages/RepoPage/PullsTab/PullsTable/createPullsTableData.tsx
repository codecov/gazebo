import isArray from 'lodash/isArray'

import { Pull } from 'services/pulls/usePulls'
import { formatSizeToString } from 'shared/utils/bundleAnalysis'
import TotalsNumber from 'ui/TotalsNumber'

import Title from './Title'

export const ErroredUpload = () => (
  <p>
    Upload: <span aria-label="error">&#x274C;</span>
  </p>
)
export const PendingUpload = () => (
  <p>
    Upload: <span aria-label="pending">&#x23F3;</span>
  </p>
)

export const createPullsTableData = ({ pulls }: { pulls?: Array<Pull> }) => {
  if (!isArray(pulls)) {
    return []
  }

  return pulls.filter(Boolean).map((pull: Pull) => {
    let patch = <p>-</p>
    if (pull?.head?.coverageStatus === 'ERROR') {
      patch = <ErroredUpload />
    } else if (pull?.head?.coverageStatus === 'PENDING') {
      patch = <PendingUpload />
    } else if (
      pull?.head?.coverageStatus === 'COMPLETED' &&
      pull?.compareWithBase?.__typename === 'Comparison'
    ) {
      const percent = pull?.compareWithBase?.patchTotals?.percentCovered ?? NaN
      patch = (
        <TotalsNumber
          plain={true}
          large={false}
          light={false}
          value={percent}
          showChange={false}
        />
      )
    }

    const updatestamp = pull?.updatestamp ?? undefined
    const title = pull?.title ?? 'Pull Request'
    const pullId = pull?.pullId ?? NaN

    let bundleAnalysis = <p>-</p>
    if (pull?.head?.bundleStatus === 'ERROR') {
      bundleAnalysis = <ErroredUpload />
    } else if (pull?.head?.bundleStatus === 'PENDING') {
      bundleAnalysis = <PendingUpload />
    } else if (
      pull?.head?.bundleStatus === 'COMPLETED' &&
      pull?.bundleAnalysisCompareWithBase?.__typename ===
        'BundleAnalysisComparison'
    ) {
      const change =
        pull?.bundleAnalysisCompareWithBase?.bundleChange?.size.uncompress
      const content = `${change > 0 ? '+' : ''}${formatSizeToString(change)}`
      bundleAnalysis = <p>{content}</p>
    }

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
