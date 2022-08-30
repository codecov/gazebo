import cs from 'classnames'
import PropTypes from 'prop-types'

const baseClass = `bg-ds-gray-primary text-ds-gray-octonary p-4 shadow-lg`

const variantClasses = {
  default: `border-l-4 border-ds-blue-quinary`,
  plain: `border-none`,
  warning: `border-l-4 border-orange-500 bg-orange-100`,
}

function Banner({ heading, children, variant = 'default' }) {
  return (
    <div className={cs(baseClass, variantClasses[variant])}>
      <div className="flex justify-between items-center pb-2">{heading}</div>
      <div className="text-sm md:w-5/6">{children}</div>
    </div>
  )
}

Banner.propTypes = {
  variant: PropTypes.oneOf(['default', 'plain', 'warning']),
  heading: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
    .isRequired,
}

export default Banner
