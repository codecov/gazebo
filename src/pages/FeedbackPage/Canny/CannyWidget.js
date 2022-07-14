import PropTypes from 'prop-types'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Canny, CannyLoader } from './cannyUtils'

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
    const loader = new CannyLoader()
    ;(async () => {
      try {
        refCanny.current = await loader.load()
        setLoaded(true)
      } catch (err) {
        setError(errorFunc)
      }
    })()
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
