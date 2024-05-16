import copy from 'copy-to-clipboard'
import { useEffect, useState } from 'react'

import { cn } from 'shared/utils/cn'
import Icon from 'ui/Icon'

const copyIconClasses = {
  default: `text-ds-blue-darker`,
  muted: `text-ds-grey-octonary`,
}

interface CopyClipboardProps {
  string: string
  showLabel?: boolean
  variant?: keyof typeof copyIconClasses
  onClick?: () => void
  testIdExtension?: string
}

function CopyClipboard({
  string,
  showLabel = false,
  variant = 'default',
  onClick = () => {},
  testIdExtension,
}: CopyClipboardProps) {
  const [showSuccess, setShowSuccess] = useState(false)

  const copyIconClass = copyIconClasses[variant]

  function handleCopy() {
    setShowSuccess(copy(string))
    onClick()
  }

  useEffect(() => {
    let timer: NodeJS.Timeout
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
          <Icon name="check" />
        </div>
      ) : (
        <div className={copyIconClass}>
          <Icon name="clipboardCopy" />
        </div>
      )}

      <span
        data-testid={`clipboard${testIdExtension}`}
        className={cn('cursor-pointer text-xs font-semibold', {
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

export default CopyClipboard
