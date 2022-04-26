import { sanitize } from 'dompurify'
import PropTypes from 'prop-types'
import { useState } from 'react'

import A from 'ui/A'

const TruncateEnum = Object.freeze({
  EXPAND: 'see more...',
  COLLAPSE: 'see less...',
})

function TruncatedMessage({ message }) {
  const [truncateLabel, setTruncateLabel] = useState(TruncateEnum.EXPAND)

  const isLongMessage = message.length > 165
  const truncatedMsg =
    truncateLabel === TruncateEnum.EXPAND
      ? isLongMessage
        ? message.substr(0, 165)
        : message
      : message

  return (
    <div>
      <pre className="text-lg font-semibold break-all whitespace-pre-wrap inline font-sans">
        {sanitize(truncatedMsg)}{' '}
      </pre>
      {isLongMessage && (
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
