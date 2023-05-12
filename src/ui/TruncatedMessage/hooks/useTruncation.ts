import { useCallback, useLayoutEffect, useRef, useState } from 'react'

export const useTruncation = () => {
  const ref = useRef<HTMLPreElement>(null)
  const handledDraw = useRef(false)
  const [canTruncate, setCanTruncate] = useState(false)
  const [, setIsTruncated] = useState(true)

  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    const element = entries?.[0]?.target

    let heightControl = false
    let widthControl = false
    if (element) {
      heightControl = element.clientHeight < element.scrollHeight
      widthControl = element.clientWidth < element.scrollWidth
    }

    if (heightControl || widthControl) {
      setCanTruncate(true)
      setIsTruncated(true)
    } else {
      setIsTruncated(false)
    }
  }, [])

  const [resizeObs] = useState(() => new ResizeObserver(handleResize))

  useLayoutEffect(() => {
    if (!resizeObs) return

    const element = ref.current
    if (element) {
      resizeObs.observe(element)
    }

    handledDraw.current = true

    return () => {
      resizeObs.disconnect()
    }
  }, [resizeObs])

  return {
    ref,
    canTruncate,
  }
}
