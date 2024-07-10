import PropTypes from 'prop-types'
import { useMemo } from 'react'

import { ErrorCodeEnum, UploadStateEnum } from 'shared/utils/commit'
import A from 'ui/A'
import Icon from 'ui/Icon'

const UploadErrorMessage = Object.freeze({
  [ErrorCodeEnum.fileNotFoundInStorage]:
    'Upload failed. Please rerun the upload.',
  [ErrorCodeEnum.reportExpired]: (
    <span>
      Upload exceeds the max age of 12h. Please download and review your report
      or turn off the age check by visiting{' '}
      <A
        to={{
          pageName: 'expiredReports',
        }}
      >
        expired reports
      </A>
      .
    </span>
  ),
  [ErrorCodeEnum.reportEmpty]: (
    <span>
      Unusable report due to issues such as source code unavailability, path
      mismatch, empty report, or incorrect data format. Please visit our{' '}
      <A to={{ pageName: 'unusableReports' }}>troubleshooting document</A> for
      assistance.
    </span>
  ),
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

const GenerateText = (count, string) => ({
  readableError:
    count > 1 ? (
      <>
        {string} ({count})
      </>
    ) : (
      <>{string}</>
    ),
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
      GenerateText(
        processingFailedErrors,
        UploadErrorMessage.FILE_NOT_IN_STORAGE
      )
    )
  }

  if (uploadExpiredErrors > 0) {
    newErrors.push(
      GenerateText(uploadExpiredErrors, UploadErrorMessage.REPORT_EXPIRED)
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
      GenerateText(uploadIsEmptyErrors, UploadErrorMessage.REPORT_EMPTY)
    )
  }

  if (unknownErrors > 0) {
    newErrors.push(GenerateText(unknownErrors, UploadErrorMessage.noMatch))
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
          className="mt-3 flex items-start gap-1 text-ds-primary-red"
        >
          <Icon size="sm" name="exclamation" variant="solid" />
          <p className="w-11/12">{readableError}</p>
        </span>
      ))}
      {filteredErrors.length === 0 &&
        typeof state === 'string' &&
        state?.toUpperCase() === UploadStateEnum.error && (
          <span className="mt-3 flex items-center gap-1 text-ds-primary-red">
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
