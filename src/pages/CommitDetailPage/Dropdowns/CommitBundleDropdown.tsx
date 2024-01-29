import { isNumber } from 'lodash'
import { useParams } from 'react-router-dom'

import { useCommitBADropdownSummary } from 'services/commit/useCommitBADropdownSummary'
import { formatSizeToString } from 'shared/utils/bundleAnalysis'
import SummaryDropdown from 'ui/SummaryDropdown'

interface URLParams {
  provider: string
  owner: string
  repo: string
  commit: string
}

interface BundleMessageProps {
  sizeDelta?: number
  errorType?: string
  errorMsg?: string
}

const BundleMessage: React.FC<BundleMessageProps> = ({
  sizeDelta,
  errorType,
  errorMsg,
}) => {
  if (errorType && errorMsg) {
    return <>{errorMsg.toLowerCase()} &#x26A0;</>
  }

  if (isNumber(sizeDelta)) {
    const positiveSize = Math.abs(sizeDelta)
    if (sizeDelta < 0) {
      return (
        <>
          changes will decrease total bundle size by{' '}
          {formatSizeToString(positiveSize)} &#x2139;
        </>
      )
    }

    if (sizeDelta > 0) {
      return (
        <>
          changes will increase total bundle size by{' '}
          {formatSizeToString(positiveSize)} &#x2139;
        </>
      )
    }

    return <>bundle size has no change &#x2705;</>
  }

  return <>an unknown error occurred</>
}

const CommitBundleDropdown: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { provider, owner, repo, commit: commitSha } = useParams<URLParams>()
  const { data } = useCommitBADropdownSummary({
    provider,
    owner,
    repo,
    commitid: commitSha,
  })

  let sizeDelta: number | undefined
  if (
    data?.commit?.bundleAnalysisCompareWithParent?.__typename ===
    'BundleAnalysisComparison'
  ) {
    sizeDelta = data?.commit?.bundleAnalysisCompareWithParent?.sizeDelta
  }

  let errorMsg: string | undefined = undefined
  let errorType: string | undefined = undefined
  if (
    data?.commit?.bundleAnalysisCompareWithParent?.__typename !==
    'BundleAnalysisComparison'
  ) {
    errorType = data?.commit?.bundleAnalysisCompareWithParent?.__typename
    errorMsg = data?.commit?.bundleAnalysisCompareWithParent?.message
  }

  return (
    <SummaryDropdown.Item value="bundle-analysis">
      <SummaryDropdown.Trigger>
        <p className="flex w-full flex-col sm:flex-row sm:gap-1">
          <span className="font-semibold">Bundle Report: </span>
          <BundleMessage
            sizeDelta={sizeDelta}
            errorType={errorType}
            errorMsg={errorMsg}
          />
        </p>
      </SummaryDropdown.Trigger>
      <SummaryDropdown.Content className="py-2">
        {children}
      </SummaryDropdown.Content>
    </SummaryDropdown.Item>
  )
}

export default CommitBundleDropdown
