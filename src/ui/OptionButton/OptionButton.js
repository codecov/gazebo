/* eslint-disable react/prop-types */
import { useState } from 'react'
import cs from 'classnames'
function OptionButton({ initialStateIndex, options, onChange }) {
  const [active, setActive] = useState(initialStateIndex || 0)

  function handleClick(option, index) {
    setActive(index)
    onChange(option)
  }

  return (
    <div className="rounded border inline-flex">
      {options.map((o, index) => (
        <div
          className={cs('py-1 px-2 text-sm', {
            'bg-ds-blue-darker': active === index,
            'text-white': active === index,
            'font-semibold': active === index,
            'rounded-l': index === 0,
            'rounded-r': index === options.length - 1,
          })}
          onClick={() => handleClick(o, index)}
          key={index}
        >
          {o.text}
        </div>
      ))}
    </div>
  )
}

export default OptionButton
