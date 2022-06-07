import { useCallback, useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { useRepoCoverage, useRepoOverview } from 'services/repo'
import { mapEdges } from 'shared/utils/graphql'

const formatPath = (pathname) =>
  pathname.charAt(pathname.length - 1) === '/'
    ? pathname.slice(0, pathname.length - 1)
    : pathname

export function useCoverageTabRedirectLogic({ defaultBranch }) {
  const location = useLocation()
  const [redirectLocation, setRedirectLocation] = useState()
  const { repo, branch } = useParams()

  const createPath = useCallback(
    ({ name }) => {
      const pathname = formatPath(location.pathname)
      if (branch) {
        return pathname.replace(
          `${repo}/branch/${branch}`,
          `${repo}/branch/${name}`
        )
      }
      return `${pathname}/branch/${name}`
    },
    [branch, location.pathname, repo]
  )

  useEffect(() => {
    if (!branch) {
      setRedirectLocation(createPath({ name: defaultBranch }))
    }
  }, [branch, createPath, defaultBranch])

  const handleRedirect = (selected) => {
    setRedirectLocation(createPath(selected))
  }

  return {
    redirectLocation,
    handleRedirect,
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
  const { redirectLocation, handleRedirect } = useCoverageTabRedirectLogic({
    defaultBranch: overview?.defaultBranch,
  })

  const branches = mapEdges(overview?.branches)
  const [currentBranch] = branches?.filter((b) => b.name === branch)

  return {
    isLoading: isLoading && isLoadingRepoCoverage,
    data,
    branches,
    currenBranchSelected: currentBranch,
    defaultBranch: overview?.defaultBranch,
    privateRepo: overview?.private,
    coverage: overview?.coverage,
    setNewLocation: handleRedirect,
    conditionalRedirect: redirectLocation,
  }
}
