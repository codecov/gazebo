import isEmpty from 'lodash/isEmpty'
import PropTypes from 'prop-types'

function ErroredUploads({ erroredUploads }) {
  return (
    !isEmpty(erroredUploads) && (
      <div className="mt-4">
        <p className="font-semibold">
          No coverage data is available due to incomplete uploads on the first
          attempt.
        </p>
        <p className="mb-5">
          To receive coverage data, ensure your coverage data is accurate and
          then open a new commit.
        </p>
        <p>
          Note: this page will not reflect the latest results, even if you have
          re-run all jobs successfully or have merged this commit.
        </p>
      </div>
    )
  )
}

ErroredUploads.propTypes = {
  erroredUploads: PropTypes.object.isRequired,
}

export default ErroredUploads
