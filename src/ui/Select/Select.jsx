import cs from 'classnames'
import { useSelect } from 'downshift'
import identity from 'lodash/identity'
import PropTypes from 'prop-types'

import Icon from 'ui/Icon'

const SelectClasses = {
  root: 'relative',
  item: 'block cursor-pointer py-1 px-3 text-sm font-normal',
  button: 'flex justify-between items-center text-left outline-none',
  ul: 'overflow-hidden rounded-md bg-white border-ds-gray-tertiary outline-none absolute z-10 max-h-72',
}

const UlVariantClass = {
  default: 'w-full border-gray-ds-tertiary',
  gray: 'w-full border-gray-ds-tertiary',
  text: 'left-0 z-10 whitespace-nowrap',
}

const ButtonVariantClass = {
  default: `w-full px-3 border border-ds-gray-tertiary rounded-md bg-white disabled:text-ds-gray-quaternary disabled:bg-ds-gray-primary disabled:border-ds-gray-tertiary`,
  gray: `w-full px-3 border border-ds-gray-tertiary rounded-md bg-white disabled:text-ds-gray-quaternary disabled:bg-ds-gray-primary disabled:border-ds-gray-tertiary bg-ds-gray-primary`,
  text: `flex-init text-ds-blue`,
}

function Select({
  placeholder = 'Select',
  items,
  onChange,
  value,
  /* renderItem props:
   *  isHover: boolean
   *  isSelected: boolean
   */
  renderItem = identity,
  /* renderSelected props:
   *  placeholder: string / any
   */
  renderSelected,
  ariaName,
  variant = 'default',
  disabled = false,
}) {
  const {
    isOpen,
    selectedItem,
    highlightedIndex,
    getToggleButtonProps,
    getMenuProps,
    getItemProps,
  } = useSelect({
    items,
    onSelectedItemChange: ({ selectedItem }) => onChange(selectedItem),
    selectedItem: value ?? null,
  })

  function renderButton() {
    const _render = renderSelected || renderItem
    return (
      _render(selectedItem, {
        placeholder,
      }) || placeholder
    )
  }

  function _renderItem(item, index) {
    const isHover = highlightedIndex === index
    const isSelected = selectedItem === item
    return (
      <li
        className={cs(SelectClasses.item, {
          'bg-ds-gray-secondary': isHover,
        })}
        key={`${item}${index}`}
        {...getItemProps({ item, index })}
      >
        {renderItem(item, { isHover, isSelected })}
      </li>
    )
  }

  return (
    <div className={SelectClasses.root}>
      <button
        disabled={disabled}
        aria-label={ariaName}
        type="button"
        className={cs(SelectClasses.button, ButtonVariantClass[variant])}
        {...getToggleButtonProps()}
      >
        {renderButton()}
        <Icon variant="solid" name={isOpen ? 'chevron-up' : 'chevron-down'} />
      </button>
      <ul
        aria-label={ariaName}
        className={cs(SelectClasses.ul, UlVariantClass[variant], {
          'border overflow-scroll': isOpen,
        })}
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
  renderSelected: PropTypes.func,
  ariaName: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['default', 'gray', 'text']),
  disabled: PropTypes.bool,
}

export default Select
