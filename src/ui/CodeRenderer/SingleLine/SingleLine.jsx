import cs from 'classnames'
import sum from 'hash-sum'
import PropTypes from 'prop-types'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useLocation } from 'react-use'

import {
  classNamePerLineContent,
  classNamePerLineState,
  getLineState,
  LINE_TYPE,
  lineStateToLabel,
} from 'shared/utils/fileviewer'
import CoverageSelectIcon from 'ui/Icon/CoverageSelectIcon'

const useScrollToLine = ({ number }) => {
  const { path } = useParams()
  const location = useLocation()
  const history = useHistory()
  const lineRef = useRef(null)
  const [targeted, setTargeted] = useState(false)

  const idString = `#${sum(encodeURIComponent(path))}L${number}`

  useLayoutEffect(() => {
    if (location.hash === idString) {
      if (!targeted) {
        setTargeted(true)
      }
    } else {
      if (targeted) {
        setTargeted(false)
      }
    }
  }, [location, idString, targeted])

  const setRef = useCallback(
    (node) => {
      if (node && location.hash === idString) {
        node.scrollIntoView({ behavior: 'smooth' })
      }

      lineRef.current = node
    },
    [idString, location.hash]
  )

  const handleClick = () => {
    if (location.hash === idString) {
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
    setRef,
  }
}

function SingleLine({ line, number, coverage, getLineProps, getTokenProps }) {
  const lineState = getLineState({ coverage })
  const { setRef, handleClick, targeted } = useScrollToLine({ number })

  return (
    <tr
      {...getLineProps({ line, key: number })}
      data-testid="fv-single-line"
      ref={setRef}
    >
      <td
        aria-label={lineStateToLabel[lineState]}
        className={cs(
          targeted
            ? 'bg-ds-gray-octonary text-white'
            : 'text-ds-gray-quaternary',
          'line-number font-mono text-right border-solid px-2 select-none relative border-ds-gray-tertiary border-r',
          !targeted && classNamePerLineState[lineState]
        )}
      >
        <button onClick={handleClick}>
          <span className={cs({ invisible: !targeted })}>#</span>
          {number}
        </button>
      </td>
      <td className={cs('pl-2 break-all', classNamePerLineContent[lineState])}>
        <div className="flex items-center justify-between">
          <div>
            {line.map((token, key) => (
              <span key={key} {...getTokenProps({ token, key })} />
            ))}
          </div>
          <CoverageSelectIcon coverage={lineState} />
        </div>
      </td>
    </tr>
  )
}

SingleLine.propTypes = {
  line: PropTypes.array.isRequired,
  coverage: PropTypes.oneOf(Object.values(LINE_TYPE)),
  number: PropTypes.number.isRequired,
  getLineProps: PropTypes.func,
  getTokenProps: PropTypes.func,
}

export default SingleLine
