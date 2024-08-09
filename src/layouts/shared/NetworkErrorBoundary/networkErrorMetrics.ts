import { metrics } from 'shared/utils/metrics'

type SupportNetworkStatusCodes = 401 | 403 | 404 | 429 | 500

export const sendNetworkErrorMetrics = (status: SupportNetworkStatusCodes) => {
  metrics.increment(`network_errors.network_status.${status}`, 1)
}

type GraphQLErrorCodes =
  | 'UnauthenticatedError'
  | 'UnauthorizedError'
  | 'NotFoundError'

export const sendGraphQLErrorMetrics = (status: GraphQLErrorCodes) => {
  if (status === 'UnauthenticatedError') {
    metrics.increment('network_errors.graphql.unauthenticated_error', 1)
    return
  }

  if (status === 'UnauthorizedError') {
    metrics.increment('network_errors.graphql.unauthorized_error', 1)
    return
  }

  if (status === 'NotFoundError') {
    metrics.increment('network_errors.graphql.not_found_error', 1)
    return
  }
}
