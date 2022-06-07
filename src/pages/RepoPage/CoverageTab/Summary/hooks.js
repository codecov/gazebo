import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { useRepoCoverage, useRepoOverview } from 'services/repo'
import { mapEdges } from 'shared/utils/graphql'

const formatPath = (pathname) =>
  pathname.charAt(pathname.length - 1) === '/'
    ? pathname.slice(0, pathname.length - 1)
    : pathname

export function useCoverageRedirect() {
  const location = useLocation()
  const { repo, branch, ref } = useParams()

  const [newPath, setNewPath] = useState()
  const [enableRedirection, setEnableRedirection] = useState(false)

  const setNewPathHandler = (selection) => setNewPath(createPath(selection))

  const createPath = useCallback(
    ({ name }) => {
      const pathname = formatPath(location.pathname)
      if (pathname.includes('blobs')) {
        if (ref) {
          return pathname.replace(
            `${repo}/blobs/${ref}`,
            `${repo}/blobs/${name}`
          )
        }
        return `${pathname}/blobs/${name}`
      }
      if (pathname.includes('tree') && branch) {
        return pathname.replace(
          `${repo}/tree/${branch}`,
          `${repo}/tree/${name}`
        )
      }
      return `${pathname}/tree/${name}`
    },
    [branch, location.pathname, ref, repo]
  )

  useLayoutEffect(() => {
    if (newPath) {
      setEnableRedirection(true)
    }
  }, [newPath])

  return {
    setNewPath: setNewPathHandler,
    newPath,
    enableRedirection,
  }
}

export function useBranchSelector(branches = [], defaultBranch) {
  const [items, setItems] = useState([])
  const [selection, setSelection] = useState()
  const { branch, ref } = useParams()
  const { setNewPath, newPath, enableRedirection } = useCoverageRedirect()

  const onChangeHandler = (slection) => {
    setNewPath(slection)
  }

  // Store cleaned up branches in state (else infinate rerenders)
  useEffect(() => {
    setItems(mapEdges(branches))
  }, [branches, setItems])

  // Set the current selected branch based on the branch/ref param or use the default branch
  useEffect(() => {
    const selectedBranch = branch || ref || defaultBranch
    const [currentBranch] = items.filter((b) => b.name === selectedBranch)
    setSelection(currentBranch || items[0]) // Found or fallback to the first result
  }, [branch, defaultBranch, items, ref, setSelection])

  return {
    selection,
    newPath,
    enableRedirection,
    branchSelectorProps: {
      items,
      value: selection,
      onChange: onChangeHandler,
    },
  }
}

export function useSummary() {
  const { repo, owner, provider, branch } = useParams()
  const { data: overview, isLoading } = useRepoOverview({
    provider,
    repo,
    owner,
  })
  const { data, isLoading: isLoadingRepoCoverage } = useRepoCoverage({
    provider,
    repo,
    owner,
    branch,
  })
  const { selection, branchSelectorProps, newPath, enableRedirection } =
    useBranchSelector(overview?.branches, overview?.defaultBranch)

  return {
    isLoading: isLoading && isLoadingRepoCoverage,
    data,
    branchSelectorProps,
    newPath,
    enableRedirection,
    currenBranchSelected: selection,
    defaultBranch: overview?.defaultBranch,
    privateRepo: overview?.private,
    coverage: overview?.coverage,
  }
}
