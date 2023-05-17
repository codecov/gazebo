import cs from 'classnames'
import copy from 'copy-to-clipboard'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'

import Icon from 'ui/Icon'

const copyIconClasses = {
  default: `text-ds-blue-darker`,
  muted: `text-ds-grey-octonary`,
}

function CopyClipboard({
  string,
  showLabel = false,
  variant = 'default',
  onClick = () => {},
}) {
  const [showSuccess, setShowSuccess] = useState(false)

  const copyIconClass = copyIconClasses[variant]

  function handleCopy() {
    setShowSuccess(copy(string))
    onClick()
  }

  useEffect(() => {
    let timer
    if (showSuccess) {
      timer = setTimeout(() => setShowSuccess(false), 1500)
    }

    return () => {
      clearTimeout(timer)
    }
  }, [showSuccess])

  return (
    <button
      onClick={handleCopy}
      className="flex items-center outline-none focus:outline-none"
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
        data-testid="clipboard"
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
  onClick: PropTypes.func,
}

export default CopyClipboard
