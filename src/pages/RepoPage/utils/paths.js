export const newFileviewString = ({ owner, repo }) => `${owner}/${repo}/blobs`
export const treeviewString = ({ owner, repo }) => `${owner}/${repo}/tree`

/* TODO The intent is to eventually use fileviewString for coverage tab */
export const fileviewString = ({ owner, repo }) => `${owner}/${repo}/blob`
