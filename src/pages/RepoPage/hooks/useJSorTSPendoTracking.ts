import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'

import { useRepoOverview } from 'services/repo'
import { getCurUserInfo, pendoDefaultUser } from 'services/tracking/pendo'
import { getUserData } from 'services/tracking/utils'
import { useOwner, useUser } from 'services/user'
import { snakeifyKeys } from 'shared/utils/snakeifyKeys'

declare global {
  interface Window {
    pendo?: {
      updateOptions?: (options: object) => void
      initialize?: (options: object) => void
    }
  }
}

interface URLParams {
  provider: string
  owner: string
  repo: string
}

export function useJSorTSPendoTracking() {
  const { provider, owner, repo } = useParams<URLParams>()

  // track the previous repo so we can compare it to the current repo
  // we're setting this to null initially so that we can track the first repo
  const previousRepo = useRef<string | null>(null)

  const { data: ownerData } = useOwner({
    username: owner,
  })

  const { data: repoOverview } = useRepoOverview({
    provider,
    owner,
    repo,
  })

  const { data: userData } = useUser({})

  useEffect(() => {
    if (
      // if we don't have any data then we can't do anything
      !ownerData ||
      !repoOverview ||
      !userData ||
      // if the owner hasn't changed, we don't need to update the pendo options
      previousRepo.current === repo
    ) {
      return
    }

    if (window?.pendo?.updateOptions) {
      const user = getUserData(userData, pendoDefaultUser)

      window.pendo.updateOptions({
        visitor: snakeifyKeys({
          ...getCurUserInfo(user),
          jsOrTsPresent: !!repoOverview?.jsOrTsPresent,
        }),
        account: snakeifyKeys({
          id: ownerData?.ownerid,
          name: ownerData?.username,
          isCurrentUserPartOfOrg: ownerData?.isCurrentUserPartOfOrg,
          isAdmin: ownerData?.isAdmin,
        }),
      })

      // track the previous repo so we can compare it to the current repo
      previousRepo.current = repo
    }
  }, [ownerData, repo, repoOverview, userData])
}
