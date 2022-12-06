import PropTypes from 'prop-types'

import config from 'config'

import { useOnboardingTracking } from 'layouts/UserOnboarding/useOnboardingTracking'
import CopyClipboard from 'ui/CopyClipboard'

export default function Token({
  uploadToken,
  isCurrentUserPartOfOrg,
  privateRepo,
}) {
  const { copiedCIToken } = useOnboardingTracking()

  const hideToken = !privateRepo && !isCurrentUserPartOfOrg
  const token = `CODECOV_TOKEN=${uploadToken}`

  return (
    <div className="flex flex-col gap-2 px-4 py-2 border-2 border-ds-gray-primary">
      {!hideToken && (
        <p className="flex flex-row text-sm mt-4 gap-2 items-center">
          <span className="font-mono bg-ds-gray-secondary text-ds-gray-octonary h-auto xl:h-5">
            {token}
          </span>
          <CopyClipboard string={token} onClick={() => copiedCIToken(token)} />
        </p>
      )}
      {!config.IS_SELF_HOSTED && (
        <i className="font-light">
          *Not required if your repo is using GitHub Actions, Travic CI, Circle
          CI, AppVeyor, or Azure Pipelines.
        </i>
      )}
    </div>
  )
}
Token.propTypes = {
  uploadToken: PropTypes.string,
  isCurrentUserPartOfOrg: PropTypes.bool,
  privateRepo: PropTypes.bool,
}
