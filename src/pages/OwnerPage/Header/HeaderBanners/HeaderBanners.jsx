import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import config from 'config'

import { useOwnerPageData } from 'pages/OwnerPage/hooks'
import { useAccountDetails, usePlanData } from 'services/account'

import ExceededUploadsAlert from './ExceededUploadsAlert'
import GithubConfigBanner from './GithubConfigBanner'
import ReachingUploadLimit from './ReachingUploadLimit'

const useUploadsInfo = (planData) => {
  const { owner } = useParams()
  const { data: ownerData } = useOwnerPageData({ username: owner })
  const numberOfUploads = ownerData?.numberOfUploads

  // If monthlyUploadLimit is not defined, we consider the account can have an
  // unlimited amount of uploads
  const monthlyUploadLimit = planData?.plan?.monthlyUploadLimit
  const isUploadsExceeded = monthlyUploadLimit
    ? numberOfUploads >= monthlyUploadLimit
    : false
  const isUploadsReachingLimit = monthlyUploadLimit
    ? !isUploadsExceeded && numberOfUploads >= 0.9 * monthlyUploadLimit
    : false
  return { isUploadsExceeded, isUploadsReachingLimit }
}

const AlertBanners = ({
  isUploadsExceeded,
  isUploadsReachingLimit,
  hasGhApp,
  plan,
}) => {
  return (
    <>
      {!hasGhApp && <GithubConfigBanner />}
      {isUploadsExceeded ? (
        <ExceededUploadsAlert
          planName={plan.marketingName}
          monthlyUploadLimit={plan.monthlyUploadLimit}
        />
      ) : isUploadsReachingLimit ? (
        <ReachingUploadLimit
          planName={plan.marketingName}
          monthlyUploadLimit={plan.monthlyUploadLimit}
        />
      ) : null}
    </>
  )
}

AlertBanners.propTypes = {
  isUploadsExceeded: PropTypes.bool.isRequired,
  isUploadsReachingLimit: PropTypes.bool.isRequired,
  hasGhApp: PropTypes.bool.isRequired,
  plan: PropTypes.object,
}

export default function HeaderBanners() {
  const { owner, provider } = useParams()
  // TODO: refactor this to add a gql field for the integration id used to determine if the org has a GH app
  const { data: accountDetails } = useAccountDetails({
    provider,
    owner,
  })

  const { data: planData } = usePlanData({
    provider,
    owner,
  })
  const { isUploadsExceeded, isUploadsReachingLimit } = useUploadsInfo(planData)

  const hasGhApp = !!accountDetails?.integrationId

  if (config.IS_SELF_HOSTED) {
    return null
  }

  return (
    <>
      <AlertBanners
        isUploadsExceeded={isUploadsExceeded}
        isUploadsReachingLimit={isUploadsReachingLimit}
        hasGhApp={hasGhApp}
        plan={planData?.plan}
      />
    </>
  )
}
