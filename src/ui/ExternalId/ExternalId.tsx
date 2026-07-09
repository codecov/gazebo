import copy from 'copy-to-clipboard'
import { useState } from 'react'

import { cn } from 'shared/utils/cn'
import Icon from 'ui/Icon'

interface ExternalIdProps {
  externalId?: string | null
  label?: string
  className?: string
}

// Renders an owner's support external ID as a single click-to-copy control.
// The clipboard icon (which flips to a checkmark for ~1.5s after a copy) makes
// it obvious the value is meant to be copied for easy copy + paste.
function ExternalId({ externalId, label = 'ID', className }: ExternalIdProps) {
  const [copied, setCopied] = useState(false)

  if (!externalId) return null

  const handleCopy = () => {
    copy(externalId)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Click to copy"
      aria-label={`Copy ${label} ${externalId}`}
      data-testid="owner-external-id"
      className={cn(
        'flex items-center gap-1 font-mono text-xs text-ds-gray-quinary hover:text-ds-gray-octonary hover:underline',
        className
      )}
    >
      <span>
        {label}: {externalId}
      </span>
      {copied ? (
        <Icon name="check" size="sm" label="copied" />
      ) : (
        <Icon name="clipboardCopy" size="sm" label="copy" />
      )}
    </button>
  )
}

export default ExternalId
