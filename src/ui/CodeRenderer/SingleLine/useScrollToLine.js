import sum from 'hash-sum'
import { useEffect, useRef, useState } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'

export const useScrollToLine = ({ number }) => {
  const { path } = useParams()
  const location = useLocation()
  const history = useHistory()
  const lineRef = useRef(null)
  const [targeted, setTargeted] = useState(false)
  const idString = `#${sum(encodeURIComponent(path))}-L${number}`

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
  }
}
