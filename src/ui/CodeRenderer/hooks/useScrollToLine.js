import { useEffect, useRef, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

const generateIdString = ({ number, path, base, head }) => {
  if (head) {
    return `#${path}-R${number}`
  } else if (base || path) {
    return `#${path}-L${number}`
  }

  return `#L${number}`
}

export const useScrollToLine = ({
  number,
  path = '',
  base = false,
  head = false,
}) => {
  const location = useLocation()
  const history = useHistory()
  const lineRef = useRef(null)
  const [targeted, setTargeted] = useState(false)
  const idString = generateIdString({ number, path, base, head })

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

  useEffect(() => {
    if (lineRef?.current && location?.hash === idString) {
      lineRef?.current?.scrollIntoView({ behavior: 'smooth' })
    }
  })

  const handleClick = () => {
    if (location?.hash === idString) {
      location.hash = ''
      history.push(location)
    } else {
      location.hash = idString
      history.push(location)
    }
  }

  return {
    targeted,
    lineRef,
    handleClick,
    idString,
  }
}
