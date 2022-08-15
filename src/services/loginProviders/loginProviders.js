const LoginProvidersEnum = Object.freeze({
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
})

const getCurrentProvider = (provider) => {
  switch (provider) {
    case 'bb':
      return LoginProvidersEnum.BITBUCKET
    case 'gh':
      return LoginProvidersEnum.GITHUB
    case 'gl':
      return LoginProvidersEnum.GITLAB
    default:
      return null
  }
}

export { LoginProvidersEnum, getCurrentProvider }
