import PropTypes from 'prop-types'
import { useEffect } from 'react'

import { useCannyContext } from './CannyProvider'

function CannyWidget({ basePath, boardToken, ssoToken }) {
  const { canny, isLoaded } = useCannyContext()

  useEffect(() => {
    if (isLoaded) {
      canny.render({
        basePath,
        boardToken,
        ssoToken,
      })
    }
  }, [basePath, boardToken, ssoToken, canny, isLoaded])

  return <div data-canny="" />
}

CannyWidget.propTypes = {
  basePath: PropTypes.string,
  boardToken: PropTypes.string,
  ssoToken: PropTypes.string,
}

export default CannyWidget
