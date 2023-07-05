import cs from 'classnames'
import PropTypes from 'prop-types'

const activeClasses = {
  default: 'bg-ds-primary-base text-white',
  gray: 'bg-ds-gray-secondary border-ds-gray-secondary hover:bg-ds-gray-tertiary',
}

const disabledClasses = {
  default:
    'disabled:text-ds-gray-quaternary disabled:border-ds-gray-tertiary disabled:bg-ds-gray-primary',
  gray: 'disabled:bg-white disabled:border-white',
}

function OptionButton({
  active,
  options,
  onChange,
  type,
  disabled,
  variant = 'default',
}) {
  return (
    <div className="flex flex-wrap divide-x rounded border">
      {options.map((o, index) => {
        return (
          <button
            type={type}
            disabled={disabled}
            className={cs(
              'flex-1 py-1 px-2 text-sm cursor-pointer whitespace-nowrap',
              disabledClasses[variant],
              {
                [activeClasses[variant]]: active === o.text && !disabled,
                'rounded-l': index === 0,
                'rounded-r': index === options.length - 1,
              }
            )}
            onClick={() => {
              onChange(o)
            }}
            key={index}
          >
            {o.text}
          </button>
        )
      })}
    </div>
  )
}

OptionButton.propTypes = {
  active: PropTypes.string.isRequired, // TODO: should be oneOf(options)
  options: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
    })
  ),
  onChange: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['button', 'reset', 'submit']),
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'gray']),
}

export default OptionButton
