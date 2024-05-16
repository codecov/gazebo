import { fileviewString, treeviewString } from 'pages/RepoPage/utils'

interface ConditionalPathnameReplacementArgs {
  pathToMatch: string
  oldParam?: string
  newParam?: string
}

const conditionalPathnameReplacement =
  (pathname: string) =>
  ({ pathToMatch, oldParam, newParam }: ConditionalPathnameReplacementArgs) => {
    if (pathname.includes(pathToMatch) && oldParam && newParam) {
      return pathname.replace(
        `${pathToMatch}/${oldParam}`,
        `${pathToMatch}/${newParam}`
      )
    }
    return null
  }

interface HandleRootLocationArgs {
  pathname: string
  owner: string
  repo: string
  name?: string
}

const handleRootLocation = ({
  pathname,
  owner,
  repo,
  name,
}: HandleRootLocationArgs) => {
  if (pathname.includes(`${owner}/${repo}`) && name) {
    return pathname.replace(
      `${owner}/${repo}`,
      `${treeviewString({ owner, repo })}/${name}`
    )
  }
  return null
}

interface CreatePathArgs {
  pathname: string
  owner: string
  repo: string
  ref: string
  branch: string
  name?: string
}

export function createPath({
  pathname,
  owner,
  repo,
  ref,
  branch,
  name,
}: CreatePathArgs) {
  const conditionalReplace = conditionalPathnameReplacement(pathname)
  let newPath = conditionalReplace({
    pathToMatch: fileviewString({ owner, repo }),
    oldParam: ref,
    newParam: name,
  })
  if (!newPath) {
    newPath = conditionalReplace({
      pathToMatch: treeviewString({ owner, repo }),
      oldParam: branch,
      newParam: name,
    })
  }
  if (!newPath) {
    newPath = handleRootLocation({ pathname, owner, repo, name })
  }
  return newPath
}
