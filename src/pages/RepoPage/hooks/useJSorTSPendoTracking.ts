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

  const { data: ownerData } = useOwner({
    username: owner,
  })

  // track the previous owner so we can compare it to the current owner
  const previousOwner = useRef<typeof ownerData | null>(null)

  const { data: repoOverview } = useRepoOverview({
    provider,
    owner,
    repo,
  })

  const { data: userData } = useUser({})

  useEffect(() => {
    console.error({
      // if we don't have any data then we can't do anything
      ownerData,
      repoOverview,
      userData,
      // no sense in firing this event if we don't have the data we need
      jsOrTsPresent: repoOverview?.jsOrTsPresent,
      // if the owner hasn't changed, we don't need to update the pendo options
      owner: previousOwner.current?.ownerid === ownerData?.ownerid,
    })
    if (
      // if we don't have any data then we can't do anything
      !ownerData ||
      !repoOverview ||
      !userData ||
      // no sense in firing this event if we don't have the data we need
      !repoOverview?.jsOrTsPresent ||
      // if the owner hasn't changed, we don't need to update the pendo options
      previousOwner.current?.ownerid === ownerData?.ownerid
    ) {
      return
    }

    if (window?.pendo?.updateOptions) {
      const user = getUserData(userData, pendoDefaultUser)

      window.pendo.updateOptions({
        visitor: snakeifyKeys({
          ...getCurUserInfo(user),
          jsOrTsPresent: repoOverview?.jsOrTsPresent,
        }),
        account: snakeifyKeys({
          id: ownerData?.ownerid,
          name: ownerData?.username,
          isCurrentUserPartOfOrg: ownerData?.isCurrentUserPartOfOrg,
          isAdmin: ownerData?.isAdmin,
        }),
      })

      previousOwner.current = ownerData
    }
  }, [ownerData, repoOverview, userData])

  return
}
