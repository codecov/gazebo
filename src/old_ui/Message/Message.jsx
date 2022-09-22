import cs from 'classnames'
import PropTypes from 'prop-types'

import Icon from 'old_ui/Icon'

const typeToStyle = {
  success: {
    text: 'text-success-900',
    background: 'bg-success-500',
    backgroundIcon: 'bg-success-100',
    icon: 'check',
  },
  warning: {
    text: 'text-warning-900',
    background: 'bg-codecov-orange',
    backgroundIcon: 'bg-error-100',
    icon: 'exclamationCircle',
  },
  info: {
    text: 'text-info-900',
    background: 'bg-info-500',
    backgroundIcon: 'bg-info-100',
    icon: 'infoCircle',
  },
  error: {
    text: 'text-error-900',
    background: 'bg-error-500',
    backgroundIcon: 'bg-error-100',
    icon: 'ban',
  },
}

function Message({ className = 'p-4', variant, children, onClose }) {
  const style = typeToStyle[variant]
  const wrapperClassname = cs(
    'rounded flex w-full flex items-center',
    style.text,
    style.background,
    className
  )

  return (
    <div className={wrapperClassname}>
      <div className={cs('rounded-full mr-4', style.backgroundIcon)}>
        <Icon name={style.icon} />
      </div>
      <div>{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close"
          className="ml-auto inline-flex items-center"
        >
          <Icon name="times" />
        </button>
      )}
    </div>
  )
}

Message.propTypes = {
  variant: PropTypes.oneOf(Object.keys(typeToStyle)).isRequired,
  onClose: PropTypes.func,
}

export default Message
