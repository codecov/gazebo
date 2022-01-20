import { useEffect } from 'react'
import { useParams, useHistory } from 'react-router'
import { useCommits } from 'services/commits'

function useRedirect() {
  const { provider, owner, repo } = useParams()
  const history = useHistory()

  return {
    hardRedirect: () => {
      console.log('history push')
      history.push(`/${provider}/${owner}/${repo}`)
      history.go() // Force refresh
    },
  }
}

export function useRedirectToVueOverview({
  noAccessOpenSource,
  missingUploadToken,
}) {
  const { hardRedirect } = useRedirect()
  const { provider, owner, repo } = useParams()
  const { data: commits } = useCommits({ provider, owner, repo })

  useEffect(() => {
    // Let vue handle deactivated repos
    if (Array.isArray(commits) && commits?.length > 0) {
      console.log('commits')

      hardRedirect()
    }

    // Open source repo not yet set up cannot be set up by a user not part of the org (dont expose token)
    if (noAccessOpenSource) {
      console.log('redirect if not member')

      hardRedirect()
    }

    // Hopefully not hitting this in prod but just incase
    if (missingUploadToken) {
      console.log('no token')

      hardRedirect()
    }
  }, [hardRedirect, noAccessOpenSource, missingUploadToken, commits])
}
