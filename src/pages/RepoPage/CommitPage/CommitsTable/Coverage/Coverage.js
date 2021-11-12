import Progress from 'ui/Progress'
import A from 'ui/A'
import PropTypes from 'prop-types'

const Coverage = ({ commit }) => {
  return (
    <div className="w-full justify-end flex flex-wrap md:flex-row md:flex-nowrap">
      <A to={{ pageName: 'commit', options: { commit: commit?.commitid } }}>
        <span className="mx-9 text-ds-gray-quinary font-mono">
          {commit?.commitid?.slice(0, 8)}
        </span>
      </A>
      {typeof commit?.totals?.coverage === 'number' ? (
        <span className="w-64">
          <Progress amount={commit?.totals?.coverage} label={true} />
        </span>
      ) : (
        <span className="text-ds-gray-quinary text-sm">
          No report uploaded yet
        </span>
      )}
    </div>
  )
}

Coverage.propTypes = {
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

export default Coverage
