import cs from 'classnames'
import PropTypes from 'prop-types'

const baseClass = `bg-ds-blue-nonary text-ds-gray-octonary p-4 dark:bg-opacity-20`

const variantClasses = {
  default: `border-l-4 border-ds-blue-quinary`,
  plain: `border-none`,
  warning: `border-l-4 border-orange-500 bg-orange-100`,
}

function Banner({ children, variant = 'default' }) {
  return (
    <div className={cs(baseClass, variantClasses[variant])}>{children}</div>
  )
}

Banner.propTypes = {
  variant: PropTypes.oneOf(['default', 'plain', 'warning']),
}

export default Banner
