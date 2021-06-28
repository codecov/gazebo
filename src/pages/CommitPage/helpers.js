import { providerToName } from 'shared/utils/provider'

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
