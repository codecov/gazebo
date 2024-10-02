import { useMemo } from 'react'

import { ErrorCodeEnum, UploadStateEnum } from 'shared/utils/commit'
import A from 'ui/A'
import Icon from 'ui/Icon'

type ErrorCodeType =
  | (typeof ErrorCodeEnum)[keyof typeof ErrorCodeEnum]
  | 'UNKNOWN_ERROR'

interface UseDuplicatedErrorsProps {
  errors: Array<{ errorCode: ErrorCodeType }>
}

const useDuplicatedErrors = ({ errors }: UseDuplicatedErrorsProps) =>
  useMemo(() => {
    const errorMap = new Map<ErrorCodeType, number>()

    errors?.forEach(({ errorCode }) => {
      if (errorMap.has(errorCode)) {
        errorMap.set(errorCode, errorMap.get(errorCode)! + 1)
      } else if (
        errorCode === ErrorCodeEnum.fileNotFoundInStorage ||
        errorCode === ErrorCodeEnum.reportExpired ||
        errorCode === ErrorCodeEnum.reportEmpty
      ) {
        errorMap.set(errorCode, 1)
      } else {
        errorMap.set('UNKNOWN_ERROR', (errorMap.get('UNKNOWN_ERROR') || 0) + 1)
      }
    })

    return Array.from(errorMap, ([errorCode, count]) => ({ errorCode, count }))
  }, [errors])

interface ErrorMessageProps {
  errorCode: ErrorCodeType
  count: number
}

const ErrorMessage = ({ errorCode, count }: ErrorMessageProps) => {
  const renderCount = count > 1 ? `(${count})` : ''
  const icon = (
    <Icon size="sm" name="exclamation" variant="solid" className="mt-[2px]" />
  )

  if (errorCode === ErrorCodeEnum.reportEmpty) {
    return (
      <span className="mt-3 flex items-start gap-1 text-balance text-ds-primary-red">
        {icon}
        <p className="w-full">
          Unusable report due to issues such as source code unavailability, path
          mismatch, empty report, or incorrect data format. Please visit our{' '}
          <A
            to={{ pageName: 'unusableReports' }}
            hook="unusable-report-link"
            isExternal={true}
          >
            troubleshooting document
          </A>{' '}
          for assistance. {renderCount}
        </p>
      </span>
    )
  }

  if (errorCode === ErrorCodeEnum.fileNotFoundInStorage) {
    return (
      <span className="mt-3 flex items-start gap-1 text-ds-primary-red">
        {icon}
        <p className="w-11/12">
          Processing failed. Please rerun the upload in a new commit.{' '}
          {renderCount}
        </p>
      </span>
    )
  }

  if (errorCode === ErrorCodeEnum.reportExpired) {
    return (
      <span className="mt-3 flex items-start gap-1 text-ds-primary-red">
        {icon}
        <p className="w-11/12">
          Upload exceeds the max age of 12h. Please download and review your
          report or turn off the age check by visiting{' '}
          <A
            to={{ pageName: 'expiredReports' }}
            hook="expired-report-link"
            isExternal={true}
          >
            expired reports
          </A>
          . {renderCount}
        </p>
      </span>
    )
  }

  return (
    <span className="mt-3 flex items-start gap-1 text-ds-primary-red">
      {icon}
      Unknown error {renderCount}
    </span>
  )
}

interface RenderErrorProps {
  errors: Array<{ errorCode: ErrorCodeType }>
  state?: (typeof UploadStateEnum)[keyof typeof UploadStateEnum]
}

const RenderError = ({ errors = [], state }: RenderErrorProps) => {
  const filteredErrors = useDuplicatedErrors({ errors })

  return (
    <>
      {filteredErrors?.map(({ errorCode, count }, i) => (
        <ErrorMessage
          key={`errorCode-${errorCode}-${i}`}
          errorCode={errorCode}
          count={count}
        />
      ))}
      {errors?.length === 0 &&
        typeof state === 'string' &&
        state?.toUpperCase() === UploadStateEnum.error && (
          <span className="mt-3 flex items-start gap-1 text-ds-primary-red">
            <Icon size="sm" name="exclamation" variant="solid" />
            Unknown error
          </span>
        )}
    </>
  )
}

export default RenderError
