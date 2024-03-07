import { metrics } from 'shared/utils/metrics'

type SupportNetworkStatusCodes = 401 | 403 | 404 | 500

export const sendNetworkErrorMetrics = (status: SupportNetworkStatusCodes) => {
  if (status === 401) {
    metrics.increment('network_errors.401', 1)
    return
  }

  if (status === 403) {
    metrics.increment('network_errors.403', 1)
    return
  }

  if (status === 404) {
    metrics.increment('network_errors.404', 1)
    return
  }

  if (status === 500) {
    metrics.increment('network_errors.500', 1)
    return
  }
}

type GraphQLErrorCodes =
  | 'UnauthenticatedError'
  | 'UnauthorizedError'
  | 'NotFoundError'

export const sendGraphQLErrorMetrics = (status: GraphQLErrorCodes) => {
  if (status === 'UnauthenticatedError') {
    metrics.increment('network_errors.unauthenticated_error', 1)
    return
  }

  if (status === 'UnauthorizedError') {
    metrics.increment('network_errors.unauthorized_error', 1)
    return
  }

  if (status === 'NotFoundError') {
    metrics.increment('network_errors.not_found_error', 1)
    return
  }
}
