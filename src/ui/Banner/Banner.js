import cs from 'classnames'
import PropTypes from 'prop-types'

const baseClass = `bg-ds-gray-primary text-ds-gray-octonary p-4 shadow-lg`

const variantClasses = {
  default: `border-l-4 border-ds-blue-quinary`,
  plain: `border-none`,
}

function Banner({ children, variant = 'default' }) {
  return (
    <div className={cs(baseClass, variantClasses[variant])}>{children}</div>
  )
}

Banner.propTypes = {
  variant: PropTypes.oneOf(['default', 'plain']),
}

export default Banner
