import PropTypes from 'prop-types'

import A from 'ui/A'
import Banner from 'ui/Banner'

import { ComparisonReturnType } from './constants'

function BannerContent({ errorType }) {
  errorType = ComparisonReturnType.MISSING_BASE_REPORT
  return {
    [ComparisonReturnType.MISSING_BASE_COMMIT]: (
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
    ),
    [ComparisonReturnType.MISSING_HEAD_COMMIT]: (
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
    ),
    [ComparisonReturnType.MISSING_BASE_REPORT]: (
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
    ),
    [ComparisonReturnType.MISSING_HEAD_REPORT]: (
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
    ),
    [ComparisonReturnType.MISSING_COMPARISON]: (
      <>
        {' '}
        <h1 className="font-semibold">Missing Comparison</h1>
        <div className="flex gap-1">
          <span>Unable to compare head and base commits successfully.</span>
          <A
            hook="compare errors"
            to={{ pageName: 'missingComparisonReport' }}
            isExternal={true}
          >
            Learn more here
          </A>
        </div>
      </>
    ),
  }[errorType]
}

function ErrorBanner({ errorType }) {
  return (
    <Banner variant="warning">
      <div className="flex flex-col gap-6 text-sm">
        {BannerContent({ errorType })}
      </div>
    </Banner>
  )
}

ErrorBanner.propTypes = {
  errorType: PropTypes.oneOf(Object.values(ComparisonReturnType)),
}

export default ErrorBanner
