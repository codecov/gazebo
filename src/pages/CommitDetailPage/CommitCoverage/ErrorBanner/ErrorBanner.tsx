import {
  ComparisonReturnType,
  type TComparisonReturnType,
} from 'shared/utils/comparison'
import A from 'ui/A'
import { Alert } from 'ui/Alert'

interface Props {
  errorType: TComparisonReturnType
}

const BannerContent: React.FC<Props> = ({ errorType }) => {
  if (errorType === ComparisonReturnType.MISSING_BASE_COMMIT) {
    return (
      <>
        <Alert.Title>Missing Base Commit</Alert.Title>
        <Alert.Description>
          <span className="flex flex-wrap gap-1">
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
              Unable to compare commits because the head commit is not found.
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
              Unable to compare commit because the commit did not upload a
              coverage report.
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
              Unable to compare commits because the head of the commit request
              did not upload a coverage report.
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
              commits.
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

const ErrorBanner: React.FC<Props> = ({ errorType }) => {
  return (
    <Alert variant="warning">
      <BannerContent errorType={errorType} />
    </Alert>
  )
}

export default ErrorBanner
