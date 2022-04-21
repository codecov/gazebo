import PropTypes from 'prop-types'

import { ErrorCodeEnum, UploadStateEnum } from 'shared/utils/commit'
import Icon from 'ui/Icon'

const UploadErrorMessage = {
  [ErrorCodeEnum.fileNotFoundInStorage]: 'processing failed',
  [ErrorCodeEnum.reportExpired]: 'upload expired',
  [ErrorCodeEnum.reportEmpty]: 'upload is empty',
  noMatch: 'unknown error',
}

function humanReadableError(errorCode) {
  if (typeof errorCode === 'string') {
    return (
      UploadErrorMessage[errorCode?.toUpperCase()] || UploadErrorMessage.noMatch
    )
  }
  return UploadErrorMessage.noMatch
}

const RenderError = ({ errors = [], state }) => (
  <>
    {errors.map(({ errorCode, i }) => (
      <span
        key={`errorCode-${errorCode}-${i}`}
        className="flex gap-1 items-center text-ds-primary-red"
      >
        <Icon size="sm" name="exclamation" variant="solid" />
        {humanReadableError(errorCode)}
      </span>
    ))}
    {errors.length === 0 &&
      typeof state === 'string' &&
      state?.toUpperCase() === UploadStateEnum.error && (
        <span className="flex gap-1 items-center text-ds-primary-red">
          <Icon size="sm" name="exclamation" variant="solid" />
          {humanReadableError()}
        </span>
      )}
  </>
)

RenderError.propTypes = {
  state: PropTypes.oneOf([
    UploadStateEnum.error,
    UploadStateEnum.uploaded,
    UploadStateEnum.processed,
  ]),
  errors: PropTypes.arrayOf(
    PropTypes.shape({
      errorCode: PropTypes.oneOf([
        ErrorCodeEnum.fileNotFoundInStorage,
        ErrorCodeEnum.reportEmpty,
        ErrorCodeEnum.reportExpired,
      ]),
    })
  ),
}

export default RenderError
