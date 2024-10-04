/* eslint-disable camelcase */

import bitbucketLogo from 'assets/providers/bitbucket-icon.svg'
import githubLogoWhite from 'assets/providers/github-icon-white.svg'
import githubLogo from 'assets/providers/github-icon.svg'
import gitlabLogo from 'assets/providers/gitlab-icon.svg'
import oktaLogo from 'assets/providers/okta-icon.svg'
import sentryLogoWhite from 'assets/providers/sentry-icon-white.svg'
import sentryLogo from 'assets/providers/sentry-icon.svg'

export const LoginProvidersEnum = {
  BITBUCKET: {
    provider: 'bb',
    name: 'Bitbucket',
    external: 'BITBUCKET',
    externalKey: 'bb',
    selfHosted: 'BITBUCKET_SERVER',
    selfHostedKey: 'bbs',
    selfHostedName: 'Bitbucket Server',
    variant: 'bitbucket',
  },
  GITHUB: {
    provider: 'gh',
    name: 'GitHub',
    external: 'GITHUB',
    externalKey: 'gh',
    selfHosted: 'GITHUB_ENTERPRISE',
    selfHostedKey: 'ghe',
    selfHostedName: 'GitHub Enterprise',
    variant: 'github',
  },
  GITLAB: {
    provider: 'gl',
    name: 'GitLab',
    external: 'GITLAB',
    externalKey: 'gl',
    selfHosted: 'GITLAB_ENTERPRISE',
    selfHostedKey: 'gle',
    selfHostedName: 'GitLab CE/EE',
    variant: 'gitlab',
  },
  OKTA: {
    provider: 'okta',
    name: 'Okta',
    external: 'OKTA',
    externalKey: 'okta',
    variant: 'okta',
  },
} as const

export const LOGIN_PROVIDER_SHORT_NAMES = {
  gh: 'gh',
  github: 'gh',
  bb: 'bb',
  bitbucket: 'bb',
  gl: 'gl',
  gitlab: 'gl',
  sentry: 'sentry',
  okta: 'okta',
} as const

export function loginProviderToShortName(loginProvider?: string) {
  if (!loginProvider) {
    return undefined
  }

  const providerName =
    loginProvider.toLowerCase() as keyof typeof LOGIN_PROVIDER_SHORT_NAMES
  return LOGIN_PROVIDER_SHORT_NAMES[providerName] ?? undefined
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
  okta: 'Okta',
} as const

export function loginProviderToName(loginProvider?: string) {
  if (!loginProvider) {
    return undefined
  }

  const providerName =
    loginProvider.toLowerCase() as keyof typeof LOGIN_PROVIDER_NAMES
  return LOGIN_PROVIDER_NAMES[providerName] ?? undefined
}

export const LOGIN_PROVIDER_IMAGES = {
  Github: githubLogo,
  Gitlab: gitlabLogo,
  BitBucket: bitbucketLogo,
  'Github Enterprise': githubLogo,
  'Gitlab Enterprise': gitlabLogo,
  'BitBucket Server': bitbucketLogo,
  Sentry: sentryLogo,
  Okta: oktaLogo,
} as const

export const LOGIN_PROVIDER_DARK_MODE_IMAGES = {
  Github: githubLogoWhite,
  Gitlab: gitlabLogo,
  BitBucket: bitbucketLogo,
  'Github Enterprise': githubLogoWhite,
  'Gitlab Enterprise': gitlabLogo,
  'BitBucket Server': bitbucketLogo,
  Sentry: sentryLogoWhite,
  Okta: oktaLogo,
} as const

export function loginProviderImage(
  loginProvider?: string,
  isDarkMode?: boolean
) {
  if (!loginProvider) {
    return undefined
  }

  let imagesToUse = LOGIN_PROVIDER_IMAGES

  if (isDarkMode) {
    imagesToUse = LOGIN_PROVIDER_DARK_MODE_IMAGES
  }

  const providerName = loginProviderToName(
    loginProvider
  ) as keyof typeof imagesToUse
  return imagesToUse[providerName] ?? undefined
}
