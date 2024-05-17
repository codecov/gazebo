import copy from 'copy-to-clipboard'
import { cva, type VariantProps } from 'cva'
import React, { useState } from 'react'

import { cn } from 'shared/utils/cn'
import Icon from 'ui/Icon'

const copyClipboard = cva([], {
  variants: {
    variant: {
      default: 'text-ds-blue-darker',
      muted: 'text-ds-grey-octonary',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})
interface CopyClipboardProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof copyClipboard> {
  value: string
  label?: string
  onClick?: () => void
}

const CopyClipboard = React.forwardRef<HTMLButtonElement, CopyClipboardProps>(
  ({ value, label, onClick = () => {}, variant, className, ...props }, ref) => {
    const [showSuccess, setShowSuccess] = useState(false)

    const handleCopy = () => {
      copy(value)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 1500)
      onClick()
    }

    return (
      <button
        onClick={handleCopy}
        aria-label={label ?? `Copy ${value}`}
        ref={ref}
        {...props}
      >
        {showSuccess ? (
          <div className="text-ds-primary-green">
            <Icon name="check" />
          </div>
        ) : (
          <div className={cn(copyClipboard({ className, variant }))}>
            <Icon name="clipboardCopy" />
          </div>
        )}
      </button>
    )
  }
)
CopyClipboard.displayName = 'CopyClipboard'

export { CopyClipboard }
