import { useCallback, useEffect, useRef, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

const generateIdString = ({ number, path, base, head }) => {
  if (head) {
    return `#${path}-R${number}`
  } else if (base || path) {
    return `#${path}-L${number}`
  }

  return `#L${number}`
}

const handleClick =
  ({ location, history, idString }) =>
  () => {
    if (location?.hash === idString) {
      location.hash = ''
      history.push(location)
    } else {
      location.hash = idString
      history.push(location)
    }
  }

const useTarget = ({ location, idString }) => {
  const [targeted, setTargeted] = useState(false)

  useEffect(() => {
    if (location?.hash === idString) {
      if (!targeted) {
        setTargeted(true)
      }
    } else {
      if (targeted) {
        setTargeted(false)
      }
    }
  }, [location, idString, targeted])

  return { targeted, setTargeted }
}

export const useScrollToLine = ({
  number,
  path = '',
  base = false,
  head = false,
  stickyPadding = 0,
}) => {
  const location = useLocation()
  const history = useHistory()
  const idString = generateIdString({ number, path, base, head })
  const { targeted } = useTarget({ location, idString })
  const lineRef = useRef(null)
  const hasDoneInitialDrawRef = useRef(false)

  const handleResize = useCallback(
    (entries) => {
      const entry = entries?.[0]

      if (location?.hash === idString) {
        window.scrollTo({
          behavior: 'smooth',
          left: 0,
          top: entry?.target?.offsetTop + stickyPadding,
        })
      }
    },
    [idString, location?.hash, stickyPadding]
  )

  const [resizeObs] = useState(() => new ResizeObserver(handleResize))

  useEffect(() => {
    if (!resizeObs) return

    const ref = lineRef?.current

    if (ref) {
      if (location?.hash === idString) {
        if (stickyPadding) {
          // do the first scroll on load
          if (!hasDoneInitialDrawRef.current) {
            resizeObs.observe(ref)
          }
          // all subsequent scrolls can just be done via window directly
          else {
            resizeObs.disconnect()

            window.scrollTo({
              behavior: 'smooth',
              left: 0,
              top: ref?.offsetTop + stickyPadding,
            })
          }
        }
        // if it does not require padding just easily scroll into view
        else {
          ref?.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }

    hasDoneInitialDrawRef.current = true

    return () => {
      resizeObs.disconnect()
    }
  }, [idString, lineRef, location?.hash, resizeObs, stickyPadding])

  return {
    targeted,
    lineRef,
    handleClick: handleClick({ location, history, idString }),
    idString,
  }
}
