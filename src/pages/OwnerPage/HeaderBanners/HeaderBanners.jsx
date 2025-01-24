import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import config from 'config'

import { useOwnerPageData } from 'pages/OwnerPage/hooks'
import { useAccountDetails, usePlanData } from 'services/account'

import ExceededUploadsAlert from './ExceededUploadsAlert'
import GithubConfigBanner from './GithubConfigBanner'
import ReachingUploadLimitAlert from './ReachingUploadLimitAlert'

const useUploadsInfo = () => {
  const { owner, provider } = useParams()
  const { data: ownerData } = useOwnerPageData({ username: owner })
  const numberOfUploads = ownerData?.numberOfUploads
  const { data: planData } = usePlanData({
    provider,
    owner,
  })

  // If monthlyUploadLimit is not defined, we consider the account can have an
  // unlimited amount of uploads
  const monthlyUploadLimit = planData?.plan?.monthlyUploadLimit
  const isUploadLimitExceeded = monthlyUploadLimit
    ? numberOfUploads >= monthlyUploadLimit
    : false
  const isApproachingUploadLimit = monthlyUploadLimit
    ? !isUploadLimitExceeded && numberOfUploads >= 0.9 * monthlyUploadLimit
    : false
  return { isUploadLimitExceeded, isApproachingUploadLimit }
}

const AlertBanners = ({
  isUploadLimitExceeded,
  isApproachingUploadLimit,
  hasGhApp,
}) => {
  return (
    <>
      {!hasGhApp && <GithubConfigBanner />}
      {isUploadLimitExceeded ? (
        <ExceededUploadsAlert />
      ) : isApproachingUploadLimit ? (
        <ReachingUploadLimitAlert />
      ) : null}
    </>
  )
}

AlertBanners.propTypes = {
  isUploadLimitExceeded: PropTypes.bool.isRequired,
  isApproachingUploadLimit: PropTypes.bool.isRequired,
  hasGhApp: PropTypes.bool.isRequired,
}

export default function HeaderBanners() {
  const { owner, provider } = useParams()
  // TODO: refactor this to add a gql field for the integration id used to determine if the org has a GH app
  const { data: accountDetails } = useAccountDetails({
    provider,
    owner,
  })

  const { isUploadLimitExceeded, isApproachingUploadLimit } = useUploadsInfo()

  const hasGhApp = !!accountDetails?.integrationId

  if (config.IS_SELF_HOSTED) {
    return null
  }

  return (
    <>
      <AlertBanners
        isUploadLimitExceeded={isUploadLimitExceeded}
        isApproachingUploadLimit={isApproachingUploadLimit}
        hasGhApp={hasGhApp}
      />
    </>
  )
}
