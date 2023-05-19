import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import config from 'config'

import { useOwnerPageData } from 'pages/OwnerPage/hooks'
import { useAccountDetails } from 'services/account'

import ExceededUploadsAlert from './ExceededUploadsAlert'
import GithubConfigBanner from './GithubConfigBanner'
import ReachingUploadLimit from './ReachingUploadLimit'

const MAX_UPLOADS_NUMBER = 250
const REACHING_UPLOAD_LIMIT = 225

const useUploadsInfo = () => {
  const { owner } = useParams()
  const { data: ownerData } = useOwnerPageData({ username: owner })
  const numberOfUploads = ownerData?.numberOfUploads

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
      {!hasGhApp && <GithubConfigBanner />}
      {isUploadsExceeded ? (
        <ExceededUploadsAlert />
      ) : isUploadsReachingLimit ? (
        <ReachingUploadLimit />
      ) : null}
    </>
  )
}

AlertBanners.propTypes = {
  isUploadsExceeded: PropTypes.bool.isRequired,
  isUploadsReachingLimit: PropTypes.bool.isRequired,
  hasGhApp: PropTypes.bool.isRequired,
}

// eslint-disable-next-line complexity
export default function HeaderBanners() {
  const { owner, provider } = useParams()
  // TODO: refactor this to add a gql field for the integration id used to determine if the org has a GH app
  const { data: accountDetails } = useAccountDetails({
    provider,
    owner,
  })
  const { isUploadsExceeded, isUploadsReachingLimit } = useUploadsInfo()

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
      />
    </>
  )
}
