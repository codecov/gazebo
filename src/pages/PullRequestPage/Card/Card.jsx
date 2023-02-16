import PropTypes from 'prop-types'

export default function Card({ title, children }) {
  return (
    <div className="border border-ds-gray-secondary">
      <div className="text-md mx-4 mt-4 flex items-baseline justify-between border-b border-ds-gray-secondary pb-4 font-semibold">
        {title}
      </div>
      <div className="max-h-90 mx-4 mb-4 divide-y overflow-y-auto border-ds-gray-secondary pt-4 sm:max-h-80">
        {children}
      </div>
    </div>
  )
}

Card.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
}
