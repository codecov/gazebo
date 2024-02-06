import isNumber from 'lodash/isNumber'
import { useParams } from 'react-router-dom'

import { usePullCoverageDropdownSummary } from 'services/pull/usePullCoverageDropdownSummary'
import SummaryDropdown from 'ui/SummaryDropdown'

interface URLParams {
  provider: string
  owner: string
  repo: string
  pullId: string
}

interface CoverageMessageProps {
  missesCount?: number
  partialsCount?: number
  errorType?: string
  errorMsg?: string
}

const CoverageMessage: React.FC<CoverageMessageProps> = ({
  missesCount,
  partialsCount,
  errorType,
  errorMsg,
}) => {
  if (errorType === 'FirstPullRequest') {
    return (
      <>
        once merged to default, your following pull request and commits will
        include report details &#x2139;
      </>
    )
  }

  if (errorType && errorMsg) {
    return <>{errorMsg.toLowerCase()} &#x26A0;</>
  }

  if (isNumber(missesCount) && isNumber(partialsCount)) {
    const totalCount = missesCount + partialsCount

    if (totalCount === 0) {
      return <>all modified lines are covered by tests &#x2705;</>
    }

    if (totalCount === 1) {
      return (
        <>{totalCount} line in your changes are missing coverage &#x26A0;</>
      )
    }

    return <>{totalCount} lines in your changes are missing coverage &#x26A0;</>
  }

  return <>an unknown error has occurred</>
}

const PullCoverageDropdown: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { provider, owner, repo, pullId } = useParams<URLParams>()
  const { data } = usePullCoverageDropdownSummary({
    provider,
    owner,
    repo,
    pullId: +pullId,
  })

  let missesCount: number | undefined
  let partialsCount: number | undefined
  if (data?.pull?.compareWithBase?.__typename === 'Comparison') {
    missesCount = data.pull?.compareWithBase?.patchTotals?.missesCount ?? 0
    partialsCount = data.pull?.compareWithBase?.patchTotals?.partialsCount ?? 0
  }

  let errorMsg: string | undefined = undefined
  let errorType: string | undefined = undefined
  if (data?.pull?.compareWithBase?.__typename !== 'Comparison') {
    errorType = data?.pull?.compareWithBase?.__typename
    errorMsg = data?.pull?.compareWithBase?.message
  }

  return (
    <SummaryDropdown.Item value="coverage">
      <SummaryDropdown.Trigger>
        <p className="flex w-full flex-col sm:flex-row sm:gap-1">
          <span className="font-semibold">Coverage report: </span>
          <CoverageMessage
            missesCount={missesCount}
            partialsCount={partialsCount}
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

export default PullCoverageDropdown
