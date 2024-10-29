import { useLayoutEffect } from 'react'

export const useSyncScrollLeft = (
  scrollingRef: React.RefObject<HTMLElement>,
  refsToSync: React.RefObject<HTMLElement>[]
) => {
  // this effect syncs the scroll position of the scrollingRef with the refsToSync
  useLayoutEffect(() => {
    // if the scrollingRef is not available, return
    if (!scrollingRef.current) return

    // clone the scrollingRef so we can use it in the cleanup function
    const clonedScrollingRef = scrollingRef.current

    const onScroll = () => {
      // if there are no refs to sync, return
      if (refsToSync.length === 0) return

      // sync the scroll position of the scrollingRef with the refsToSync
      refsToSync.forEach((ref) => {
        if (clonedScrollingRef && ref.current) {
          ref.current.scrollLeft = clonedScrollingRef.scrollLeft
        }
      })
    }

    // add the scroll event listener
    clonedScrollingRef.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      // remove the scroll event listener
      clonedScrollingRef.removeEventListener('scroll', onScroll)
    }
  }, [scrollingRef, refsToSync])
}
