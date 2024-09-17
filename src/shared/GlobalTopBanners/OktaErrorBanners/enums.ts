import * as Sentry from '@sentry/react'

const ErrorType = {
  UnauthorizedClient: 'unauthorized_client',
  AccessDenied: 'access_denied',
  UnsupportedResponseType: 'unsupported_response_type',
  UnsupportedResponseMode: 'unsupported_response_mode',
  InvalidScope: 'invalid_scope',
  ServerError: 'server_error',
  TemporarilyUnavailable: 'temporarily_unavailable',
  InvalidClient: 'invalid_client',
  LoginRequired: 'login_required',
  InvalidRequest: 'invalid_request',
  UserCanceledRequest: 'user_canceled_request',
} as const

const errorMessages = {
  [ErrorType.UnauthorizedClient]:
    "Unauthorized client: The client isn't authorized to request an authorization code using this method. Please reach out to your administrator.",
  [ErrorType.AccessDenied]:
    'Access denied: The resource owner or authorization server denied the request. Please reach out to your administrator.',
  [ErrorType.UnsupportedResponseType]:
    "Unsupported response type: The authorization server doesn't support obtaining an authorization code using this method. Please reach out to your administrator.",
  [ErrorType.UnsupportedResponseMode]:
    "Unsupported response mode: The authorization server doesn't support the requested response mode. Please reach out to your administrator.",
  [ErrorType.InvalidScope]:
    'Invalid scope: The requested scope is invalid, unknown, or malformed. Please reach out to your administrator.',
  [ErrorType.ServerError]:
    'Server error: The authorization server encountered an unexpected condition that prevented it from fulfilling the request. Please try again later or contact support.',
  [ErrorType.TemporarilyUnavailable]:
    'Temporarily unavailable: The authorization server is currently unable to handle the request due to temporary overloading or maintenance. Please try again later.',
  [ErrorType.InvalidClient]:
    "Invalid client: The specified client isn't valid. Please reach out to your administrator.",
  [ErrorType.LoginRequired]:
    "Login required: The client specified not to prompt, but the user isn't signed in. Please sign in and try again.",
  [ErrorType.InvalidRequest]:
    "Invalid request: The request parameters aren't valid. Please try again or contact support.",
  [ErrorType.UserCanceledRequest]:
    'Request canceled: User canceled the social sign-in request. Please try again if this was unintentional.',
} as const

export const getOktaErrorMessage = (error: string): string => {
  if (error in errorMessages) {
    return errorMessages[error as keyof typeof errorMessages]
  }

  Sentry.captureMessage(`Unknown Okta error: ${error}`, {
    fingerprint: ['unknown-okta-error'],
    tags: {
      error: error,
    },
  })

  return 'An unknown error occurred. Please try again or contact support.'
}
