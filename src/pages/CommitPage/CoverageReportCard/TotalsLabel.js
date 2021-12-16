import PropTypes from 'prop-types'

export default function TotalsLabel({ children, title }) {
  return (
    <div className="flex flex-col gap-1 justify-center">
      <h4 className="flex font-semibold gap-2 text-ds-gray-quinary font-mono text-xs">
        {title}
      </h4>
      <p className="text-xl text-center font-light">{children}</p>
    </div>
  )
}

TotalsLabel.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
}
