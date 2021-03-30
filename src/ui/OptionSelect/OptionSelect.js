/* eslint-disable react/prop-types */

function OptionSelect({ label, onChange, value, variant, disabled }) {
  return (
    <div className="flex items-center">
      <input
        onClick={onChange(!value)}
        className="mr-2"
        type="radio"
        checked={value}
        disabled={disabled}
      />
      {variant === 'label' && <>{label}</>}
    </div>
  )
}

export default OptionSelect
