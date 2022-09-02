import cs from 'classnames'
import identity from 'lodash/identity'
import pluralize from 'pluralize'
import PropTypes from 'prop-types'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

import { useMultiSelect } from './hooks'

import Icon from '../Icon'
import SearchField from '../SearchField'
import Spinner from '../Spinner'

const SelectClasses = {
  button:
    'flex justify-between items-center w-full border border-ds-gray-tertiary rounded-md bg-white text-left px-3 h-8 disabled:text-ds-gray-quaternary disabled:bg-ds-gray-primary disabled:border-ds-gray-tertiary focus:outline-1',
  listContainer:
    'overflow-scroll rounded-md bg-white border-ds-gray-tertiary absolute w-full z-10 max-h-80 min-w-fit',
  listItem: 'block cursor-pointer py-1 px-3 text-sm',
  loadMoreTrigger: 'relative top-[-65px] invisible block leading-[0]',
}

const VariantClasses = {
  default: ``,
  gray: `bg-ds-gray-primary`,
}

const getDefaultButtonPlaceholder = (items, resourceName) =>
  items.length === 0
    ? `All ${pluralize(resourceName, items.length)}`
    : `${pluralize(resourceName, items.length, true)} selected`

const getSearchPlaceholder = (resourceName) =>
  `Search ${resourceName ? `for ${pluralize(resourceName)}` : ''}`

const LoadMoreTrigger = ({ intersectionRef, onLoadMore }) => (
  <>
    {onLoadMore ? (
      <span ref={intersectionRef} className={SelectClasses.loadMoreTrigger}>
        Loading more items...
      </span>
    ) : null}
  </>
)

const MultipleSelect = forwardRef(function MultipleSelect(
  {
    items,
    value,
    variant,
    ariaName,
    disabled,
    onChange,
    onSearch,
    isLoading,
    onLoadMore,
    renderSelected,
    resourceName = '',
    renderItem = identity,
  },
  ref
) {
  const intersectionRef = useRef(null)

  const {
    reset,
    isOpen,
    listItems,
    getMenuProps,
    getItemProps,
    selectedItems,
    isIntersecting,
    getDropdownProps,
    highlightedIndex,
    getToggleButtonProps,
    isAllButton,
    isItemSelected,
  } = useMultiSelect({ value, onChange, items, intersectionRef })

  useImperativeHandle(ref, () => ({
    resetSelected: () => {
      reset()
    },
  }))

  useEffect(() => {
    if (isIntersecting && onLoadMore) {
      onLoadMore()
    }
  }, [isIntersecting, onLoadMore])

  function renderSelectedItems() {
    return renderSelected
      ? renderSelected(selectedItems)
      : getDefaultButtonPlaceholder(selectedItems, resourceName)
  }

  return (
    <div className="flex-1 relative">
      <div>
        <button
          disabled={disabled}
          className={cs(SelectClasses.button, VariantClasses[variant])}
          aria-label={ariaName}
          {...getDropdownProps()}
          {...getToggleButtonProps(
            getDropdownProps({ preventKeyAction: isOpen })
          )}
        >
          {renderSelectedItems()}
          <Icon variant="solid" name={isOpen ? 'chevron-up' : 'chevron-down'} />
        </button>
      </div>
      <ul
        className={cs(SelectClasses.listContainer, {
          'border border-gray-ds-tertiary max-h-72 overflow-scroll': isOpen,
        })}
        aria-label={ariaName}
        {...getMenuProps()}
      >
        {isOpen && (
          <>
            {onSearch && (
              <SearchField
                placeholder={getSearchPlaceholder(resourceName)}
                searchValue={''}
                setSearchValue={(search) => onSearch(search)}
              />
            )}
            {listItems.map((item, index) => (
              <li
                className={cs(SelectClasses.listItem, {
                  'px-2 font-bold border-l-4 border-l-black':
                    isItemSelected(item, selectedItems) ||
                    (isAllButton(item) && selectedItems.length === 0),
                  'bg-ds-gray-secondary': highlightedIndex === index,
                  'py-2 border-b border-ds-gray-tertiary': isAllButton(item),
                })}
                key={`${item}${index}`}
                {...getItemProps({ item, index })}
              >
                {isAllButton(item)
                  ? `All ${pluralize(resourceName)}`
                  : renderItem(item)}
              </li>
            ))}
            {isLoading && (
              <span className="flex py-2 px-3">
                <Spinner />
              </span>
            )}
            <LoadMoreTrigger
              intersectionRef={intersectionRef}
              onLoadMore={onLoadMore}
            />
          </>
        )}
      </ul>
    </div>
  )
})

MultipleSelect.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  onChange: PropTypes.func.isRequired,
  resourceName: PropTypes.string,
  onSearch: PropTypes.func,
  onLoadMore: PropTypes.func,
  value: PropTypes.any,
  renderItem: PropTypes.func,
  renderSelected: PropTypes.func,
  ariaName: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'gray']),
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
}

LoadMoreTrigger.propTypes = {
  onLoadMore: PropTypes.func,
  intersectionRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
}

export default MultipleSelect
