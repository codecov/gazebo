import PropTypes from 'prop-types'

const Change = ({ head, compareWithBase }) => {
  if (!head?.totals?.coverage) return ''
  const change = compareWithBase?.patchTotals?.coverage

  return (
    typeof change === 'number' && (
      <div className="flex justify-end w-full font-semibold">
        <span className={change <= 0 ? 'nf bg-red-100' : 'bg-green-100'}>
          {change}%
        </span>
      </div>
    )
  )
}

Change.propTypes = {
  head: PropTypes.shape({
    totals: PropTypes.shape({
      coverage: PropTypes.number,
    }),
  }),
  compareWithBase: PropTypes.shape({
    patchTotals: PropTypes.shape({
      coverage: PropTypes.number,
    }),
  }),
}

export default Change
