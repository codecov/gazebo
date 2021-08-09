import Icon from 'ui/Icon'
import copy from 'copy-to-clipboard'
import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

function CopyClipboard({ string }) {
  const [showSuccess, setShowSuccess] = useState(false)

  function handleCopy() {
    setShowSuccess(copy(string))
  }

  useEffect(() => {
    if (showSuccess) {
      let timer = setTimeout(() => setShowSuccess(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [showSuccess])

  return (
    <button
      onClick={handleCopy}
      className="flex outline-none focus:outline-none items-center ml-2"
    >
      {showSuccess ? (
        <div className="text-ds-primary-green">
          <Icon className="fill-current" name="check" />
        </div>
      ) : (
        <div className="text-ds-blue-darker">
          <Icon className="fill-current" name="clipboard-copy" />
        </div>
      )}

      <span className="cursor-pointer text-ds-blue-darker text-xs font-semibold">
        copy
      </span>
    </button>
  )
}

CopyClipboard.propTypes = {
  string: PropTypes.string.isRequired,
}

export default CopyClipboard
