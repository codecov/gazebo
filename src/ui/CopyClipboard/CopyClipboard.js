import Icon from 'ui/Icon'
import copy from 'copy-to-clipboard'
import { useState } from 'react'
import PropTypes from 'prop-types'

function CopyClipboard({ string }) {
  const [showSuccess, setShowSuccess] = useState(false)

  function handleCopy() {
    const copied = copy(string)
    if (copied) {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 1500)
    }
  }

  return (
    <div className="flex items-center ml-2">
      {showSuccess ? (
        <div className="text-ds-primary-green">
          <Icon className="fill-current" name="check" />
        </div>
      ) : (
        <div className="text-ds-blue-darker">
          <Icon className="fill-current" name="clipboard-copy" />
        </div>
      )}

      <span
        onClick={handleCopy}
        className="cursor-pointer text-ds-blue-darker text-xs font-semibold"
      >
        copy
      </span>
    </div>
  )
}

CopyClipboard.propTypes = {
  string: PropTypes.string.isRequired,
}

export default CopyClipboard
