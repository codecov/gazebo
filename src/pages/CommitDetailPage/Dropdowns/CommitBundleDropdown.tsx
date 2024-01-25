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
  sizeDelta: number
}

const BundleMessage: React.FC<BundleMessageProps> = ({ sizeDelta }) => {
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

  if (
    !data ||
    data?.owner?.repository.__typename !== 'Repository' ||
    data.owner.repository?.commit?.bundleAnalysisCompareWithParent
      ?.__typename !== 'BundleAnalysisComparison'
  ) {
    return null
  }

  const sizeDelta =
    data?.owner?.repository?.commit?.bundleAnalysisCompareWithParent?.sizeDelta

  return (
    <SummaryDropdown.Item value="bundle-analysis">
      <SummaryDropdown.Trigger>
        <p className="flex w-full flex-col sm:flex-row sm:gap-1">
          <span className="font-semibold">Bundle Report: </span>
          <BundleMessage sizeDelta={sizeDelta} />
        </p>
      </SummaryDropdown.Trigger>
      <SummaryDropdown.Content>{children}</SummaryDropdown.Content>
    </SummaryDropdown.Item>
  )
}

export default CommitBundleDropdown
