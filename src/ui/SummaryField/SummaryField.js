import PropTypes from 'prop-types'

export default function SummaryField({ children, title }) {
  return (
    <div className="flex flex-col gap-1 justify-center">
      <h4 className="flex font-semibold gap-2 text-ds-gray-quinary font-mono text-xs">
        {title}
      </h4>
      {children && <div className="text-xl font-light">{children}</div>}
    </div>
  )
}

SummaryField.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
}
