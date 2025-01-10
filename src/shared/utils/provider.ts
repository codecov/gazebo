/* eslint-disable camelcase */
import config from 'config'

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
    } as const
  )[provider]
}

export type InternalProvider =
  | 'github'
  | 'bitbucket'
  | 'gitlab'
  | 'github_enterprise'
  | 'gitlab_enterprise'
  | 'bitbucket_server'

export function providerToInternalProvider(
  provider: Provider
): InternalProvider {
  return (
    {
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
    } as const
  )[provider]
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
    Bitbucket: `https://bitbucket.org/${owner}/${repo}/commits/${commit}`,
    GitLab: `https://gitlab.com/${owner}/${repo}/-/commit/${commit}`,
    'GitHub Enterprise': `${config.GHE_URL}/${owner}/${repo}/commit/${commit}`,
    'GitLab Enterprise': `${config.GLE_URL}/${owner}/${repo}/-/commit/${commit}`,
    'Bitbucket Server': `${config.BBS_URL}/${owner}/${repo}/commits/${commit}`,
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
    Bitbucket: `https://bitbucket.org/${owner}/${repo}/pull-requests/${pullId}`,
    GitLab: `https://gitlab.com/${owner}/${repo}/-/merge_requests/${pullId}`,
    'GitHub Enterprise': `${config.GHE_URL}/${owner}/${repo}/pull/${pullId}`,
    'GitLab Enterprise': `${config.GLE_URL}/${owner}/${repo}/-/merge_requests/${pullId}`,
    'Bitbucket Server': `${config.BBS_URL}/${owner}/${repo}/pull-requests/${pullId}`,
    // @ts-expect-error - provider could be undefined but it should be fine
  }[providerToName(provider)]
}
