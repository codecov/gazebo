import cs from 'classnames'
import { useSelect } from 'downshift'
import identity from 'lodash/identity'
import pluralize from 'pluralize'
import PropTypes from 'prop-types'

import Icon from 'ui/Icon'

const SelectClasses = {
  root: 'w-full relative',
  item: 'block cursor-pointer py-1 px-3 text-sm',
  button:
    'flex justify-between items-center w-full border border-ds-gray-tertiary rounded-md bg-white text-left px-3 py-1 outline-none',
  ul: 'overflow-hidden rounded-md bg-white border-ds-gray-tertiary outline-none absolute w-full z-10 max-h-72 overflow-y-scroll',
}

const variantClasses = {
  default: ``,
  buttonPadding: `py-1`,
}

const SELECT_ALL_OPTION = '__all__'

function MultiSelect({
  resourceName,
  items,
  onChange,
  selectedItems,
  renderItem = identity,
  renderSelected,
  ariaName,
  variant = 'default',
}) {
  const itemsWithReset = [SELECT_ALL_OPTION, ...items]
  const {
    isOpen,
    highlightedIndex,
    getToggleButtonProps,
    getMenuProps,
    getItemProps,
  } = useSelect({
    items: itemsWithReset,
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem === SELECT_ALL_OPTION) {
        // if the selected option is the select all; we clear the selection
        onChange([])
        return
      }

      // either add or remove the option
      const newSet = selectedItems.includes(selectedItem)
        ? selectedItems.filter((item) => item !== selectedItem)
        : [...selectedItems, selectedItem]

      onChange(newSet)
    },
    selectedItem: null,
  })

  function renderButton() {
    return selectedItems.length === 0
      ? `All ${pluralize(resourceName)}`
      : `${pluralize(resourceName, selectedItems.length, true)} selected`
  }

  function _renderItem(item, index) {
    const isHover = highlightedIndex === index

    // if the item is the SELECT_ALL; we consider it selected if no options are selected
    const isSelected =
      item === SELECT_ALL_OPTION
        ? selectedItems.length === 0
        : selectedItems.includes(item)

    return (
      <li
        className={cs(SelectClasses.item, {
          'bg-ds-gray-secondary': isHover,
          'border-l-2 border-ds-gray-octonary font-bold': isSelected,
        })}
        key={`${item}${index}`}
        {...getItemProps({ item, index })}
      >
        {item === SELECT_ALL_OPTION
          ? `All ${pluralize(resourceName)}`
          : renderItem(item, { isHover, isSelected })}
      </li>
    )
  }

  return (
    <div className={SelectClasses.root}>
      <button
        aria-label={ariaName}
        type="button"
        className={cs(SelectClasses.button, variantClasses[variant])}
        {...getToggleButtonProps()}
      >
        {renderButton()}
        <Icon variant="solid" name={isOpen ? 'chevron-up' : 'chevron-down'} />
      </button>
      <ul
        aria-label={ariaName}
        className={cs(SelectClasses.ul, {
          border: isOpen,
          'border-gray-ds-tertiary': isOpen,
        })}
        {...getMenuProps()}
      >
        {isOpen && itemsWithReset.map(_renderItem)}
      </ul>
    </div>
  )
}

MultiSelect.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  onChange: PropTypes.func.isRequired,
  selectedItems: PropTypes.arrayOf(PropTypes.any).isRequired,
  renderItem: PropTypes.func,
  renderSelected: PropTypes.func,
  ariaName: PropTypes.string.isRequired,
  resourceName: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['default', 'buttonPadding']),
}

export default MultiSelect
