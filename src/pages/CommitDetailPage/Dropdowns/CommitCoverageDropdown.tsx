import { useParams } from 'react-router-dom'

import { useCommitCoverageDropdownSummary } from 'services/commit/useCommitCoverageDropdownSummary'
import SummaryDropdown from 'ui/SummaryDropdown'

interface URLParams {
  provider: string
  owner: string
  repo: string
  commit: string
}

const CoverageMessage: React.FC = () => {
  const { provider, owner, repo, commit: commitSha } = useParams<URLParams>()
  const { data } = useCommitCoverageDropdownSummary({
    provider,
    owner,
    repo,
    commitid: commitSha,
  })
  const comparison = data?.commit?.compareWithParent
  const uploadErrorCount = data?.uploadErrorCount

  if (!!uploadErrorCount) {
    if (uploadErrorCount === 1) {
      return (
        <>{uploadErrorCount} upload has failed to process &#x26A0;&#xFE0F;</>
      )
    }
    return (
      <>{uploadErrorCount} uploads have failed to process &#x26A0;&#xFE0F;</>
    )
  }

  if (comparison?.__typename === 'FirstPullRequest') {
    return (
      <>
        once merged to default, your following pull request and commits will
        include report details &#x2139;
      </>
    )
  }

  if (comparison?.__typename !== 'Comparison' && comparison?.message) {
    return <>{comparison?.message?.toLowerCase()} &#x26A0;&#xFE0F;</>
  }

  if (comparison?.__typename === 'Comparison') {
    const missesCount = comparison?.patchTotals?.missesCount ?? 0
    const partialsCount = comparison?.patchTotals?.partialsCount ?? 0
    const totalCount = missesCount + partialsCount

    if (totalCount === 0) {
      return <>all modified lines are covered by tests &#x2705;</>
    }

    if (totalCount === 1) {
      return (
        <>
          {totalCount} line in your changes is missing coverage &#x26A0;&#xFE0F;
        </>
      )
    }

    return (
      <>
        {totalCount} lines in your changes are missing coverage &#x26A0;&#xFE0F;
      </>
    )
  }

  return <>an unknown error has occurred &#x26A0;&#xFE0F;</>
}

const CommitCoverageDropdown: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <SummaryDropdown.Item value="coverage">
      <SummaryDropdown.Trigger>
        <p className="flex w-full flex-col text-base sm:flex-row sm:gap-1">
          <span className="font-semibold">Coverage report: </span>
          <CoverageMessage />
        </p>
      </SummaryDropdown.Trigger>
      <SummaryDropdown.Content className="pb-12 pt-2">
        {children}
      </SummaryDropdown.Content>
    </SummaryDropdown.Item>
  )
}

export default CommitCoverageDropdown
