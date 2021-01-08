import PropTypes from 'prop-types'

import Select from 'ui/Select'
import { Controller } from 'react-hook-form'

export const FormSelect = ({ control, handleOnChange, name, items }) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={items[0]}
      render={({ onChange, value }) => (
        // Replace with a new ui component in another PR
        <Select
          ariaName={name}
          className="relative flex-1 md:flex-none w-full md:w-auto"
          items={items}
          renderItem={({ label }) => (
            <div className="flex justify-between flex-1 p-2 text-base w-full">
              {label}
            </div>
          )}
          onChange={(select) => {
            onChange(select)
            handleOnChange(select, name)
          }}
          value={value}
        />
      )}
    />
  )
}

FormSelect.propTypes = {
  control: PropTypes.object.isRequired,
  handleOnChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
}
