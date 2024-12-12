import PropTypes from 'prop-types'

import { useImage } from 'services/image'
import { cn } from 'shared/utils/cn'

import AvatarSVG from './AvatarSVG'

const baseClasses = 'rounded-full h-6 w-6 flex items-center justify-center'
const borderClasses = {
  none: '',
  light: 'border-ds-gray-secondary border-2',
  dark: 'border-ds-gray-octonary border-2',
}

function Avatar({ user, border = 'none', ariaLabel, className = '' }) {
  const classes = cn(baseClasses, borderClasses[border], className)

  const { src, error, isLoading } = useImage({
    src: user?.avatarUrl,
  })

  const letter = user?.username ? user.username[0] : '?'
  const alt = 'avatar'

  if (isLoading) {
    return (
      <div className="size-6 rounded-full bg-ds-gray-tertiary motion-safe:animate-pulse" />
    )
  }

  if (error) {
    return <AvatarSVG letter={letter} ariaLabel={ariaLabel} />
  }

  return <img src={src} alt={alt} className={classes} />
}

Avatar.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    avatarUrl: PropTypes.string,
  }),
  border: PropTypes.oneOf(['light', 'dark', 'none']),
  ariaLabel: PropTypes.string,
}

export default Avatar
