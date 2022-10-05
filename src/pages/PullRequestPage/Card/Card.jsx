import PropTypes from 'prop-types'

export default function Card({ title, children }) {
  return (
    <div className="border border-ds-gray-secondary">
      <div className="mx-4 mt-4 pb-4 font-semibold text-md border-b border-ds-gray-secondary flex justify-between items-baseline">
        {title}
      </div>
      <div className="mx-4 mb-4 pt-4 max-h-90 sm:max-h-80 overflow-y-auto divide-y border-ds-gray-secondary">
        {children}
      </div>
    </div>
  )
}

Card.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
}
