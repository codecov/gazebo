import cs from 'classnames'
import PropTypes from 'prop-types'

function OptionButton({ active, options, onChange }) {
  return (
    <div className="rounded border max-w-max">
      {options.map((o, index) => {
        return (
          <button
            className={cs('py-1 px-2 text-sm cursor-pointer', {
              'bg-ds-blue-darker text-white font-semibold': active === o.text,
              'rounded-l': index === 0,
              'rounded-r': index === options.length - 1,
            })}
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
  active: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
    })
  ),
  onChange: PropTypes.func.isRequired,
}

export default OptionButton
