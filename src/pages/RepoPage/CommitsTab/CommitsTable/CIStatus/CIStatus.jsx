import PropTypes from 'prop-types'

import A from 'ui/A'
import CIStatusLabel from 'ui/CIStatus'

function CIStatus({ commitid, coverage, ciPassed }) {
  return (
    <div className="flex-1 lg:flex flex-col gap-.5 items-end">
      <A to={{ pageName: 'commit', options: { commit: commitid } }}>
        <span className="text-ds-gray-quinary font-mono">
          {commitid?.slice(0, 8)}
        </span>
      </A>
      {coverage ? <CIStatusLabel ciPassed={ciPassed} /> : null}
    </div>
  )
}

CIStatus.propTypes = {
  commitid: PropTypes.string,
  coverage: PropTypes.number,
  ciPassed: PropTypes.bool,
}

export default CIStatus
