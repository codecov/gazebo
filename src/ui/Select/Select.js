import PropTypes from 'prop-types'
import { useSelect } from 'downshift'
import identity from 'lodash/identity'
import cs from 'classnames'

import Icon from 'ui/Icon'

function Select({
  placeholder = 'Select',
  items,
  onChange,
  value,
  renderItem = identity,
  buttonClass,
  ulClass,
  className,
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
        className="block hover:bg-gray-200 cursor-pointer p-2 text-sm"
        key={`${item}${index}`}
        {...getItemProps({ item, index })}
      >
        {renderItem(item)}
      </li>
    )
  }

  return (
    <div className={cs({ 'w-full relative': !className }, className)}>
      <button
        aria-label={ariaName}
        type="button"
        className={cs(
          {
            'flex justify-between items-center w-full border border-gray-300 rounded-md bg-white text-left px-4 py-2 outline-none': !buttonClass,
          },
          buttonClass
        )}
        {...getToggleButtonProps()}
      >
        {renderButton()}
        <Icon name={isOpen ? 'angleUp' : 'angleDown'} />
      </button>
      <ul
        aria-label={ariaName}
        className={cs(
          {
            'overflow-hidden rounded-md bg-white border-gray-200 outline-none absolute w-full': !ulClass,
            border: isOpen,
            'border-solid': isOpen,
          },
          ulClass
        )}
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
  buttonClass: PropTypes.string,
  ulClass: PropTypes.string,
  ariaName: PropTypes.string,
}

export default Select
