export const treeviewString = ({ owner, repo }) => `${owner}/${repo}/tree`
export const fileviewString = ({ owner, repo }) => `${owner}/${repo}/blob`
export const commitTreeviewString = ({ owner, repo, commitSHA }) =>
  `${owner}/${repo}/commit/${commitSHA}/tree`
export const commitFileviewString = ({ owner, repo, commitSHA }) =>
  `${owner}/${repo}/commit/${commitSHA}/blob`
