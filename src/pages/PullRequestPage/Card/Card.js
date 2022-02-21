import PropTypes from 'prop-types'

export default function Card({ title, children }) {
  return (
    <div>
      <div className="border-t border-l border-r border-ds-gray-secondary p-4 semibold text-base">
        {title}
      </div>
      <div className="bg-ds-gray-primary p-4 max-h-80 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

Card.propTypes = {
  title: PropTypes.string.isRequired,
}
