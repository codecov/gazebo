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
    <div className="bg-white rounded">
      <header className="flex justify-between items-center px-4 pt-4">
        <h2 className="font-semibold text-3xl">{title}</h2>
        {hasCloseButton && (
          <span
            className="cursor-pointer fill-current text-ds-gray-septenary"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="x" />
          </span>
        )}
      </header>
      {subtitle && <p className="px-4 text-lg">{subtitle}</p>}
      {body && (
        <div className="w-full p-6 mt-4 text-ds-gray-octonary border-t text-sm max-h-96 overflow-y-auto">
          {body}
        </div>
      )}
      {footer && (
        <footer className="border-t flex justify-end rounded-b p-4 bg-ds-gray-primary mt-4">
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
