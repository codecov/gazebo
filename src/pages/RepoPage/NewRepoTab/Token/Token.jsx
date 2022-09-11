import PropTypes from 'prop-types'

import PrivateRepoScope from './PrivateRepoScope'
import PublicRepoScope from './PublicRepoScope'

export default function Token({
  uploadToken,
  isCurrentUserPartOfOrg,
  privateRepo,
}) {
  return (
    <div>
      {privateRepo ? (
        <PrivateRepoScope token={uploadToken} />
      ) : (
        <PublicRepoScope
          isCurrentUserPartOfOrg={isCurrentUserPartOfOrg}
          token={uploadToken}
        />
      )}
    </div>
  )
}
Token.propTypes = {
  uploadToken: PropTypes.string,
  isCurrentUserPartOfOrg: PropTypes.bool,
  privateRepo: PropTypes.bool,
}
