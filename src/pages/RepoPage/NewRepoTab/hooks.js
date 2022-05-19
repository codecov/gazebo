import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useCommits } from 'services/commits'
import { useRedirect } from 'shared/useRedirect'

export function useRedirectToVueOverview({
  noAccessOpenSource,
  missingUploadToken,
}) {
  const { provider, owner, repo } = useParams()
  const href = `/${provider}/${owner}/${repo}`
  const { hardRedirect } = useRedirect({ href })
  const { data: commits } = useCommits({ provider, owner, repo })

  useEffect(() => {
    // Let vue handle deactivated repos
    if (Array.isArray(commits) && commits?.length > 0) {
      hardRedirect()
      return
    }

    // Open source repo not yet set up cannot be set up by a user not part of the org (dont expose token)
    if (noAccessOpenSource) {
      hardRedirect()
      return
    }

    // Hopefully not hitting this in prod but just incase
    if (missingUploadToken) {
      hardRedirect()
      return
    }
  }, [hardRedirect, noAccessOpenSource, missingUploadToken, commits])
}
