interface TreeviewStringArgs {
  owner: string
  repo: string
}
export const treeviewString = ({ owner, repo }: TreeviewStringArgs) =>
  `${owner}/${repo}/tree`

interface FileviewStringArgs {
  owner: string
  repo: string
}
export const fileviewString = ({ owner, repo }: FileviewStringArgs) =>
  `${owner}/${repo}/blob`

interface CommitTreeviewStringArgs {
  owner: string
  repo: string
  commitSha: string
}
export const commitTreeviewString = ({
  owner,
  repo,
  commitSha,
}: CommitTreeviewStringArgs) => `${owner}/${repo}/commit/${commitSha}/tree`

interface CommitFileviewStringArgs {
  owner: string
  repo: string
  commitSha: string
}
export const commitFileviewString = ({
  owner,
  repo,
  commitSha,
}: CommitFileviewStringArgs) => `${owner}/${repo}/commit/${commitSha}/blob`
