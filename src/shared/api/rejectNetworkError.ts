/* eslint-disable camelcase */
import * as Sentry from '@sentry/react'

type ParsingError = 'Parsing Error'
type NotFoundError = 'Not Found Error'
type OwnerNotActivatedError = 'Owner Not Activated'
type Errors = ParsingError | NotFoundError | OwnerNotActivatedError

type ParsingErrorObject = {
  errorName: ParsingError
  errorDetails: { error: Error; caller: string }
}

type NotFoundErrorObject = {
  errorName: NotFoundError
  errorDetails: { caller: string }
}

type OwnerNotActivatedErrorObject = {
  errorName: OwnerNotActivatedError
  data: { detail?: React.ReactNode }
  errorDetails: { caller: string }
}

type NetworkErrorObject =
  | ParsingErrorObject
  | NotFoundErrorObject
  | OwnerNotActivatedErrorObject

const determineSentryLevel = (errorName: Errors) => {
  switch (errorName) {
    case 'Parsing Error':
      return 'error'
    case 'Not Found Error':
      return 'info'
    case 'Owner Not Activated':
      return 'info'
    default:
      return 'error'
  }
}

const determineStatusCode = (errorName: Errors) => {
  switch (errorName) {
    case 'Parsing Error':
      return 400
    case 'Not Found Error':
      return 404
    case 'Owner Not Activated':
      return 403
  }
}

export function rejectNetworkErrorNew(error: NetworkErrorObject) {
  const {
    errorName,
    errorDetails: { caller },
  } = error

  const devMsg = `${caller} - ${errorName}`

  Sentry.withScope((scope) => {
    const level = determineSentryLevel(errorName)
    scope.addBreadcrumb({
      category: 'network.error',
      level: level,
      message: devMsg,
      data:
        'error' in error.errorDetails ? error.errorDetails.error : undefined,
    })

    scope.setTags({
      caller: caller,
      errorName: errorName,
    })

    scope.setLevel(level)
    scope.setFingerprint([devMsg])
    scope.captureMessage(devMsg)
  })

  const status = determineStatusCode(errorName)

  return Promise.reject({
    dev: devMsg,
    data: 'data' in error ? error.data : undefined,
    status: status,
  })
}
