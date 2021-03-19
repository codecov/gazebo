import PropTypes from 'prop-types'
import cs from 'classnames'
import uniqueId from 'lodash/uniqueId'
import defaultTo from 'lodash/defaultTo'

const styles = {
  input:
    'block rounded border border-ds-gray-secondary px-3 py-1 text-sm w-full',
  label: 'block font-semibold mb-2',
}

function TextInput({ type = 'text', label, placeholder, ...props }) {
  const id = uniqueId('text-input')

  // If no label, the placeholder is used as a hidden label for a11y
  const textLabel = defaultTo(label, placeholder)

  return (
    <div>
      <label
        htmlFor={id}
        className={cs(styles.label, {
          hidden: !label,
        })}
      >
        {textLabel}
      </label>
      <input
        id={id}
        type={type}
        className={styles.input}
        placeholder={placeholder}
        {...props}
      />
    </div>
  )
}

TextInput.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
}

export default TextInput
