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
  gh: 'GitHub',
  bb: 'Bitbucket',
  gl: 'GitLab',
  ghe: 'GitHub Enterprise',
  gle: 'GitLab Enterprise',
  bbs: 'Bitbucket Server',
  github: 'GitHub',
  bitbucket: 'Bitbucket',
  gitlab: 'GitLab',
  github_enterprise: 'GitHub Enterprise',
  gitlab_enterprise: 'GitLab Enterprise',
  bitbucket_server: 'Bitbucket Server',
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
  GitHub: githubLogo,
  GitLab: gitlabLogo,
  Bitbucket: bitbucketLogo,
  'GitHub Enterprise': githubLogo,
  'GitLab Enterprise': gitlabLogo,
  'Bitbucket Server': bitbucketLogo,
  Sentry: sentryLogo,
  Okta: oktaLogo,
} as const

export const LOGIN_PROVIDER_DARK_MODE_IMAGES = {
  GitHub: githubLogoWhite,
  GitLab: gitlabLogo,
  Bitbucket: bitbucketLogo,
  'GitHub Enterprise': githubLogoWhite,
  'GitLab Enterprise': gitlabLogo,
  'Bitbucket Server': bitbucketLogo,
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
