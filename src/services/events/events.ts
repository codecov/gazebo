import { captureException } from '@sentry/react'
import { useQuery as useQueryV5 } from '@tanstack/react-queryV5'
import { useRef } from 'react'
import { useParams } from 'react-router'

import { Provider } from 'shared/api/helpers'

import { AmplitudeEventTracker, initAmplitude } from './amplitude/amplitude'
import { OwnerContextQueryOpts, RepoContextQueryOpts } from './hooks'
import { Event, EventContext, EventTracker, Identity } from './types'

class StubbedEventTracker implements EventTracker {
  identify(_identity: Identity): void {}
  track(_event: Event): void {}
  setContext(_context: EventContext): void {}
}

// EventTracker singleton
let EVENT_TRACKER: EventTracker = new StubbedEventTracker()

export function initEventTracker(): void {
  // Sets the global EventTracker singleton and calls necessary init functions
  try {
    initAmplitude()
    EVENT_TRACKER = new AmplitudeEventTracker()
  } catch (e) {
    if (process.env.REACT_APP_ENV === 'production') {
      // If in production, we need to know this has occurred.
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
    provider: Provider
    owner?: string
    repo?: string
  }>()
  const context = useRef<EventContext>({})

  const { data: ownerData } = useQueryV5(
    OwnerContextQueryOpts({ provider, owner })
  )
  const { data: repoData } = useQueryV5(
    RepoContextQueryOpts({ provider, owner, repo })
  )

  if (
    ownerData?.ownerid !== context.current.owner?.id ||
    repoData?.repoid !== context.current.repo?.id
  ) {
    // only update if this is a new owner or repo
    const newContext: EventContext = {
      owner: ownerData?.ownerid
        ? {
            id: ownerData?.ownerid,
          }
        : undefined,
      repo: repoData?.repoid
        ? {
            id: repoData.repoid,
            isPrivate: repoData.private === null ? undefined : repoData.private,
          }
        : undefined,
    }
    EVENT_TRACKER.setContext(newContext)
    context.current = newContext
  }
}
