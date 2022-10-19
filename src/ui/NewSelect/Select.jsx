import cs from 'classnames'
import { useCombobox } from 'downshift'
import identity from 'lodash/identity'
import pluralize from 'pluralize'
import PropTypes from 'prop-types'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { useIntersection } from 'react-use'

import { dataMarketingType } from 'shared/propTypes'
import Icon from 'ui/Icon'
import SearchField from 'ui/SearchField'

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

function getSearchPlaceholder(resourceName) {
  if (resourceName) {
    return `Search for ${pluralize(resourceName)}`
  }
  return 'Search'
}

function LoadMoreTrigger({ intersectionRef, onLoadMore }) {
  return (
    <>
      {onLoadMore ? (
        <span ref={intersectionRef} className={SelectClasses.loadMoreTrigger}>
          Loading more items...
        </span>
      ) : null}
    </>
  )
}

LoadMoreTrigger.propTypes = {
  onLoadMore: PropTypes.func,
  intersectionRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
}

const Select = forwardRef(
  // eslint-disable-next-line complexity
  (
    {
      placeholder = 'Select',
      items = [],
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
      dataMarketing,
      onSearch,
      resourceName = '',
      onLoadMore,
    },
    ref
  ) => {
    const intersectionRef = useRef(null)

    const intersection = useIntersection(intersectionRef, {
      root: null,
      rootMargin: '0px',
      threshold: 0,
    })

    useEffect(() => {
      if (intersection?.isIntersecting && onLoadMore) {
        onLoadMore()
      }
    }, [intersection?.isIntersecting, onLoadMore])

    useImperativeHandle(ref, () => ({
      resetSelected: () => reset(),
    }))

    const {
      isOpen,
      getToggleButtonProps,
      getMenuProps,
      getInputProps,
      getComboboxProps,
      highlightedIndex,
      getItemProps,
      reset,
      selectedItem,
    } = useCombobox({
      items,
      initialSelectedItem: value,
      onSelectedItemsChange: ({ selectedItems }) => {
        onChange(selectedItems)
      },
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
        <div {...getComboboxProps()}>
          <button
            data-marketing={dataMarketing}
            disabled={disabled}
            aria-label={ariaName}
            type="button"
            className={cs(SelectClasses.button, ButtonVariantClass[variant])}
            {...getToggleButtonProps()}
          >
            {renderButton()}
            <Icon
              variant="solid"
              name={isOpen ? 'chevron-up' : 'chevron-down'}
            />
          </button>
          <div
            className={cs(!onSearch && 'invisible', 'absolute', 'inset-x-0')}
          >
            <div className={cs(!isOpen && 'invisible')}>
              <SearchField
                dataMarketing="select-search"
                variant="topRounded"
                placeholder={getSearchPlaceholder(resourceName)}
                searchValue=""
                setSearchValue={(search) => onSearch && onSearch(search)}
                {...getInputProps()}
              />
            </div>
          </div>
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
      </div>
    )
  }
)

Select.displayName = 'Select'

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
  dataMarketing: dataMarketingType,
  onSearch: PropTypes.func,
  resourceName: PropTypes.string,
  onLoadMore: PropTypes.func,
}

export default Select
