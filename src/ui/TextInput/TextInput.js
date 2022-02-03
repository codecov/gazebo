import PropTypes from 'prop-types'
import cs from 'classnames'
import uniqueId from 'lodash/uniqueId'
import defaultTo from 'lodash/defaultTo'
import { forwardRef } from 'react'

import Icon from 'ui/Icon'

const styles = {
  input: 'block rounded border border-ds-gray-tertiary px-3 text-sm w-full h-8',
  label: 'block font-semibold mb-2',
  iconWrapper:
    'absolute text-ds-gray-quaternary left-2 h-full flex items-center',
}

// TODO dont pass className to input
const TextInput = forwardRef(
  ({ type = 'text', icon, label, placeholder, ...props }, ref) => {
    const id = uniqueId('text-input')

    // If no label, the placeholder is used as a hidden label for a11y
    const textLabel = defaultTo(label, placeholder)

    return (
      <div>
        <label
          htmlFor={id}
          className={cs(styles.label, {
            'sr-only': !label,
          })}
        >
          {textLabel}
        </label>
        <div className="relative">
          {icon && (
            <div className={styles.iconWrapper}>
              <Icon size="sm" variant="outline" name={icon} />
            </div>
          )}
          <input
            ref={ref}
            id={id}
            type={type}
            className={cs(styles.input, {
              'pl-7': Boolean(icon),
            })}
            placeholder={placeholder}
            {...props}
          />
        </div>
      </div>
    )
  }
)

TextInput.displayName = 'TextInput'

TextInput.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  icon: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
}

export default TextInput
