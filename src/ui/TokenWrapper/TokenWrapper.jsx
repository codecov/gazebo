import cs from 'classnames'
import PropTypes from 'prop-types'

import { CopyClipboard } from 'ui/CopyClipboard'

const TokenWrapper = ({ token, onClick, truncate = false, encodedToken }) => {
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
        {encodedToken ? encodedToken : token}
      </pre>
      <CopyClipboard value={token} onClick={onClick} label="Copy token" />
    </div>
  )
}

TokenWrapper.propTypes = {
  token: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  truncate: PropTypes.bool,
  encodedToken: PropTypes.string,
}

export default TokenWrapper
