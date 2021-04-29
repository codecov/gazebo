import cs from 'classnames'
import PropTypes from 'prop-types'
import { useImage } from 'react-image'
import AvatarSVG from './AvatarSVG.js'

let baseClasses = 'rounded-full h-6 w-6 flex items-center justify-center'
let borderedClasses = 'border-ds-grey-secondary border-2'

function Avatar({ user, bordered }) {
  const classes = cs(baseClasses, bordered ? borderedClasses : '')

  const { src, error } = useImage({
    srcList: user.avatarUrl,
    useSuspense: false,
  })

  const letter = user.userName ? user.userName[0] : '' // TODO default behavior?
  const alt = 'avatar'

  return (
    <>
      {!error && <img src={src} alt={alt} className={classes} />}
      {error && <AvatarSVG letter={letter} />}
    </>
  )
}

Avatar.propTypes = {
  user: PropTypes.shape({
    userName: PropTypes.string,
    avatarUrl: PropTypes.string,
  }),
  bordered: PropTypes.bool,
}

export default Avatar
