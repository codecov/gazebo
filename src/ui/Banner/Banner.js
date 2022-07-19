import cs from 'classnames'
import PropTypes from 'prop-types'

const baseClass = `bg-ds-gray-primary text-ds-gray-octonary p-4 shadow-lg`

const variantClasses = {
  default: `border-l-4 border-ds-blue-quinary`,
  plain: `border-none`,
}

// I think this banner could be redesigned to be more composable in the future
function Banner({ title, children, variant = 'default' }) {
  return (
    <div className={cs(baseClass, variantClasses[variant])}>
      <div className="flex justify-between items-center pb-2">
        {title && <h2 className="font-semibold">{title}</h2>}
      </div>
      <div className="text-sm md:w-5/6">{children}</div>
    </div>
  )
}

Banner.propTypes = {
  title: PropTypes.oneOfType([
    PropTypes.element.isRequired,
    PropTypes.string.isRequired,
  ]),
  variant: PropTypes.oneOf(['default', 'plain']),
}

export default Banner
