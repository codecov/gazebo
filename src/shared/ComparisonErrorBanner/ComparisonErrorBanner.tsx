import {
  ComparisonReturnType,
  TComparisonReturnType,
  TReportUploadType,
} from 'shared/utils/comparison'
import A from 'ui/A'
import { Alert } from 'ui/Alert'

interface ComparisonErrorBannerProps {
  errorType?: TComparisonReturnType
  reportType: TReportUploadType
}

const BannerContent: React.FC<ComparisonErrorBannerProps> = ({
  errorType,
  reportType,
}) => {
  if (errorType === ComparisonReturnType.MISSING_BASE_COMMIT) {
    return (
      <>
        <Alert.Title>Missing Base Commit</Alert.Title>
        <Alert.Description>
          <span className="flex flex-wrap gap-1">
            <span>
              Unable to compare commits because no base commit was found.
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
              Unable to compare commits because the head commit was not found.
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

  if (errorType === ComparisonReturnType.MISSING_HEAD_REPORT) {
    const description = `Unable to compare commits because the head commit did not upload a ${reportType} report.`
    return (
      <>
        <Alert.Title>Missing Head Report</Alert.Title>
        <Alert.Description>
          <span className="flex flex-wrap gap-1">
            {description}
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

  if (errorType === ComparisonReturnType.MISSING_BASE_REPORT) {
    const description = `Unable to compare commits because the base commit did not upload a ${reportType} report.`
    return (
      <>
        <Alert.Title>Missing Base Report</Alert.Title>
        <Alert.Description>
          <span className="flex flex-wrap gap-1">
            {description}
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

function ComparisonErrorBanner({
  errorType,
  reportType,
}: ComparisonErrorBannerProps) {
  return (
    <Alert variant="warning" data-testid="comparison-error-banner">
      <BannerContent errorType={errorType} reportType={reportType} />
    </Alert>
  )
}

export default ComparisonErrorBanner
