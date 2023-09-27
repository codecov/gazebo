import PropTypes from 'prop-types'

import { ComparisonReturnType } from 'shared/utils/comparison'
import A from 'ui/A'
import Banner from 'ui/Banner'

function BannerContent({ errorType }) {
  if (errorType === ComparisonReturnType.MISSING_BASE_COMMIT) {
    return (
      <>
        {' '}
        <h1 className="font-semibold">Missing Base Commit</h1>
        <div className="flex gap-1">
          <span>
            Unable to compare commits because the base commit of the pull
            request is not found.
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
            Unable to compare commits because the head commit of the pull
            request is not found.
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

  if (errorType === ComparisonReturnType.MISSING_BASE_REPORT) {
    return (
      <>
        {' '}
        <h1 className="font-semibold">Missing Base Report</h1>
        <div className="flex gap-1">
          <span>
            Unable to compare commits because the base of the pull request did
            not upload a coverage report.
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

  if (errorType === ComparisonReturnType.MISSING_HEAD_REPORT) {
    return (
      <>
        {' '}
        <h1 className="font-semibold">Missing Head Report</h1>
        <div className="flex gap-1">
          <span>
            Unable to compare commits because the head of the pull request did
            not upload a coverage report.
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

  if (errorType === ComparisonReturnType.MISSING_COMPARISON) {
    return (
      <>
        {' '}
        <h1 className="font-semibold">Missing Comparison</h1>
        <div className="flex gap-1">
          <span>
            There was an error computing the comparison for the head and base
            commit.
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

BannerContent.propTypes = {
  errorType: PropTypes.oneOf(Object.values(ComparisonReturnType)),
}

function ErrorBanner({ errorType }) {
  return (
    <Banner variant="warning">
      <div className="flex flex-col gap-6 text-sm">
        <BannerContent errorType={errorType} />
      </div>
    </Banner>
  )
}

ErrorBanner.propTypes = {
  errorType: PropTypes.oneOf(Object.values(ComparisonReturnType)),
}

export default ErrorBanner
