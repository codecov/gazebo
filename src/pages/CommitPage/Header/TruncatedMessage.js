import { sanitize } from 'dompurify'
import PropTypes from 'prop-types'
import { useState } from 'react'

import { TruncateEnum } from 'shared/utils/commit'

function TruncatedMessage({ message }) {
  const [truncateLabel, setTruncateLabel] = useState(TruncateEnum.EXPAND)
  const isLongMessage = message.length > 50
  const truncatedMsg =
    truncateLabel === TruncateEnum.EXPAND
      ? isLongMessage
        ? message.substr(0, 50)
        : message
      : message

  return (
    <div>
      <pre className="text-lg font-semibold break-all whitespace-pre-wrap inline">
        {sanitize(truncatedMsg)}{' '}
      </pre>
      {isLongMessage && (
        <button
          className="text-ds-blue-darker"
          onClick={() =>
            setTruncateLabel(
              truncateLabel === TruncateEnum.EXPAND
                ? TruncateEnum.COLLAPSE
                : TruncateEnum.EXPAND
            )
          }
        >
          {truncateLabel}
        </button>
      )}
    </div>
  )
}

TruncatedMessage.propTypes = {
  message: PropTypes.string,
}

export default TruncatedMessage
