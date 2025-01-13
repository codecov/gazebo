import { captureException } from '@sentry/react'
import { useEffect } from 'react'
import { useParams } from 'react-router'

import { useRepo } from 'services/repo'
import { useOwner } from 'services/user'

import { AmplitudeEventTracker, initAmplitude } from './amplitude/amplitude'
import { StubbedEventTracker } from './stub'
import { EventTracker } from './types'

// EventTracker singleton
let EVENT_TRACKER: EventTracker = new StubbedEventTracker()

export function initEventTracker(): void {
  // Sets the global EventTracker singleton and calls necessary init functions
  try {
    initAmplitude()
    EVENT_TRACKER = new AmplitudeEventTracker()
  } catch (e) {
    if (process.env.REACT_APP_ENV === 'production') {
      // If in production, we need to know this has occured.
      captureException(e)
    }
  }
}

// Returns the global EventTracker instance.
export function eventTracker(): EventTracker {
  return EVENT_TRACKER
}

// Hook to keep the global EventTracker's context up-to-date.
export function useEventContext() {
  const { provider, owner, repo } = useParams<{
    provider?: string
    owner?: string
    repo?: string
  }>()

  const { data: ownerData } = useOwner({ username: owner })
  const { data: repoData } = useRepo({
    provider: provider || '',
    owner: owner || '',
    repo: repo || '',
    opts: { enabled: !!(provider && owner && repo) },
  })

  useEffect(() => {
    EVENT_TRACKER.setContext({
      owner: ownerData?.ownerid
        ? {
            id: ownerData?.ownerid,
          }
        : undefined,
      repo: repoData?.repository
        ? {
            id: repoData?.repository?.repoid,
            isPrivate: repoData?.repository.private || undefined,
          }
        : undefined,
    })
  }, [ownerData, repoData])
}
