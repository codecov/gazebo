import PropTypes from 'prop-types'

import CopyClipboard from 'ui/CopyClipboard'

const TokenWrapper = ({ uploadToken }) => {
  return (
    <div className="flex flex-row">
      <pre className="font-mono bg-ds-gray-secondary text-ds-gray-octonary h-auto">
        {uploadToken}
      </pre>
      <CopyClipboard string={uploadToken} />
    </div>
  )
}

TokenWrapper.propTypes = {
  uploadToken: PropTypes.string.isRequired,
}

export default TokenWrapper
