import PropTypes from 'prop-types'

import A from 'ui/A'
import CIStatusLabel from 'ui/CIStatus'

function CIStatus({ commitid, coverage, ciPassed }) {
  return (
    <div className="flex-1 flex-col items-end lg:flex">
      <A to={{ pageName: 'commit', options: { commit: commitid } }}>
        <span className="font-mono text-ds-gray-quinary">
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
