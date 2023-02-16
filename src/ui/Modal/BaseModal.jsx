import PropTypes from 'prop-types'

import Icon from 'ui/Icon'

function BaseModal({
  onClose,
  body,
  footer,
  title,
  subtitle,
  hasCloseButton = true,
}) {
  return (
    <div className="rounded bg-white">
      <header className="flex items-center justify-between px-4 pt-4">
        <h2 className="text-3xl font-semibold">{title}</h2>
        {hasCloseButton && (
          <span
            className="cursor-pointer fill-current text-ds-gray-octonary"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="x" />
          </span>
        )}
      </header>
      {subtitle && <p className="px-4 text-lg">{subtitle}</p>}
      {body && (
        <div className="mt-4 max-h-96 w-full overflow-y-auto border-t p-6 text-sm text-ds-gray-octonary">
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

BaseModal.propTypes = {
  hasCloseButton: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.oneOfType([
    PropTypes.element.isRequired,
    PropTypes.string.isRequired,
  ]),
  body: PropTypes.oneOfType([
    PropTypes.element.isRequired,
    PropTypes.string.isRequired,
  ]),
  footer: PropTypes.element,
}

export default BaseModal
