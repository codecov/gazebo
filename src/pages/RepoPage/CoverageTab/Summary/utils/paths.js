import { newFileviewString, treeviewString } from 'pages/RepoPage/utils'

const conditionalPathnameReplacement =
  (pathname) =>
  ({ pathToMatch, oldParam, newParam }) => {
    if (pathname.includes(pathToMatch) && oldParam && newParam) {
      return pathname.replace(
        `${pathToMatch}/${oldParam}`,
        `${pathToMatch}/${newParam}`
      )
    }
    return null
  }

const handleRootLocation = ({ pathname, owner, repo, name }) => {
  if (pathname.includes(`${owner}/${repo}`) && name) {
    return pathname.replace(
      `${owner}/${repo}`,
      `${treeviewString({ owner, repo })}/${name}`
    )
  }
  return null
}

export function createPath({ pathname, owner, repo, ref, branch, name }) {
  const conditionalReplace = conditionalPathnameReplacement(pathname)
  let newPath = conditionalReplace({
    pathToMatch: newFileviewString({ owner, repo }),
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
