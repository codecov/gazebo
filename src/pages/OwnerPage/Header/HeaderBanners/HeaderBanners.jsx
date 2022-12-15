import PropTypes from 'prop-types'

import config from 'config'

import { useAccountDetails } from 'services/account'
import { useUploadsNumber } from 'services/uploadsNumber'

import ExceededUploadsAlert from './ExceededUploadsAlert'
import FeedbackBanner from './FeedbackBanner'
import GithubConfigBanner from './GithubConfigBanner'
import ReachingUploadLimit from './ReachingUploadLimit'

const MAX_UPLOADS_NUMBER = 250
const REACHING_UPLOAD_LIMIT = 225

const useUploadsInfo = ({ provider, owner }) => {
  const { data: numberOfUploads } = useUploadsNumber({
    provider,
    owner: owner?.username,
  })

  const isUploadsExceeded = numberOfUploads >= MAX_UPLOADS_NUMBER
  const isUploadsReachingLimit =
    numberOfUploads < MAX_UPLOADS_NUMBER &&
    numberOfUploads >= REACHING_UPLOAD_LIMIT

  return { isUploadsExceeded, isUploadsReachingLimit }
}

const AlertBanners = ({
  isUploadsExceeded,
  isUploadsReachingLimit,
  hasGhApp,
}) => {
  return (
    <>
      {isUploadsExceeded && <ExceededUploadsAlert />}
      {isUploadsReachingLimit && <ReachingUploadLimit />}
      {!hasGhApp && <GithubConfigBanner />}
    </>
  )
}

AlertBanners.propTypes = {
  isUploadsExceeded: PropTypes.bool.isRequired,
  isUploadsReachingLimit: PropTypes.bool.isRequired,
  hasGhApp: PropTypes.bool.isRequired,
}

export default function HeaderBanners({ provider, owner }) {
  const { data: accountDetails } = useAccountDetails({
    provider,
    owner: owner?.username,
  })

  const { isUploadsExceeded, isUploadsReachingLimit } = useUploadsInfo({
    provider,
    owner: owner?.username,
  })

  const hasGhApp = !!accountDetails?.integrationId

  if (config.IS_SELF_HOSTED) {
    return null
  }

  const showFeedbackBanner =
    hasGhApp && !isUploadsReachingLimit && !isUploadsExceeded

  if (showFeedbackBanner) {
    return <FeedbackBanner provider={provider} />
  }

  return (
    <AlertBanners
      isUploadsExceeded={isUploadsExceeded}
      isUploadsReachingLimit={isUploadsReachingLimit}
      hasGhApp={hasGhApp}
    />
  )
}

HeaderBanners.propTypes = {
  owner: PropTypes.shape({
    username: PropTypes.string.isRequired,
    isCurrentUserPartOfOrg: PropTypes.bool.isRequired,
  }).isRequired,
  provider: PropTypes.string.isRequired,
}
