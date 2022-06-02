import cs from 'classnames'
import copy from 'copy-to-clipboard'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'

import Icon from 'ui/Icon'

const copyIconClasses = {
  default: `text-ds-blue-darker`,
  muted: `text-ds-grey-octonary`,
}

function CopyClipboard({ string, showLabel = false, variant = 'default' }) {
  const [showSuccess, setShowSuccess] = useState(false)

  const copyIconClass = copyIconClasses[variant]

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
      className="flex outline-none focus:outline-none items-center"
    >
      {showSuccess ? (
        <div className="text-ds-primary-green">
          <Icon className="fill-current" name="check" />
        </div>
      ) : (
        <div className={copyIconClass}>
          <Icon className="fill-current" name="clipboard-copy" />
        </div>
      )}

      <span
        className={cs('cursor-pointer text-xs font-semibold', {
          [copyIconClass]: variant === 'muted',
          'sr-only': !showLabel,
          'text-ds-blue-darker': variant === 'default',
        })}
      >
        copy
      </span>
    </button>
  )
}

CopyClipboard.propTypes = {
  string: PropTypes.string.isRequired,
  showLabel: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'muted']),
}

export default CopyClipboard
