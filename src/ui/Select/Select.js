import PropTypes from 'prop-types'
import { useSelect } from 'downshift'
import identity from 'lodash/identity'

import Icon from 'ui/Icon'

const SelectClasses = {
  root: 'w-full relative',
  button:
    'flex justify-between items-center w-full border border-gray-300 rounded-md bg-white text-left px-4 py-2 outline-none',
  ul: (isOpen) =>
    `overflow-hidden rounded-md bg-white border-gray-200 outline-none absolute w-full z-10${
      isOpen && ' border border-solid'
    }`,
  li: 'block hover:bg-gray-200 cursor-pointer p-2 text-sm',
}

function Select({
  placeholder = 'Select',
  items,
  onChange,
  value,
  renderItem = identity,
  ariaName,
}) {
  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getMenuProps,
    getItemProps,
  } = useSelect({
    items,
    onSelectedItemChange: ({ selectedItem }) => onChange(selectedItem),
    selectedItem: value ?? null,
  })

  function renderButton() {
    return renderItem(selectedItem) || placeholder
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
    <div className={SelectClasses.root}>
      <button
        aria-label={ariaName}
        type="button"
        className={SelectClasses.button}
        {...getToggleButtonProps()}
      >
        {renderButton()}
        <Icon name={isOpen ? 'angleUp' : 'angleDown'} />
      </button>
      <ul
        aria-label={ariaName}
        className={SelectClasses.ul(isOpen)}
        {...getMenuProps()}
      >
        {isOpen && items.map(_renderItem)}
      </ul>
    </div>
  )
}

Select.propTypes = {
  placeholder: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  renderItem: PropTypes.func,
  ariaName: PropTypes.string,
}

export default Select
