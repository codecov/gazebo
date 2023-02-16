import PropTypes from 'prop-types'

// Summary on Commit Detail and Compare using a config object instead of composition
// The newer preferred way is to import the Summary root and field yourself per implementation.
//
// TODO: Update Commit Detail and Compare pages to use the composable summary components instead.
function Summary({ fields }) {
  return (
    fields &&
    fields.length > 0 && (
      <div className="flex flex-wrap items-start justify-start gap-8 md:flex-nowrap">
        {fields.map(({ name, title, value }) => {
          // Below changes is the original SummaryField markup
          return (
            value && (
              <div key={name} className="flex flex-col justify-center gap-1">
                {title && (
                  <h4 className="flex gap-2 font-mono text-xs text-ds-gray-quinary">
                    {title}
                  </h4>
                )}
                {value && <div className="text-xl font-light">{value}</div>}
              </div>
            )
          )
        })}
      </div>
    )
  )
}

Summary.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      title: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
      value: PropTypes.oneOfType([PropTypes.element, PropTypes.string])
        .isRequired,
    })
  ),
}

export default Summary
