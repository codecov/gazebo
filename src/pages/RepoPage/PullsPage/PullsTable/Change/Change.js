import PropTypes from 'prop-types'

const Change = ({ pull }) => {
  if (!pull?.head?.totals?.coverage) return ''
  const change = pull?.compareWithBase?.patchTotals?.coverage

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
  pull: PropTypes.shape({
    author: PropTypes.shape({
      username: PropTypes.string,
    }),
    compareWithBase: PropTypes.shape({
      patchTotals: PropTypes.shape({
        coverage: PropTypes.number,
      }),
    }),
    head: PropTypes.shape({
      totals: PropTypes.shape({
        coverage: PropTypes.number,
      }),
    }),
    pullId: PropTypes.number,
    state: PropTypes.string,
    title: PropTypes.string,
    updatestamp: PropTypes.string,
  }),
}

export default Change
