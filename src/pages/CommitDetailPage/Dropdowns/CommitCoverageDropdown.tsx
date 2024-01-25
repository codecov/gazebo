import { useParams } from 'react-router-dom'

import { useCommitCoverageDropdownSummary } from 'services/commit/useCommitCoverageDropdownSummary'
import SummaryDropdown from 'ui/SummaryDropdown'

interface URLParams {
  provider: string
  owner: string
  repo: string
  commit: string
}

interface CoverageMessageProps {
  missesCount: number
  partialsCount: number
}

const CoverageMessage: React.FC<CoverageMessageProps> = ({
  missesCount,
  partialsCount,
}) => {
  const totalCount = missesCount + partialsCount

  if (totalCount === 0) {
    return <>all modified lines are covered by tests &#x2705;</>
  }

  if (totalCount === 1) {
    return <>{totalCount} line in your changes are missing coverage &#x26A0;</>
  }

  return <>{totalCount} lines in your changes are missing coverage</>
}

const CommitCoverageDropdown: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { provider, owner, repo, commit: commitSha } = useParams<URLParams>()
  const { data } = useCommitCoverageDropdownSummary({
    provider,
    owner,
    repo,
    commitid: commitSha,
  })

  if (
    !data ||
    data?.owner?.repository.__typename !== 'Repository' ||
    data.owner.repository.commit?.compareWithParent?.__typename !== 'Comparison'
  ) {
    return null
  }

  const missesCount =
    data.owner.repository.commit?.compareWithParent?.patchTotals?.missesCount ??
    0
  const partialsCount =
    data.owner.repository.commit?.compareWithParent?.patchTotals
      ?.partialsCount ?? 0

  return (
    <SummaryDropdown.Item value="coverage">
      <SummaryDropdown.Trigger>
        <p className="flex w-full flex-col sm:flex-row sm:gap-1">
          <span className="font-semibold">Coverage Report: </span>
          <CoverageMessage
            missesCount={missesCount}
            partialsCount={partialsCount}
          />
        </p>
      </SummaryDropdown.Trigger>
      <SummaryDropdown.Content className="pt-2">
        {children}
      </SummaryDropdown.Content>
    </SummaryDropdown.Item>
  )
}

export default CommitCoverageDropdown
