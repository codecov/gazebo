import cs from 'classnames'
import PropTypes from 'prop-types'

function OptionButton({ active, options, onChange }) {
  return (
    <div className="rounded border inline-flex">
      {options.map((o, index) => (
        <option
          className={cs('py-1 px-2 text-sm', {
            'bg-ds-blue-darker text-white font-semibold':
              active?.text === o.text,
            'rounded-l': index === 0,
            'rounded-r': index === options.length - 1,
            'cursor-pointer': active?.text !== o.text,
          })}
          onClick={() => onChange(o)}
          key={index}
        >
          {o.text}
        </option>
      ))}
    </div>
  )
}

OptionButton.propTypes = {
  active: PropTypes.shape({
    text: PropTypes.string,
  }),
  options: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
    })
  ),
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
}

export default OptionButton
