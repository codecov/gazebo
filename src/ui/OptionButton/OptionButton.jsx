import cs from 'classnames'
import PropTypes from 'prop-types'

function OptionButton({ active, options, onChange }) {
  return (
    <div className="flex flex-wrap divide-x rounded border">
      {options.map((o, index) => {
        return (
          <button
            className={cs(
              'flex-1 py-1 px-2 text-sm cursor-pointer whitespace-nowrap',
              {
                'bg-ds-blue-darker text-white font-semibold': active === o.text,
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
  active: PropTypes.string.isRequired, // Why is this text? Shouldn't it be boolean?
  options: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
    })
  ),
  onChange: PropTypes.func.isRequired,
}

export default OptionButton
