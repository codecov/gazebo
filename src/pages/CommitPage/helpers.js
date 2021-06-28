export function getProviderCommitURL({ provider, owner, repo, commit }) {
  return {
    gh: `https://github.com/${owner}/${repo}/commit/${commit}`,
    bb: `https://bitbucket.org/${owner}/${repo}/commits/${commit}`,
    gl: `https://gitlab.com/${owner}/${repo}/-/commit/${commit}`,
  }[provider]
}

export function getProviderPullURL({ provider, owner, repo, pullId }) {
  return {
    gh: `https://github.com/${owner}/${repo}/pull/${pullId}`,
    bb: `https://bitbucket.org/${owner}/${repo}/pull-requests/${pullId}`,
    gl: `https://gitlab.com/${owner}/${repo}/-/merge_requests/${pullId}`,
  }[provider]
}
