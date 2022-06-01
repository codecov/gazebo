import PropTypes from 'prop-types'

import CopyClipboard from 'ui/CopyClipboard'

const TokenWrapper = ({ token }) => {
  return (
    <div className="flex flex-row gap-1">
      <pre className="font-mono bg-ds-gray-secondary text-ds-gray-octonary h-auto">
        {token}
      </pre>
      <CopyClipboard string={token} showLabel />
    </div>
  )
}

TokenWrapper.propTypes = {
  token: PropTypes.string.isRequired,
}

export default TokenWrapper
