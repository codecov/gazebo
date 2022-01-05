import Progress from 'ui/Progress'
import A from 'ui/A'
import PropTypes from 'prop-types'

const Coverage = ({ commitid, totals }) => {
  return (
    <div className="w-full justify-center flex flex-wrap lg:flex-row lg:flex-nowrap lg:justify-end">
      <A to={{ pageName: 'commit', options: { commit: commitid } }}>
        <span className="mx-9 text-ds-gray-quinary font-mono">
          {commitid?.slice(0, 8)}
        </span>
      </A>
      {typeof totals?.coverage === 'number' ? (
        <span className="w-64">
          <Progress amount={totals?.coverage} label={true} />
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
  totals: PropTypes.shape({
    coverage: PropTypes.number,
  }),
  commitid: PropTypes.string,
}

export default Coverage
