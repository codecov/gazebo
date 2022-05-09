import cs from 'classnames'
import { sanitize } from 'dompurify'
import PropTypes from 'prop-types'
import { useLayoutEffect, useRef, useState } from 'react'

import A from 'ui/A'

const TruncateEnum = Object.freeze({
  EXPAND: 'see more',
  COLLAPSE: 'see less',
})

function TruncatedMessage({ message }) {
  const [truncateLabel, setTruncateLabel] = useState(TruncateEnum.EXPAND)
  const [isTruncatable, setIsTruncatable] = useState(false)
  const msgRef = useRef(null)

  useLayoutEffect(() => {
    const element = msgRef.current

    if (
      element.offsetHeight < element.scrollHeight ||
      element.offsetWidth < element.scrollWidth
    ) {
      setIsTruncatable(true)
    } else {
      setIsTruncatable(false)
    }
  }, [])

  return (
    <div>
      <pre
        ref={msgRef}
        data-testid="truncate-message"
        className={cs(
          'text-lg font-semibold break-all whitespace-pre-wrap inline font-sans',
          {
            'line-clamp-1': truncateLabel === TruncateEnum.EXPAND,
          }
        )}
      >
        {sanitize(message)}{' '}
      </pre>

      {isTruncatable && (
        <A
          hook="truncate-message"
          onClick={() =>
            setTruncateLabel(
              truncateLabel === TruncateEnum.EXPAND
                ? TruncateEnum.COLLAPSE
                : TruncateEnum.EXPAND
            )
          }
        >
          {truncateLabel}
        </A>
      )}
    </div>
  )
}

TruncatedMessage.propTypes = {
  message: PropTypes.string,
}

export default TruncatedMessage
