import isNumber from 'lodash/isNumber'
import { useParams } from 'react-router-dom'

import { useCommitBADropdownSummary } from 'services/commit/useCommitBADropdownSummary'
import { formatSizeToString } from 'shared/utils/bundleAnalysis'

interface URLParams {
  provider: string
  owner: string
  repo: string
  commit: string
}

const BundleMessage: React.FC = () => {
  const { provider, owner, repo, commit: commitSha } = useParams<URLParams>()
  const { data } = useCommitBADropdownSummary({
    provider,
    owner,
    repo,
    commitid: commitSha,
  })

  if (
    data?.commit?.bundleAnalysisCompareWithParent?.__typename ===
    'FirstPullRequest'
  ) {
    return (
      <>
        <span className="font-semibold">Bundle Report: </span>
        once merged to default, your following pull request and commits will
        include report details &#x2139;
      </>
    )
  }

  let errorMsg: string | undefined
  let errorType: string | undefined
  if (
    data?.commit?.bundleAnalysisCompareWithParent?.__typename !==
    'BundleAnalysisComparison'
  ) {
    errorType = data?.commit?.bundleAnalysisCompareWithParent?.__typename
    errorMsg = data?.commit?.bundleAnalysisCompareWithParent?.message
  }

  if (errorType && errorMsg) {
    return (
      <>
        <span className="font-semibold">Bundle Report: </span>
        {errorMsg.toLowerCase()} &#x26A0;
      </>
    )
  }

  let sizeDelta: number | undefined
  if (
    data?.commit?.bundleAnalysisCompareWithParent?.__typename ===
    'BundleAnalysisComparison'
  ) {
    sizeDelta = data?.commit?.bundleAnalysisCompareWithParent?.sizeDelta
  }

  if (isNumber(sizeDelta)) {
    const positiveSize = Math.abs(sizeDelta)
    if (sizeDelta < 0) {
      return (
        <>
          <span className="font-semibold">Bundle Report: </span>
          changes will decrease total bundle size by{' '}
          {formatSizeToString(positiveSize)} &#x2139;
        </>
      )
    }

    if (sizeDelta > 0) {
      return (
        <>
          <span className="font-semibold">Bundle Report: </span>changes will
          increase total bundle size by {formatSizeToString(positiveSize)}{' '}
          &#x2139;
        </>
      )
    }

    return (
      <>
        <span className="font-semibold">Bundle Report: </span>bundle size has no
        change &#x2705;
      </>
    )
  }

  return (
    <>
      <span className="font-semibold">Bundle Report: </span>an unknown error
      occurred
    </>
  )
}

export default BundleMessage
