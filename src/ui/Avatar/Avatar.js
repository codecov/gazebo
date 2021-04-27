import cs from 'classnames'
import PropTypes from 'prop-types'

let baseClasses = 'rounded-full h-6 w-6 flex items-center justify-center'
let borderedClasses = 'border-ds-grey-secondary border-2'

function Avatar({ avatarUrl, alt, bordered }) {
  const classes = cs(baseClasses, bordered ? borderedClasses : '')

  return <img src={avatarUrl} alt={alt} className={classes} />
}

Avatar.propTypes = {
  avatarUrl: PropTypes.string,
  alt: PropTypes.string,
  bordered: PropTypes.bool,
}

export default Avatar
