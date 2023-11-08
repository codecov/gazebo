import PropTypes from 'prop-types'

import A from 'ui/A'
import Icon from 'ui/Icon'

const Status = ({ ciPassed }) => {
  return (
    <div className="flex items-center gap-1">
      {ciPassed ? (
        <>
          <span className="text-green-600">
            <Icon name="check" size="md" />
          </span>
          Passed
        </>
      ) : (
        <>
          <span className="text-red-600">
            <Icon name="x" size="md" />
          </span>
          Failed
        </>
      )}
    </div>
  )
}

Status.propTypes = {
  ciPassed: PropTypes.bool,
}

function CIStatus({ commitid, coverage, ciPassed }) {
  return (
    <div className="flex-1 flex-col items-end lg:flex">
      <A to={{ pageName: 'commit', options: { commit: commitid } }}>
        <span className="font-mono text-ds-gray-quinary">
          {commitid?.slice(0, 8)}
        </span>
      </A>
      {coverage ? <Status ciPassed={ciPassed} /> : null}
    </div>
  )
}

CIStatus.propTypes = {
  commitid: PropTypes.string,
  coverage: PropTypes.number,
  ciPassed: PropTypes.bool,
}

export default CIStatus
