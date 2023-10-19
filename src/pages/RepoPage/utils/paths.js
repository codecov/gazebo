export const treeviewString = ({ owner, repo }) => `${owner}/${repo}/tree`
export const fileviewString = ({ owner, repo }) => `${owner}/${repo}/blob`
export const commitTreeviewString = ({ owner, repo, commitSha }) =>
  `${owner}/${repo}/commit/${commitSha}/tree`
export const commitFileviewString = ({ owner, repo, commitSha }) =>
  `${owner}/${repo}/commit/${commitSha}/blob`
