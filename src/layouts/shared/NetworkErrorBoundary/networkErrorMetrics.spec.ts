import * as Sentry from '@sentry/react'

import {
  sendGraphQLErrorMetrics,
  sendNetworkErrorMetrics,
} from './networkErrorMetrics'

describe('networkErrorMetrics', () => {
  describe('sendNetworkErrorMetrics', () => {
    it('should send network error metrics', () => {
      sendNetworkErrorMetrics(401)

      expect(Sentry.metrics.increment).toHaveBeenCalledWith(
        'network_errors.network_status.401',
        1,
        undefined
      )
    })
  })
})

describe('sendGraphQLErrorMetrics', () => {
  describe('sendGraphQLErrorMetrics', () => {
    it('should send UnauthenticatedError metrics', () => {
      sendGraphQLErrorMetrics('UnauthenticatedError')

      expect(Sentry.metrics.increment).toHaveBeenCalledWith(
        'network_errors.graphql.unauthenticated_error',
        1,
        undefined
      )
    })

    it('should send UnauthorizedError metrics', () => {
      sendGraphQLErrorMetrics('UnauthorizedError')

      expect(Sentry.metrics.increment).toHaveBeenCalledWith(
        'network_errors.graphql.unauthorized_error',
        1,
        undefined
      )
    })

    it('should send NotFoundError metrics', () => {
      sendGraphQLErrorMetrics('NotFoundError')

      expect(Sentry.metrics.increment).toHaveBeenCalledWith(
        'network_errors.graphql.not_found_error',
        1,
        undefined
      )
    })
  })
})
