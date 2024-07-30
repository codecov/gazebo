import PropTypes from 'prop-types'

import { ComparisonReturnType } from 'shared/utils/comparison'
import A from 'ui/A'
import { Alert } from 'ui/Alert'

function BannerContent({ errorType }) {
  if (errorType === ComparisonReturnType.MISSING_BASE_COMMIT) {
    return (
      <>
        <Alert.Title>Missing Base Commit</Alert.Title>
        <Alert.Description>
          <span className="flex flex-wrap gap-1">
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
          </span>
        </Alert.Description>
      </>
    )
  }

  if (errorType === ComparisonReturnType.MISSING_HEAD_COMMIT) {
    return (
      <>
        <Alert.Title>Missing Head Commit</Alert.Title>
        <Alert.Description>
          <span className="flex flex-wrap gap-1">
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
          </span>
        </Alert.Description>
      </>
    )
  }

  if (errorType === ComparisonReturnType.MISSING_BASE_REPORT) {
    return (
      <>
        <Alert.Title>Missing Base Report</Alert.Title>
        <Alert.Description>
          <span className="flex flex-wrap gap-1">
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
          </span>
        </Alert.Description>
      </>
    )
  }

  if (errorType === ComparisonReturnType.MISSING_HEAD_REPORT) {
    return (
      <>
        <Alert.Title>Missing Head Report</Alert.Title>
        <Alert.Description>
          <span className="flex flex-wrap gap-1">
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
          </span>
        </Alert.Description>
      </>
    )
  }

  if (errorType === ComparisonReturnType.MISSING_COMPARISON) {
    return (
      <>
        <Alert.Title>Missing Comparison</Alert.Title>
        <Alert.Description>
          <span className="flex flex-wrap gap-1">
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
          </span>
        </Alert.Description>
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
    <Alert variant="warning">
      <BannerContent errorType={errorType} />
    </Alert>
  )
}

ErrorBanner.propTypes = {
  errorType: PropTypes.oneOf(Object.values(ComparisonReturnType)),
}

export default ErrorBanner
