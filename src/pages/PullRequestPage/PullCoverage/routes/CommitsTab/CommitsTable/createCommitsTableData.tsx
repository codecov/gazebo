import isArray from 'lodash/isArray'
import isEmpty from 'lodash/isEmpty'

import {
  Commit,
  COMMIT_STATUS_COMPLETED,
  COMMIT_STATUS_ERROR,
  COMMIT_STATUS_PENDING,
} from 'services/commits/useCommits'
import { formatSizeToString } from 'shared/utils/bundleAnalysis'
import TotalsNumber from 'ui/TotalsNumber'

import Title from './Title'

export const ErroredUpload = () => (
  <p>
    Upload: <span aria-label="Errored upload">&#x274C;</span>
  </p>
)
export const PendingUpload = () => (
  <p>
    Upload: <span aria-label="Pending upload">&#x23F3;</span>
  </p>
)

interface CommitsTableData {
  pages?: Array<{ commits: Array<Commit | null> }>
}

export const createCommitsTableData = ({ pages }: CommitsTableData) => {
  if (!isArray(pages)) {
    return []
  }

  const commits = pages?.map((page) => page?.commits).flat()

  if (isEmpty(commits)) {
    return []
  }

  return commits.filter(Boolean).map((commit) => {
    let patch = <p>-</p>
    if (commit?.coverageStatus === COMMIT_STATUS_ERROR) {
      patch = <ErroredUpload />
    } else if (commit?.coverageStatus === COMMIT_STATUS_PENDING) {
      patch = <PendingUpload />
    } else if (
      commit?.coverageStatus === COMMIT_STATUS_COMPLETED &&
      commit?.compareWithParent?.__typename === 'Comparison'
    ) {
      const percent =
        commit?.compareWithParent?.patchTotals?.percentCovered ?? NaN
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

    let bundleAnalysis = <p>-</p>
    if (commit?.bundleStatus === COMMIT_STATUS_ERROR) {
      bundleAnalysis = <ErroredUpload />
    } else if (commit?.bundleStatus === COMMIT_STATUS_PENDING) {
      bundleAnalysis = <PendingUpload />
    } else if (
      commit?.bundleStatus === COMMIT_STATUS_COMPLETED &&
      commit?.bundleAnalysis?.bundleAnalysisCompareWithParent?.__typename ===
        'BundleAnalysisComparison'
    ) {
      const change =
        commit?.bundleAnalysis?.bundleAnalysisCompareWithParent?.bundleChange
          ?.size?.uncompress
      const content = `${change > 0 ? '+' : ''}${formatSizeToString(change)}`
      bundleAnalysis = <p>{content}</p>
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
      patch,
      bundleAnalysis,
    }
  })
}
