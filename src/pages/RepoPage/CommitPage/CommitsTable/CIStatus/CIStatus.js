import A from 'ui/A'
import Icon from 'ui/Icon'
import PropTypes from 'prop-types'

const Status = ({ ciPassed }) => {
  return (
    <div className="flex">
      {ciPassed ? (
        <>
          <span className="text-green-600 mr-2">
            <Icon name="check" size="md" />
          </span>
          Passed
        </>
      ) : (
        <>
          <span className="text-red-600 mr-2">
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
    <div className="w-full justify-end lg:flex">
      <A to={{ pageName: 'commit', options: { commit: commitid } }}>
        <span className="mx-9 text-ds-gray-quinary font-mono">
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
