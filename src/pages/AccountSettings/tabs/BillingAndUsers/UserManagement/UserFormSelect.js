import PropTypes from 'prop-types'

import Select from 'ui/Select'
import { Controller } from 'react-hook-form'

export const FormSelect = ({
  control,
  handleOnChange,
  name,
  items,
  selected,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ onChange }) => (
        // Replace with a new ui component in another PR
        <Select
          ariaName={name}
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
          value={selected || items[0]}
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
  selected: PropTypes.object,
}
