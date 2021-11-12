import PropTypes from 'prop-types'

const Change = ({ commit }) => {
  if (!commit?.totals?.coverage) return ''
  const change = commit?.compareWithParent?.patchTotals?.coverage

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
  commit: PropTypes.shape({
    author: PropTypes.shape({
      username: PropTypes.string,
    }),
    compareWithParent: PropTypes.shape({
      patchTotals: PropTypes.shape({
        coverage: PropTypes.number,
      }),
    }),
    totals: PropTypes.shape({
      coverage: PropTypes.number,
    }),
    commitid: PropTypes.string,
    message: PropTypes.string,
    createdAt: PropTypes.string,
  }),
}

export default Change
