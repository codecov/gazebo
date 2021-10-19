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

export function providerFeedback(providerName) {
  return {
    Github: 'https://github.com/codecov/Codecov-user-feedback/issues/1',
    Gitlab:
      'https://gitlab.com/codecov-open-source/codecov-user-feedback/-/issues/1',
    BitBucket:
      'https://bitbucket.org/kylemann/codecov/issues/1/wed-love-your-feedback',
  }[providerToName(providerName)]
}

export function getProviderCommitURL({ provider, owner, repo, commit }) {
  return {
    Github: `https://github.com/${owner}/${repo}/commit/${commit}`,
    BitBucket: `https://bitbucket.org/${owner}/${repo}/commits/${commit}`,
    Gitlab: `https://gitlab.com/${owner}/${repo}/-/commit/${commit}`,
  }[providerToName(provider)]
}

export function getProviderPullURL({ provider, owner, repo, pullId }) {
  return {
    Github: `https://github.com/${owner}/${repo}/pull/${pullId}`,
    BitBucket: `https://bitbucket.org/${owner}/${repo}/pull-requests/${pullId}`,
    Gitlab: `https://gitlab.com/${owner}/${repo}/-/merge_requests/${pullId}`,
  }[providerToName(provider)]
}
