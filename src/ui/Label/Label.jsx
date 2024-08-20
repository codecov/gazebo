import cs from 'classnames'
import PropTypes from 'prop-types'

const baseClasses =
  'text-xs px-1 py-1.5 border-solid border rounded border-box inline-block'

const labelClasses = {
  default: 'border-current',
  subtle: 'border-ds-borderLine text-ds-gray-senary bg-ds-gray-primary',
}

function Label({ children, variant = 'default' }) {
  return (
    <span className={cs(baseClasses, labelClasses[variant])}>{children}</span>
  )
}

Label.propTypes = {
  variant: PropTypes.oneOf(['default', 'subtle']),
}

export default Label
