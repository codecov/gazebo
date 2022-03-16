import PropTypes from 'prop-types'

import SummaryCard from 'ui/SummaryCard'

function Summary({ cards }) {
  return (
    cards &&
    cards.length > 0 && (
      <div className="flex gap-8 border-b border-ds-gray-secondary py-2">
        {cards.map((card) => {
          const { name, title, value } = card
          return (
            title &&
            value && (
              <SummaryCard key={name} title={title}>
                {value}
              </SummaryCard>
            )
          )
        })}
      </div>
    )
  )
}

Summary.propTypes = {
  cards: PropTypes.arrayOf(
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
