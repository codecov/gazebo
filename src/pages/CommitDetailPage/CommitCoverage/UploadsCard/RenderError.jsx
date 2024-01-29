import PropTypes from 'prop-types'
import { useMemo } from 'react'

import { ErrorCodeEnum, UploadStateEnum } from 'shared/utils/commit'
import Icon from 'ui/Icon'

const UploadErrorMessage = Object.freeze({
  [ErrorCodeEnum.fileNotFoundInStorage]: 'processing failed',
  [ErrorCodeEnum.reportExpired]: 'upload expired',
  [ErrorCodeEnum.reportEmpty]: 'unusable report',
  noMatch: 'unknown error',
})

function humanReadableError(errorCode) {
  if (typeof errorCode === 'string') {
    return (
      UploadErrorMessage[errorCode?.toUpperCase()] || UploadErrorMessage.noMatch
    )
  }
  return UploadErrorMessage.noMatch
}

const generateText = (count, string) => ({
  readableError: count > 1 ? `${string} (${count})` : string,
})

const generateFinalErrors = ({
  processingFailedErrors,
  uploadExpiredErrors,
  uploadIsEmptyErrors,
  unknownErrors,
}) => {
  const newErrors = []

  if (processingFailedErrors > 0) {
    newErrors.push(
      generateText(
        processingFailedErrors,
        UploadErrorMessage.FILE_NOT_IN_STORAGE
      )
    )
  }

  if (uploadExpiredErrors > 0) {
    newErrors.push(
      generateText(uploadExpiredErrors, UploadErrorMessage.REPORT_EXPIRED)
    )
  }

  /*
   * As to why the text changed from upload is empty to  unusable report from Eli:
   * not really, because what it means is ''we processed this report just fine,
   * there's nothing we can use in it this happens usually because path fixing
   * is wrong so the paths in the report don't match the paths in the repo and
   * we can't make the mapping work so Codecov things well I processed this,
   * but none of these files are actually in the repo so none of this matters"
   * how about "unusable report" we can call it that, and then have some docs
   * that talk about what leads to that but future would would be to make
   * that error reporting much better
   */

  if (uploadIsEmptyErrors > 0) {
    newErrors.push(
      generateText(uploadIsEmptyErrors, UploadErrorMessage.REPORT_EMPTY)
    )
  }

  if (unknownErrors > 0) {
    newErrors.push(generateText(unknownErrors, UploadErrorMessage.noMatch))
  }

  return newErrors
}

const useDeDuplicatedErrors = ({ errors }) =>
  useMemo(() => {
    let processingFailedErrors = 0
    let uploadExpiredErrors = 0
    let uploadIsEmptyErrors = 0
    let unknownErrors = 0

    errors?.forEach(({ errorCode }) => {
      const readableError = humanReadableError(errorCode)

      if (readableError === UploadErrorMessage.FILE_NOT_IN_STORAGE) {
        processingFailedErrors++
      }

      if (readableError === UploadErrorMessage.REPORT_EXPIRED) {
        uploadExpiredErrors++
      }

      if (readableError === UploadErrorMessage.REPORT_EMPTY) {
        uploadIsEmptyErrors++
      }

      if (readableError === UploadErrorMessage.noMatch) {
        unknownErrors++
      }
    })

    return generateFinalErrors({
      processingFailedErrors,
      uploadExpiredErrors,
      uploadIsEmptyErrors,
      unknownErrors,
    })
  }, [errors])

const RenderError = ({ errors = [], state }) => {
  const filteredErrors = useDeDuplicatedErrors({ errors })

  return (
    <>
      {filteredErrors.map(({ errorCode, readableError }, i) => (
        <span
          key={`errorCode-${errorCode}-${i}`}
          className="flex items-center gap-1 text-ds-primary-red"
        >
          <Icon size="sm" name="exclamation" variant="solid" />
          {readableError}
        </span>
      ))}
      {filteredErrors.length === 0 &&
        typeof state === 'string' &&
        state?.toUpperCase() === UploadStateEnum.error && (
          <span className="flex items-center gap-1 text-ds-primary-red">
            <Icon size="sm" name="exclamation" variant="solid" />
            {humanReadableError()}
          </span>
        )}
    </>
  )
}

RenderError.propTypes = {
  state: PropTypes.oneOf([
    UploadStateEnum.error,
    UploadStateEnum.uploaded,
    UploadStateEnum.processed,
    UploadStateEnum.complete,
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
