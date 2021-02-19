export function providerToName(provider) {
  return {
    gh: 'Github',
    bb: 'BitBucket',
    gl: 'Gitlab',
    github: 'Github',
    bitbucket: 'BitBucket',
    gitlab: 'Gitlab'
  }[provider.toLowerCase()]
}

export function providerImage(providerName) {
    return {
        'Github': '/logos/providers/github-icon.svg',
        'Gitlab': '/logos/providers/gitlab-icon.svg',
        'BitBucket': '/logos/providers/bitbucket-icon.svg',
    }[providerToName(providerName)]
}
