/* eslint-disable camelcase */
import config from 'config'

import { Provider } from 'shared/api/helpers'

export function providerToName(provider: Provider) {
  return {
    gh: 'GitHub',
    bb: 'BitBucket',
    gl: 'GitLab',
    ghe: 'GitHub Enterprise',
    gle: 'GitLab Enterprise',
    bbs: 'BitBucket Server',
    github: 'GitHub',
    bitbucket: 'BitBucket',
    gitlab: 'GitLab',
    github_enterprise: 'GitHub Enterprise',
    gitlab_enterprise: 'GitLab Enterprise',
    bitbucket_server: 'BitBucket Server',
  }[provider.toLowerCase()]
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
    GitHub: `https://github.com/${owner}/${repo}/commit/${commit}`,
    BitBucket: `https://bitbucket.org/${owner}/${repo}/commits/${commit}`,
    GitLab: `https://gitlab.com/${owner}/${repo}/-/commit/${commit}`,
    'GitHub Enterprise': `${config.GHE_URL}/${owner}/${repo}/commit/${commit}`,
    'GitLab Enterprise': `${config.GLE_URL}/${owner}/${repo}/-/commit/${commit}`,
    'BitBucket Server': `${config.BBS_URL}/${owner}/${repo}/commits/${commit}`,
    // @ts-expect-error - provider could be undefined but it should be fine
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
  pullId: number
}) {
  return {
    GitHub: `https://github.com/${owner}/${repo}/pull/${pullId}`,
    BitBucket: `https://bitbucket.org/${owner}/${repo}/pull-requests/${pullId}`,
    GitLab: `https://gitlab.com/${owner}/${repo}/-/merge_requests/${pullId}`,
    'GitHub Enterprise': `${config.GHE_URL}/${owner}/${repo}/pull/${pullId}`,
    'GitLab Enterprise': `${config.GLE_URL}/${owner}/${repo}/-/merge_requests/${pullId}`,
    'BitBucket Server': `${config.BBS_URL}/${owner}/${repo}/pull-requests/${pullId}`,
    // @ts-expect-error - provider could be undefined but it should be fine
  }[providerToName(provider)]
}
