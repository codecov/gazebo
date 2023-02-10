import PropTypes from 'prop-types'
import { useMemo } from 'react'

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
    newErrors.push(generateText(processingFailedErrors, 'processing failed'))
  }

  if (uploadExpiredErrors > 0) {
    newErrors.push(generateText(uploadExpiredErrors, 'upload expired'))
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
    newErrors.push(generateText(uploadIsEmptyErrors, 'unusable report'))
  }

  if (unknownErrors > 0) {
    newErrors.push(generateText(unknownErrors, 'unknown error'))
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

      if (readableError === 'processing failed') processingFailedErrors++
      if (readableError === 'upload expired') uploadExpiredErrors++
      if (readableError === 'upload is empty') uploadIsEmptyErrors++
      if (readableError === 'unknown error') unknownErrors++
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
          className="flex gap-1 items-center text-ds-primary-red"
        >
          <Icon size="sm" name="exclamation" variant="solid" />
          {readableError}
        </span>
      ))}
      {filteredErrors.length === 0 &&
        typeof state === 'string' &&
        state?.toUpperCase() === UploadStateEnum.error && (
          <span className="flex gap-1 items-center text-ds-primary-red">
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
