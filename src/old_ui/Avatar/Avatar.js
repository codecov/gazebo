import BBAvatar from './BBAvatar'
import PropTypes from 'prop-types'

import get from 'lodash/get'

function Avatar({ username, alt, className, avatarUrl }) {
  return (
    <>
      {avatarUrl && <img className={className} src={avatarUrl} alt={alt} />}
      {!avatarUrl && <BBAvatar text={get(username, 0, '?')} />}
    </>
  )
}

Avatar.propTypes = {
  username: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  alt: PropTypes.string,
}

export default Avatar
