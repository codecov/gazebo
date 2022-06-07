import PropTypes from 'prop-types'

// Summary on Commit Detail and Compare using a config object instead of composition
// The newer prefered way is to import the Summary root and field yourself per implementation.
//
// TODO: Update Commit Detail and Compare pages to use the composable summary components instead.
function Summary({ fields }) {
  return (
    fields &&
    fields.length > 0 && (
      <div className="flex gap-8 justify-start align-start">
        {fields.map(({ name, title, value }) => {
          // Below changes is the orginal SummaryField markup
          return (
            value && (
              <div key={name} className="flex flex-col gap-1 justify-center">
                {title && (
                  <h4 className="flex gap-2 text-ds-gray-quinary font-mono text-xs">
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
