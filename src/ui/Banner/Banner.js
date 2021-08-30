import PropTypes from 'prop-types'

function Banner({ title, children }) {
  return (
    <div className="bg-ds-gray-primary text-ds-gray-octonary border-l-4 border-ds-blue-quinary p-4">
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
}

export default Banner
