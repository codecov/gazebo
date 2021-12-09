import Progress from 'ui/Progress'
import A from 'ui/A'
import PropTypes from 'prop-types'
import { CommitRequestType } from '../../types'

const Coverage = ({ commit }) => {
  return (
    <div className="w-full justify-center flex flex-wrap lg:flex-row lg:flex-nowrap lg:justify-end">
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
  commit: PropTypes.shape(CommitRequestType),
}

export default Coverage
