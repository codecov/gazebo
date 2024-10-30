import isNumber from 'lodash/isNumber'
import { useParams } from 'react-router-dom'

import { useCommitBADropdownSummary } from 'services/commit/useCommitBADropdownSummary'
import { formatSizeToString } from 'shared/utils/bundleAnalysis'
import Icon from 'ui/Icon'

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

  const comparison =
    data?.commit?.bundleAnalysis?.bundleAnalysisCompareWithParent
  if (comparison?.__typename === 'FirstPullRequest') {
    return (
      <>
        <span className="font-semibold">Bundle report: </span>
        once merged to default, your following pull request and commits will
        include report details &#x2139;
      </>
    )
  }

  if (
    comparison?.__typename !== 'BundleAnalysisComparison' &&
    comparison?.message
  ) {
    return (
      <>
        <span className="font-semibold">Bundle report: </span>
        {comparison?.message.toLowerCase()} &#x26A0;&#xFE0F;
      </>
    )
  }

  if (
    comparison?.__typename === 'BundleAnalysisComparison' &&
    isNumber(comparison?.bundleChange?.size?.uncompress)
  ) {
    const uncompressDelta = comparison.bundleChange.size.uncompress
    const positiveSize = Math.abs(uncompressDelta)
    if (uncompressDelta < 0) {
      return (
        <>
          <span className="font-semibold">Bundle report: </span>
          changes will decrease total bundle size by{' '}
          {formatSizeToString(positiveSize)} &#x2139;
        </>
      )
    }

    if (uncompressDelta > 0) {
      return (
        <>
          <span className="font-semibold">Bundle report: </span>changes will
          increase total bundle size by {formatSizeToString(positiveSize)}{' '}
          &#x2139;
        </>
      )
    }

    return (
      <>
        <span className="font-semibold">Bundle report: </span>bundle size has no
        change &#x2705;
      </>
    )
  }

  return (
    <>
      <span className="font-semibold">Bundle report: </span>an unknown error
      occurred{' '}
      <Icon variant="solid" name="exclamation" className="fill-codecov-red" />
    </>
  )
}

export default BundleMessage
