import githubLogo from 'assets/providers/github-icon.svg'
import gitlabLogo from 'assets/providers/gitlab-icon.svg'
import bitbucketLogo from 'assets/providers/bitbucket-icon.svg'

export function providerToName(provider) {
  return {
    gh: 'Github',
    bb: 'BitBucket',
    gl: 'Gitlab',
    github: 'Github',
    bitbucket: 'BitBucket',
    gitlab: 'Gitlab',
  }[provider.toLowerCase()]
}

export function providerImage(providerName) {
  return {
    Github: githubLogo,
    Gitlab: gitlabLogo,
    BitBucket: bitbucketLogo,
  }[providerToName(providerName)]
}
