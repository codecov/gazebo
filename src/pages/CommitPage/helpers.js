export function getProviderCommitURL(provider, owner, repo) {
  if (provider === 'gh') {
    return `https://github.com/${owner}/${repo}/commit`
  } else if (provider === 'bb') {
    return `https://bitbucket.org/${owner}/${repo}/commits`
  } else if (provider === 'gl') {
    return `https://gitlab.com/${owner}/${repo}/-/commit`
  }
}

export function getProviderPullURL(provider, owner, repo) {
  if (provider === 'gh') {
    return `https://github.com/${owner}/${repo}/pull`
  } else if (provider === 'bb') {
    return `https://bitbucket.org/${owner}/${repo}/pull-requests`
  } else if (provider === 'gl') {
    return `https://gitlab.com/${owner}/${repo}/-/merge_requests`
  }
}
