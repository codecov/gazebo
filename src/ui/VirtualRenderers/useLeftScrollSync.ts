import { useLayoutEffect } from 'react'

interface UseLeftScrollSyncArgs {
  textAreaRef: React.RefObject<HTMLTextAreaElement>
  overlayRef: React.RefObject<HTMLDivElement>
}

export const useLeftScrollSync = ({
  textAreaRef,
  overlayRef,
}: UseLeftScrollSyncArgs) => {
  // this effect syncs the scroll position of the text area with the parent div
  useLayoutEffect(() => {
    // if the text area or code display element ref is not available, return
    if (!textAreaRef.current || !overlayRef.current) return
    // copy the ref into a variable so we can use it in the cleanup function
    const clonedTextAreaRef = textAreaRef.current

    // sync the scroll position of the text area with the code highlight div
    const onScroll = () => {
      if (!clonedTextAreaRef || !overlayRef.current) return
      overlayRef.current.scrollLeft = clonedTextAreaRef?.scrollLeft
    }

    // add the scroll event listener
    clonedTextAreaRef.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      // remove the scroll event listener
      clonedTextAreaRef?.removeEventListener('scroll', onScroll)
    }
  }, [overlayRef, textAreaRef])
}
