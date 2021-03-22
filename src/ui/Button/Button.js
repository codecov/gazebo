import PropTypes from 'prop-types'

import AppLink from 'shared/AppLink'

function Button({ to, ...props }) {
  const className = 'bg-blue-500'

  return to ? (
    <AppLink {...to} {...props} className={className} />
  ) : (
    <button {...props} className={className} />
  )
}

Button.propTypes = {
  to: PropTypes.shape(AppLink.propTypes),
}

export default Button
