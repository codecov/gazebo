/* eslint-disable camelcase */
import config from 'config'

import bitbucketLogo from 'assets/providers/bitbucket-icon.svg'
import githubLogo from 'assets/providers/github-icon.svg'
import gitlabLogo from 'assets/providers/gitlab-icon.svg'
import { Provider } from 'shared/api/helpers'

export function providerToName(provider: Provider) {
  return (
    {
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
    }[provider.toLowerCase()] || 'Github'
  )
}

export function providerToInternalProvider(provider: Provider) {
  return {
    gh: 'github',
    bb: 'bitbucket',
    gl: 'gitlab',
    ghe: 'github_enterprise',
    gle: 'gitlab_enterprise',
    bbs: 'bitbucket_server',
    github: 'github',
    bitbucket: 'bitbucket',
    gitlab: 'gitlab',
    github_enterprise: 'github_enterprise',
    gitlab_enterprise: 'gitlab_enterprise',
    bitbucket_server: 'bitbucket_server',
  }[provider.toLowerCase()]
}

export function providerImage(providerName: Provider) {
  return {
    Github: githubLogo,
    Gitlab: gitlabLogo,
    BitBucket: bitbucketLogo,
    'Github Enterprise': githubLogo,
    'Gitlab Enterprise': gitlabLogo,
    'BitBucket Server': bitbucketLogo,
  }[providerToName(providerName)]
}

export function providerFeedback(providerName: Provider) {
  return {
    Github: 'https://github.com/codecov/Codecov-user-feedback/issues/1',
    Gitlab:
      'https://gitlab.com/codecov-open-source/codecov-user-feedback/-/issues/1',
    BitBucket:
      'https://bitbucket.org/kylemann/codecov/issues/1/wed-love-your-feedback',
    'Github Enterprise':
      'https://github.com/codecov/Codecov-user-feedback/issues/1',
    'Gitlab Enterprise':
      'https://gitlab.com/codecov-open-source/codecov-user-feedback/-/issues/1',
    'BitBucket Server':
      'https://bitbucket.org/kylemann/codecov/issues/1/wed-love-your-feedback',
  }[providerToName(providerName)]
}

export function getProviderCommitURL({
  provider,
  owner,
  repo,
  commit,
}: {
  provider: Provider
  owner: string
  repo: string
  commit: string
}) {
  return {
    Github: `https://github.com/${owner}/${repo}/commit/${commit}`,
    BitBucket: `https://bitbucket.org/${owner}/${repo}/commits/${commit}`,
    Gitlab: `https://gitlab.com/${owner}/${repo}/-/commit/${commit}`,
    'Github Enterprise': `${config.GHE_URL}/${owner}/${repo}/commit/${commit}`,
    'Gitlab Enterprise': `${config.GLE_URL}/${owner}/${repo}/-/commit/${commit}`,
    'BitBucket Server': `${config.BBS_URL}/${owner}/${repo}/commits/${commit}`,
  }[providerToName(provider)]
}

export function getProviderPullURL({
  provider,
  owner,
  repo,
  pullId,
}: {
  provider: Provider
  owner: string
  repo: string
  pullId: string
}) {
  return {
    Github: `https://github.com/${owner}/${repo}/pull/${pullId}`,
    BitBucket: `https://bitbucket.org/${owner}/${repo}/pull-requests/${pullId}`,
    Gitlab: `https://gitlab.com/${owner}/${repo}/-/merge_requests/${pullId}`,
    'Github Enterprise': `${config.GHE_URL}/${owner}/${repo}/pull/${pullId}`,
    'Gitlab Enterprise': `${config.GLE_URL}/${owner}/${repo}/-/merge_requests/${pullId}`,
    'BitBucket Server': `${config.BBS_URL}/${owner}/${repo}/pull-requests/${pullId}`,
  }[providerToName(provider)]
}
