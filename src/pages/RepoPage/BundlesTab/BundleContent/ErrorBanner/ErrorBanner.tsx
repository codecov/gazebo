import { ComparisonReturnType } from 'shared/utils/comparison'
import A from 'ui/A'
import Banner from 'ui/Banner'

interface BannerProps {
  errorType?: string
}

const BannerContent: React.FC<BannerProps> = ({ errorType }) => {
  if (errorType === ComparisonReturnType.MISSING_HEAD_REPORT) {
    return (
      <>
        {' '}
        <h1 className="font-semibold">Missing Head Report</h1>
        <div className="flex gap-1">
          <span>
            Unable to compare commits because the head of the pull request did
            not upload a bundle stats file.
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

  return (
    <>
      {' '}
      <h1 className="font-semibold">Unknown Error</h1>
      <div className="flex gap-1">
        <span>
          An unknown error occurred while trying to load the bundle analysis
          reports.
        </span>
      </div>
    </>
  )
}

const ErrorBanner: React.FC<BannerProps> = ({ errorType }) => {
  return (
    <Banner variant="warning">
      <div className="flex flex-col gap-6 text-sm">
        <BannerContent errorType={errorType} />
      </div>
    </Banner>
  )
}

export default ErrorBanner
