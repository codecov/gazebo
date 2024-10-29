import { useEffect, useState } from 'react'

export const useIsOverflowing = (ref: React.RefObject<HTMLDivElement>) => {
  const [isOverflowing, setIsOverflowing] = useState(false)

  useEffect(() => {
    if (!ref.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries?.[0]
      if (entry) {
        setIsOverflowing(entry.target.scrollWidth > entry.target.clientWidth)
      }
    })

    resizeObserver.observe(ref.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [ref])

  return isOverflowing
}
