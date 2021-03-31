import BBAvatar from './BBAvatar'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

function Avatar({ user, alt, className }) {
  const { provider } = useParams()
  return (
    <>
      {provider !== 'bb' && (
        <img className={className} src={user.avatarUrl} alt={alt} />
      )}
      {provider === 'bb' && <BBAvatar text={user.username[0]} />}
    </>
  )
}

Avatar.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string.isRequired,
  }),
  alt: PropTypes.string,
}

export default Avatar
