/* eslint-disable camelcase */
import isString from 'lodash/isString'

import bitbucketLogo from 'assets/providers/bitbucket-icon.svg'
import githubLogo from 'assets/providers/github-icon.svg'
import gitlabLogo from 'assets/providers/gitlab-icon.svg'
import sentryLogo from 'assets/providers/sentry-icon.svg'

export const LOGIN_PROVIDER_SHORT_NAMES = {
  gh: 'gh',
  github: 'gh',
  bb: 'bb',
  bitbucket: 'bb',
  gl: 'gl',
  gitlab: 'gl',
  sentry: 'sentry',
} as const

export function loginProviderToShortName(loginProvider?: string) {
  if (!isString(loginProvider)) {
    return null
  }

  const providerName = loginProvider.toLowerCase()
  const keys = Object.keys(LOGIN_PROVIDER_SHORT_NAMES) as Array<
    keyof typeof LOGIN_PROVIDER_SHORT_NAMES
  >

  for (const key of keys) {
    if (key === providerName) {
      return LOGIN_PROVIDER_SHORT_NAMES[providerName]
    }
  }

  return null
}

export const LOGIN_PROVIDER_NAMES = {
  gh: 'Github',
  bb: 'BitBucket',
  gl: 'Gitlab',
  ghe: 'Github Enterprise',
  gle: 'Gitlab Enterprise',
  bbs: 'BitBucket Server',
  github: 'Github',
  bitbucket: 'BitBucket',
  gitlab: 'Gitlab',
  github_enterprise: 'Github Enterprise',
  gitlab_enterprise: 'Gitlab Enterprise',
  bitbucket_server: 'BitBucket Server',
  sentry: 'Sentry',
} as const

export function loginProviderToName(loginProvider?: string) {
  if (!isString(loginProvider)) {
    return null
  }

  const providerName = loginProvider.toLowerCase()
  const keys = Object.keys(LOGIN_PROVIDER_NAMES) as Array<
    keyof typeof LOGIN_PROVIDER_NAMES
  >

  for (const key of keys) {
    if (key === providerName) {
      return LOGIN_PROVIDER_NAMES[providerName]
    }
  }

  return null
}

export const LOGIN_PROVIDER_IMAGES = {
  Github: githubLogo,
  Gitlab: gitlabLogo,
  BitBucket: bitbucketLogo,
  'Github Enterprise': githubLogo,
  'Gitlab Enterprise': gitlabLogo,
  'BitBucket Server': bitbucketLogo,
  Sentry: sentryLogo,
} as const

export function loginProviderImage(loginProvider?: string) {
  if (!isString(loginProvider)) {
    return null
  }

  const providerName = loginProviderToName(loginProvider)
  const keys = Object.keys(LOGIN_PROVIDER_IMAGES) as Array<
    keyof typeof LOGIN_PROVIDER_IMAGES
  >

  for (const key of keys) {
    if (key === providerName) {
      return LOGIN_PROVIDER_IMAGES[providerName]
    }
  }

  return null
}
