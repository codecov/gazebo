import cs from 'classnames'
import PropTypes from 'prop-types'

import Icon from 'old_ui/Icon'

const typeToStyle = {
  success: {
    background: 'bg-green-100 dark:bg-opacity-20',
    backgroundIcon: 'bg-green-100 dark:bg-opacity-20',
    icon: 'check',
  },
  warning: {
    background: 'bg-orange-100 dark:bg-opacity-20',
    backgroundIcon: 'bg-error-100 dark:bg-opacity-20',
    icon: 'exclamationCircle',
  },
  info: {
    background: 'bg-ds-blue-nonary  dark:bg-opacity-20',
    backgroundIcon: 'bg-ds-blue-nonary  dark:bg-opacity-20',
    icon: 'infoCircle',
  },
  error: {
    background: 'bg-error-100 dark:bg-opacity-20',
    backgroundIcon: 'bg-error-100 dark:bg-opacity-20',
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
