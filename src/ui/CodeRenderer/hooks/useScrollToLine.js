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

  return [targeted, setTargeted]
}

// eslint-disable-next-line max-statements
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
  const [targeted] = useTarget({ location, idString })
  const hasDoneInitialDrawRef = useRef(false)
  const lineRef = useRef(null)

  const handleResize = useCallback(
    (entries) => {
      const [entry] = entries

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

  // eslint-disable-next-line complexity, max-statements
  useEffect(() => {
    if (!resizeObs) return

    const ref = lineRef?.current

    if (ref && location?.hash === idString) {
      if (stickyPadding) {
        if (!hasDoneInitialDrawRef.current) {
          resizeObs.observe(ref)
        } else {
          resizeObs.disconnect()

          window.scrollTo({
            behavior: 'smooth',
            left: 0,
            top: ref?.offsetTop + stickyPadding,
          })
        }
      } else {
        ref?.scrollIntoView({ behavior: 'smooth' })
      }
    }

    hasDoneInitialDrawRef.current = true
    return () => resizeObs.disconnect()
  }, [idString, lineRef, location?.hash, resizeObs, stickyPadding])

  return {
    targeted,
    lineRef,
    handleClick: handleClick({ location, history, idString }),
    idString,
  }
}
