export const treeviewString = ({ owner, repo }) => `${owner}/${repo}/tree`
export const fileviewString = ({ owner, repo }) => `${owner}/${repo}/blob`
export const pullTreeviewString = ({ owner, repo, pullId }) =>
  `${owner}/${repo}/pull/${pullId}/tree`
export const pullFileviewString = ({ owner, repo, pullId }) =>
  `${owner}/${repo}/pull/${pullId}/blob`
