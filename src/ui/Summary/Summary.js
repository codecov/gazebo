import PropTypes from 'prop-types'

import SummaryCard from 'ui/SummaryCard'

function mapLabels(labels) {
  return labels.map((label) => {
    const { name, title, value } = label
    return (
      title &&
      value && (
        <SummaryCard key={name} title={title}>
          {value}
        </SummaryCard>
      )
    )
  })
}

function Summary({ labels }) {
  const data = mapLabels(labels)

  return (
    data &&
    data.length > 0 && (
      <div className="flex gap-8 border-b border-ds-gray-secondary py-2">
        {data.map((child) => {
          return child
        })}
      </div>
    )
  )
}

Summary.propTypes = {
  labels: PropTypes.shape({
    head: PropTypes.object.isRequired,
    patch: PropTypes.number.isRequired,
    change: PropTypes.number.isRequired,
  }),
}

export default Summary
