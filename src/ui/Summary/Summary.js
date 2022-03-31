import PropTypes from 'prop-types'

import SummaryField from 'ui/SummaryField'

function Summary({ fields }) {
  return (
    fields &&
    fields.length > 0 && (
      <div className="flex gap-8 justify-start align-start">
        {fields.map((field) => {
          const { name, title, value } = field
          return (
            value && (
              <SummaryField key={name} title={title}>
                {value}
              </SummaryField>
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
      title: PropTypes.oneOfType([PropTypes.element, PropTypes.string])
        .isRequired,
      value: PropTypes.oneOfType([PropTypes.element, PropTypes.string])
        .isRequired,
    })
  ),
}

export default Summary
