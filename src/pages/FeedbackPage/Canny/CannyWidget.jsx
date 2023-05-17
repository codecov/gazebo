import PropTypes from 'prop-types'
import { useEffect, useMemo, useRef, useState } from 'react'

import Canny from './Canny'
import CannyLoader from './CannyLoader'

const errorFunc = (e) => !e

function CannyWidget({ basePath, boardToken, ssoToken }) {
  const [error, setError] = useState(false)
  const [isLoaded, setLoaded] = useState(false)
  const refCanny = useRef(null)

  const canny = useMemo(() => {
    if (isLoaded) return new Canny(refCanny.current)
    return null
  }, [isLoaded])

  useEffect(() => {
    let unMounted = false
    const loader = new CannyLoader()
    ;(async () => {
      try {
        refCanny.current = await loader.load()
        if (unMounted) return
        setLoaded(true)
      } catch (err) {
        if (unMounted) return
        setError(errorFunc)
      }
    })()

    return () => {
      unMounted = true
    }
  }, [])

  useEffect(() => {
    if (isLoaded) {
      canny.render({
        basePath,
        boardToken,
        ssoToken,
      })
    }
  }, [basePath, boardToken, ssoToken, canny, isLoaded])

  if (error) throw new Error('Unable to load Canny scripts')

  return <div data-testid="canny-div" data-canny="" />
}

CannyWidget.propTypes = {
  basePath: PropTypes.string,
  boardToken: PropTypes.string,
  ssoToken: PropTypes.string,
}

export default CannyWidget
