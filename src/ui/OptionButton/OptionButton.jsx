import cs from 'classnames'
import PropTypes from 'prop-types'

function OptionButton({ active, options, onChange, type, disabled }) {
  return (
    <div className="flex flex-wrap divide-x rounded border">
      {options.map((o, index) => {
        return (
          <button
            type={type}
            disabled={disabled}
            className={cs(
              'flex-1 py-1 px-2 text-sm cursor-pointer whitespace-nowrap disabled:text-ds-gray-quaternary disabled:border-ds-gray-tertiary disabled:bg-ds-gray-primary',
              {
                'bg-ds-primary-base text-white font-semibold':
                  active === o.text && !disabled,
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
}

export default OptionButton
