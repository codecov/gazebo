import PropTypes from 'prop-types'

import config from 'config'

import { useUploadsNumber } from 'services/uploadsNumber'

import ExceededUploadsAlert from './ExceededUploadsAlert'
import FeedbackBanner from './FeedbackBanner'
import ReachingUploadLimit from './ReachingUploadLimit'

const MAX_UPLOADS_NUMBER = 250
const REACHING_UPLOAD_LIMIT = 225

export default function HeaderBanners({ provider, owner }) {
  const { data: numberOfUploads } = useUploadsNumber({
    provider,
    owner: owner?.username,
  })

  if (config.IS_SELF_HOSTED) {
    return null
  }

  const isUploadsExceeded = numberOfUploads >= MAX_UPLOADS_NUMBER
  const isUploadsReachingLimit =
    numberOfUploads < MAX_UPLOADS_NUMBER &&
    numberOfUploads >= REACHING_UPLOAD_LIMIT

  if (isUploadsExceeded) {
    return <ExceededUploadsAlert />
  }

  if (isUploadsReachingLimit) {
    return <ReachingUploadLimit />
  }

  return <FeedbackBanner provider={provider} />
}

HeaderBanners.propTypes = {
  owner: PropTypes.shape({
    username: PropTypes.string.isRequired,
    isCurrentUserPartOfOrg: PropTypes.bool.isRequired,
  }).isRequired,
  provider: PropTypes.string.isRequired,
}
