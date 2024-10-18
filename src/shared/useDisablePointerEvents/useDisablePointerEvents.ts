import { useLayoutEffect, useRef } from 'react'

import { requestAnimationTimeout } from 'shared/utils/animationFrameUtils'

export const useDisablePointerEvents = (
  elementRef: React.RefObject<HTMLElement>
) => {
  // this ref is actually used to store the ID of the requestAnimationFrame hence Raf instead of Ref
  const pointerEventsRaf = useRef<{ id: number } | null>(null)

  useLayoutEffect(() => {
    const onScroll = (_event: Event) => {
      /**
       * We want to disable pointer events on the virtual file renderer while
       * scrolling because as the user is scrolling the page, the browser needs
       * to also check to see if the user if the pointer is over any
       * interactive elements (like the line number indicators) during the
       * repaint. By disabling these events, we can reduce the amount of work
       * the browser needs to do during the repaint, as it does not need to
       * check these events.
       */
      if (!pointerEventsRaf.current && elementRef.current) {
        elementRef.current.style.pointerEvents = 'none'
      }

      /**
       * If there is a requestAnimationFrame already scheduled, we cancel it
       * and schedule a new one. This is to prevent the pointer events from
       * being re-enabled while the user is still scrolling.
       */
      if (pointerEventsRaf.current) {
        window.cancelAnimationFrame(pointerEventsRaf.current.id)
      }

      /**
       * We then re-enable pointer events after the scroll event has finished so
       * the user can continue interacting with the line number indicators.
       */
      pointerEventsRaf.current = requestAnimationTimeout(() => {
        if (elementRef.current) {
          elementRef.current.style.pointerEvents = 'auto'
          pointerEventsRaf.current = null
        }
      }, 50)
    }

    if (elementRef) {
      window.addEventListener('scroll', onScroll, { passive: true })
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [elementRef])
}