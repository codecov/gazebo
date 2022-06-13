import PropTypes from 'prop-types'

import CopyClipboard from 'ui/CopyClipboard'

const TokenWrapper = ({ token, onClick }) => {
  return (
    <div className="flex flex-row gap-1">
      <pre className="font-mono bg-ds-gray-secondary text-ds-gray-octonary h-auto">
        {token}
      </pre>
      <CopyClipboard string={token} onClick={onClick} showLabel />
    </div>
  )
}

TokenWrapper.propTypes = {
  token: PropTypes.string.isRequired,
  onClick: PropTypes.func,
}

export default TokenWrapper
