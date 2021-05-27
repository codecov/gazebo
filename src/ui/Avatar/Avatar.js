import cs from 'classnames'
import PropTypes from 'prop-types'
import { useImage } from 'react-image'
import AvatarSVG from './AvatarSVG.js'

let baseClasses = 'rounded-full h-6 w-6 flex items-center justify-center'
let borderedClasses = 'border-ds-grey-secondary border-2'

function Avatar({ user, bordered, ariaLabel }) {
  const classes = cs(baseClasses, bordered ? borderedClasses : '')

  const { src, error } = useImage({
    srcList: user.avatarUrl,
    useSuspense: false,
  })

  const letter = user.username ? user.username[0] : '?'
  const alt = 'avatar'

  return (
    <>
      {error ? (
        <AvatarSVG letter={letter} ariaLabel={ariaLabel} />
      ) : (
        <img src={src} alt={alt} className={classes} />
      )}
    </>
  )
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
