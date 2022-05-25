import cs from 'classnames'
import PropTypes from 'prop-types'

const baseClasses =
  'text-xs px-1 py-2 border-solid border rounded border-box inline-block'

const lableClasses = {
  default: 'border-current',
  subtle: 'border-ds-gray-secondary text-ds-gray-senary bg-ds-gray-primary',
}

function Label({ children, variant = 'default' }) {
  return (
    <span className={cs(baseClasses, lableClasses[variant])}>{children}</span>
  )
}

Label.propTypes = {
  variant: PropTypes.oneOf(['default']),
}

export default Label
