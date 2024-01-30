import isNumber from 'lodash/isNumber'
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
  missesCount?: number
  partialsCount?: number
  errorType?: string
  errorMsg?: string
  uploadErrorCount?: number
}

const CoverageMessage: React.FC<CoverageMessageProps> = ({
  missesCount,
  partialsCount,
  errorType,
  errorMsg,
  uploadErrorCount,
}) => {
  if (uploadErrorCount && uploadErrorCount > 0) {
    if (uploadErrorCount === 1) {
      return <>{uploadErrorCount} upload has failed to process &#x26A0;</>
    }
    return <>{uploadErrorCount} uploads have failed to process &#x26A0;</>
  }

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

    return <>{totalCount} lines in your changes are missing coverage</>
  }

  return <>an unknown error has occurred</>
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

  let missesCount: number | undefined
  let partialsCount: number | undefined
  if (data?.commit?.compareWithParent?.__typename === 'Comparison') {
    missesCount = data.commit?.compareWithParent?.patchTotals?.missesCount ?? 0
    partialsCount =
      data.commit?.compareWithParent?.patchTotals?.partialsCount ?? 0
  }

  let errorMsg: string | undefined = undefined
  let errorType: string | undefined = undefined
  if (data?.commit?.compareWithParent?.__typename !== 'Comparison') {
    errorType = data?.commit?.compareWithParent?.__typename
    errorMsg = data?.commit?.compareWithParent?.message
  }

  const uploadErrorCount = data?.uploadErrorCount

  return (
    <SummaryDropdown.Item value="coverage">
      <SummaryDropdown.Trigger>
        <p className="flex w-full flex-col sm:flex-row sm:gap-1">
          <span className="font-semibold">Coverage Report: </span>
          <CoverageMessage
            missesCount={missesCount}
            partialsCount={partialsCount}
            errorType={errorType}
            errorMsg={errorMsg}
            uploadErrorCount={uploadErrorCount}
          />
        </p>
      </SummaryDropdown.Trigger>
      <SummaryDropdown.Content className="py-2">
        {children}
      </SummaryDropdown.Content>
    </SummaryDropdown.Item>
  )
}

export default CommitCoverageDropdown
