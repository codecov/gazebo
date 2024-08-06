import React, { ReactElement } from 'react'

import { cn } from 'shared/utils/cn'
import Icon from 'ui/Icon'

interface BaseModalProps {
  body: ReactElement | string
  customHeaderClassname?: string
  footer?: ReactElement
  hasCloseButton?: boolean
  onClose: () => void
  subtitle?: ReactElement | string
  title: ReactElement | string
}

const BaseModal: React.FC<BaseModalProps> = ({
  body,
  customHeaderClassname,
  footer,
  hasCloseButton = true,
  onClose,
  subtitle,
  title,
}) => {
  return (
    <div className="rounded bg-white">
      <header className="flex items-center justify-between px-4 pt-4">
        <h2 className={cn('text-3xl font-semibold', customHeaderClassname)}>
          {title}
        </h2>
        {hasCloseButton && (
          <span
            className="cursor-pointer fill-current text-ds-gray-octonary"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="x" label="modal-close-icon" />
          </span>
        )}
      </header>
      {subtitle && <p className="px-4 text-lg">{subtitle}</p>}
      {body && (
        <div className="mt-4 max-h-96 w-full overflow-y-auto border-t p-4 text-sm text-ds-gray-octonary">
          {body}
        </div>
      )}
      {footer && (
        <footer className="mt-4 flex justify-end rounded-b border-t bg-ds-gray-primary p-4">
          {footer}
        </footer>
      )}
    </div>
  )
}

export default BaseModal
