import PropTypes from 'prop-types'
import cs from 'classnames'

import AppLink from 'shared/AppLink'

const baseClass = `
  flex justify-center items-center gap-1
  border-solid border
  font-semibold rounded py-1 px-4 shadow-sm
  transition-colors duration-150 motion-reduce:transition-none

  focus:outline-none focus:ring

  disabled:cursor-not-allowed

  disabled:text-ds-gray-quaternary  disabled:border-ds-gray-tertiary
  disabled:bg-ds-gray-primary       disabled:text-ds-gray-primary     
`
const variantClasses = {
  default: `
    bg-white text-ds-gray-octornary border-ds-gray-quaternary

    hover:bg-ds-gray-secondary
  `,
  primary: `
    bg-ds-blue-medium text-white border-ds-blue-quinary
    
    hover:bg-ds-blue-darker
  `,
  danger: `
    text-ds-primary-red

    hover:text-white hover:border-ds-primary-red hover:bg-ds-primary-red
  `,
}

function Button({ to, variant = 'default', ...props }) {
  const className = cs(baseClass, variantClasses[variant])

  return to ? (
    <AppLink {...to} {...props} className={className} />
  ) : (
    <button {...props} className={className} />
  )
}

Button.propTypes = {
  to: PropTypes.shape(AppLink.propTypes),
  variant: PropTypes.oneOf(['default', 'primary', 'danger']),
}

export default Button
