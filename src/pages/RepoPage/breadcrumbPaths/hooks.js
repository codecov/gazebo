import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

export function useBreadcrumbPaths(branch = 'main') {
  const { owner, repo } = useParams()
  const { pathname } = useLocation()
  const [paths, setPaths] = useState([])
  const [isCommitsPage, setIsCommitsPage] = useState()

  useEffect(() => {
    const isCommitsPage = pathname.split('/')[4] === 'commits'
    const paths = isCommitsPage
      ? [
          { pageName: 'owner', text: owner },
          { pageName: 'repo', text: repo },
          { pageName: '', readOnly: true, text: branch },
        ]
      : [
          { pageName: 'owner', text: owner },
          { pageName: 'repo', text: repo },
        ]
    setPaths(paths)
    setIsCommitsPage(isCommitsPage)
  }, [pathname, owner, repo, branch])

  return { paths, isCommitsPage }
}
