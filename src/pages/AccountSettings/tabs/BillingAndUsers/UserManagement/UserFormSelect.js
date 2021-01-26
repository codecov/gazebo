import PropTypes from 'prop-types'
import { Controller } from 'react-hook-form'
import { useSelect } from 'downshift'
import cs from 'classnames'

import Icon from 'ui/Icon'

const SelectClasses = {
  root: 'truncate flex bg-white',
  button: 'truncate flex items-center outline-none text-left p-2',
  ul: `
      overflow-hidden outline-none absolute z-10
      rounded-b-md bg-white border-gray-200
  `,
  li: 'cursor-pointer text-sm hover:bg-gray-200',
  item: 'flex-1 flex justify-between text-base p-4 truncate',
  itemContent: 'flex justify-between flex-1 text-base truncate',
}

export const FormSelect = ({
  control,
  handleOnChange,
  name,
  items,
  selected,
  placeholder = 'Select',
  className,
}) => {
  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getMenuProps,
    getItemProps,
  } = useSelect({
    items,
    onSelectedItemChange: ({ selectedItem }) =>
      handleOnChange(selectedItem, name),
    selectedItem: selected ?? items[0],
  })

  function renderItem({ label }) {
    return (
      <div className={SelectClasses.item}>
        <span className={SelectClasses.itemContent}>{label}</span>
      </div>
    )
  }

  function renderButton() {
    return (
      <span className={SelectClasses.itemContent}>{selectedItem.label}</span>
    )
  }

  function _renderItem(item, index) {
    return (
      <li
        className={SelectClasses.li}
        key={`${item}${index}`}
        {...getItemProps({ item, index })}
      >
        {renderItem(item)}
      </li>
    )
  }

  return (
    <Controller
      name={name}
      control={control}
      render={() => (
        <div className={cs(SelectClasses.root, className)}>
          <button
            aria-label={name}
            type="button"
            className={SelectClasses.button}
            {...getToggleButtonProps()}
          >
            {renderButton()}
            <Icon name={isOpen ? 'angleUp' : 'angleDown'} />
          </button>
          <ul
            aria-label={name}
            className={cs(SelectClasses.ul, { 'border border-solid': isOpen })}
            {...getMenuProps()}
          >
            {isOpen && items.map(_renderItem)}
          </ul>
        </div>
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
  placeholder: PropTypes.string,
}
