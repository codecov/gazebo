import { TBundleAnalysisComparisonResult } from 'pages/CommitDetailPage/hooks'
import { ComparisonReturnType } from 'shared/utils/comparison'
import A from 'ui/A'
import Banner from 'ui/Banner'

interface Props {
  errorType?: TBundleAnalysisComparisonResult
}

const BannerContent: React.FC<Props> = ({ errorType }) => {
  if (errorType === ComparisonReturnType.MISSING_BASE_COMMIT) {
    return (
      <>
        {' '}
        <h1 className="font-semibold">Missing Base Commit</h1>
        <div className="flex gap-1">
          <span>
            Unable to compare commit because no base commit was found.
          </span>
          <A
            hook="compare errors"
            to={{ pageName: 'missingComparisonCommit' }}
            isExternal={true}
          >
            Learn more here
          </A>
        </div>
      </>
    )
  }

  if (errorType === ComparisonReturnType.MISSING_HEAD_COMMIT) {
    return (
      <>
        {' '}
        <h1 className="font-semibold">Missing Head Commit</h1>
        <div className="flex gap-1">
          <span>
            Unable to compare commits because the head commit of the commit is
            not found.
          </span>
          <A
            hook="compare errors"
            to={{ pageName: 'missingComparisonCommit' }}
            isExternal={true}
          >
            Learn more here
          </A>
        </div>
      </>
    )
  }

  if (errorType === ComparisonReturnType.MISSING_HEAD_REPORT) {
    return (
      <>
        {' '}
        <h1 className="font-semibold">Missing Head Report</h1>
        <div className="flex gap-1">
          <span>
            Unable to compare commits because the head of the commit request did
            not upload a bundle analysis report.
          </span>
          <A
            hook="compare errors"
            to={{ pageName: 'missingComparisonReport' }}
            isExternal={true}
          >
            Learn more here
          </A>
        </div>
      </>
    )
  }

  if (errorType === 'MissingComparison') {
    return (
      <>
        {' '}
        <h1 className="font-semibold">Missing Comparison</h1>
        <div className="flex gap-1">
          <span>
            There was an error computing the comparison for the head and base
            commits.
          </span>
          <A
            hook="compare errors"
            to={{ pageName: 'missingComparisonReport' }}
            isExternal={true}
          >
            Learn more here
          </A>
        </div>
      </>
    )
  }

  if (errorType === ComparisonReturnType.MISSING_BASE_REPORT) {
    return (
      <>
        {' '}
        <h1 className="font-semibold">Missing Base Report</h1>
        <div className="flex gap-1">
          <span>
            Unable to compare commit because the commit did not upload a bundle
            analysis report.
          </span>
          <A
            hook="compare errors"
            to={{ pageName: 'missingComparisonReport' }}
            isExternal={true}
          >
            Learn more here
          </A>
        </div>
      </>
    )
  }

  return null
}

const ErrorBanner: React.FC<Props> = ({ errorType }) => {
  return (
    <Banner variant="warning">
      <div className="flex flex-col gap-6 text-sm">
        <BannerContent errorType={errorType} />
      </div>
    </Banner>
  )
}

export default ErrorBanner
