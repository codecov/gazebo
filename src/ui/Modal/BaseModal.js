import PropTypes from 'prop-types'

import Icon from 'ui/Icon'

function BaseModal({ onClose, body, footer, title }) {
  return (
    <div className="bg-white rounded">
      <header className="flex justify-between items-center p-4">
        <h2 className="font-semibold text-base">{title}</h2>
        <span
          className="cursor-pointer fill-current text-ds-gray-septenary"
          onClick={onClose}
          aria-label="Close"
        >
          <Icon name="x" />
        </span>
      </header>
      {body && (
        <div className="w-full p-4 text-ds-gray-octonary border-t text-sm max-h-96 overflow-y-auto">
          {body}
        </div>
      )}
      {footer && (
        <footer className="border-t flex justify-end rounded-b p-4 bg-ds-gray-primary">
          {footer}
        </footer>
      )}
    </div>
  )
}

BaseModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  body: PropTypes.oneOfType([
    PropTypes.element.isRequired,
    PropTypes.string.isRequired,
  ]),
  footer: PropTypes.element,
}

export default BaseModal
