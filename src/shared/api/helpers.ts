/* eslint-disable camelcase */
import * as Sentry from '@sentry/react'
import qs from 'qs'

import config from 'config'

import { snakeifyKeys } from 'shared/utils/snakeifyKeys'

export interface NetworkErrorObject {
  status: number
  data: {
    detail?: React.ReactNode
  }
  dev: `${string} - ${number} ${string}`
  error?: Error
}

export function rejectNetworkError(error: NetworkErrorObject) {
  // only capture network errors if they are not a rate limit error
  // this will typically only be schema parsing errors
  if (error.status !== 429 && error.dev && error.error) {
    Sentry.withScope((scope) => {
      scope.addBreadcrumb({
        category: 'network.error',
        level: 'error',
        data: error.error,
      })
      scope.setFingerprint([error.dev])
      scope.captureMessage('Network Error')
    })
  }

  return Promise.reject({
    status: error.status,
    dev: error.dev,
    data: error.data,
  })
}

export const AllProvidersArray = [
  'gh',
  'gl',
  'bb',
  'ghe',
  'gle',
  'bbs',
  'github',
  'gitlab',
  'bitbucket',
  'github_enterprise',
  'gitlab_enterprise',
  'bitbucket_server',
] as const
type AllProviders = typeof AllProvidersArray
type Provider = AllProviders[number]

export const ProviderCookieKeyMapping = {
  gh: 'github-token',
  gl: 'gitlab-token',
  bb: 'bitbucket-token',
  ghe: 'github_enterprise-token',
  gle: 'gitlab_enterprise-token',
  bbs: 'bitbucket_server-token',
  github: 'github-token',
  gitlab: 'gitlab-token',
  bitbucket: 'bitbucket-token',
  github_enterprise: 'github_enterprise-token',
  gitlab_enterprise: 'gitlab_enterprise-token',
  bitbucket_server: 'bitbucket_server-token',
} as const

interface GeneratePathArgs {
  path: string
  query?: Record<string, unknown>
}
export function generatePath({ path, query }: GeneratePathArgs) {
  const baseUrl = `${config.API_URL}/internal`
  const queryString = qs.stringify(snakeifyKeys(query), {
    arrayFormat: 'repeat',
  })

  return `${baseUrl}${path}${queryString && '?' + queryString}`
}

export function isProvider(provider: string): provider is Provider {
  return AllProvidersArray.includes(provider as Provider)
}

export function getHeaders(provider?: string) {
  const baseHeader = {
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
  }

  if (typeof provider !== 'string') return baseHeader

  const formattedProvider = provider.toLowerCase()

  if (!isProvider(formattedProvider)) return baseHeader

  const tokenType = ProviderCookieKeyMapping[formattedProvider]

  return {
    ...baseHeader,
    'Token-Type': tokenType,
  }
}
