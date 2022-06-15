import cs from 'classnames'
import PropTypes from 'prop-types'

import CopyClipboard from 'ui/CopyClipboard'

const TokenWrapper = ({ token, truncate = false }) => {
  return (
    <div className="flex flex-row gap-1 overflow-auto">
      <pre
        className={cs(
          'font-mono bg-ds-gray-secondary text-ds-gray-octonary h-auto whitespace-pre-line',
          {
            'line-clamp-1': truncate,
          }
        )}
      >
        {token}
      </pre>
      <CopyClipboard string={token} showLabel />
    </div>
  )
}

TokenWrapper.propTypes = {
  token: PropTypes.string.isRequired,
  truncate: PropTypes.bool,
}

export default TokenWrapper
