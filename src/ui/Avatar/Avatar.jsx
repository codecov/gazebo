import cs from 'classnames'
import PropTypes from 'prop-types'

import { useImage } from 'services/image'

import AvatarSVG from './AvatarSVG'

let baseClasses = 'rounded-full h-6 w-6 flex items-center justify-center'
let borderedClasses = 'border-ds-grey-secondary border-2'

function Avatar({ user, bordered, ariaLabel }) {
  const classes = cs(baseClasses, bordered ? borderedClasses : '')

  const { src, error, isLoading } = useImage({
    src: user?.avatarUrl,
  })

  const letter = user?.username ? user.username[0] : '?'
  const alt = 'avatar'

  if (isLoading) {
    return (
      <div className="h-6 w-6 rounded-full bg-ds-gray-tertiary motion-safe:animate-pulse" />
    )
  }

  if (error) {
    return <AvatarSVG letter={letter} ariaLabel={ariaLabel} />
  }

  return <img src={src} alt={alt} className={classes} />
}

Avatar.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string,
  }),
  bordered: PropTypes.bool,
  ariaLabel: PropTypes.string,
}

export default Avatar
