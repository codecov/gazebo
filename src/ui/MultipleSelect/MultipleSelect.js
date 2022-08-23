import cs from 'classnames'
import { useMultipleSelection, useSelect } from 'downshift'
import identity from 'lodash/identity'
import pluralize from 'pluralize'
import PropTypes from 'prop-types'
import { useEffect, useRef } from 'react'
import useIntersection from 'react-use/lib/useIntersection'

import Icon from '../Icon'
import SearchField from '../SearchField'

const SelectClasses = {
  button:
    'flex justify-between items-center w-full border border-ds-gray-tertiary rounded-md bg-white text-left px-3 h-8 disabled:text-ds-gray-quaternary disabled:bg-ds-gray-primary disabled:border-ds-gray-tertiary focus:outline-1',
  listContainer:
    'overflow-scroll rounded-md bg-white border-ds-gray-tertiary absolute w-full z-10 max-h-80',
  listItem: 'block cursor-pointer py-1 px-3 text-sm',
  resetButton:
    'block cursor-pointer py-2 px-4 text-sm border-b border-ds-gray-tertiary',
  loadMoreTrigger: 'relative top-[-65px] invisible block leading-[0]',
}

const VariantClasses = {
  default: ``,
  gray: `bg-ds-gray-primary`,
}

const isItemSelected = (item, selectedItems) =>
  selectedItems.some((selectedItem) => selectedItem === item)

const getDefaultButtonPlaceholder = (items, resourceName) =>
  `${pluralize(resourceName, items.length, true)} selected`

const LoadMoreTrigger = ({ intersectionRef, onLoadMore }) =>
  onLoadMore ? (
    <span ref={intersectionRef} className={SelectClasses.loadMoreTrigger}>
      Loading more items...
    </span>
  ) : null

function MultipleSelect({
  items,
  onSearch,
  onLoadMore,
  renderItem = identity,
  renderSelected,
  ariaName,
  disabled,
  onChange,
  value,
  variant,
  resourceName,
  placeholder = `Select ${pluralize(resourceName)}`,
}) {
  const {
    getDropdownProps,
    addSelectedItem,
    removeSelectedItem,
    selectedItems,
    reset,
  } = useMultipleSelection({
    initialSelectedItems: value ?? [],
    onSelectedItemsChange: ({ selectedItems }) => onChange(selectedItems),
  })

  const filteredItems = items.filter(
    (item) => !isItemSelected(item, selectedItems)
  )

  const listItems = [...selectedItems, ...filteredItems]

  const {
    isOpen,
    getToggleButtonProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
  } = useSelect({
    selectedItem: null,
    items: listItems,
    stateReducer: (state, actionAndChanges) => {
      const { changes, type } = actionAndChanges
      switch (type) {
        case useSelect.stateChangeTypes.MenuKeyDownEnter:
        case useSelect.stateChangeTypes.MenuKeyDownSpaceButton:
        case useSelect.stateChangeTypes.ItemClick:
          return {
            ...changes,
            isOpen: true, // keep the menu open after selection.
          }
        default:
          break
      }
      return changes
    },
    onStateChange: ({ type, selectedItem }) => {
      switch (type) {
        case useSelect.stateChangeTypes.MenuKeyDownEnter:
        case useSelect.stateChangeTypes.MenuKeyDownSpaceButton:
        case useSelect.stateChangeTypes.ItemClick:
          isItemSelected(selectedItem, selectedItems)
            ? removeSelectedItem(selectedItem)
            : addSelectedItem(selectedItem)
          break
        default:
          break
      }
    },
  })

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

  function renderSelectedItems() {
    const _renderFunction = renderSelected || getDefaultButtonPlaceholder
    return selectedItems.length === 0 && !renderSelected
      ? placeholder
      : _renderFunction(selectedItems, resourceName)
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
                placeholder={`Search for ${pluralize(resourceName)}`}
                searchValue={''}
                setSearchValue={(search) => onSearch(search)}
              />
            )}

            <li
              onClick={reset}
              className={cs(SelectClasses.resetButton, {
                'px-2 font-bold border-l-4 border-l-black':
                  selectedItems.length === 0,
              })}
            >
              All {pluralize(resourceName)}
            </li>

            {listItems.map((item, index) => (
              <li
                className={cs(SelectClasses.listItem, {
                  'px-2 font-bold border-l-4 border-black': isItemSelected(
                    item,
                    selectedItems
                  ),
                  'bg-ds-gray-secondary': highlightedIndex === index,
                })}
                key={`${item}${index}`}
                {...getItemProps({ item, index })}
              >
                {renderItem(item)}
              </li>
            ))}
            <LoadMoreTrigger
              intersectionRef={intersectionRef}
              onLoadMore={onLoadMore}
            />
          </>
        )}
      </ul>
    </div>
  )
}

MultipleSelect.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  onChange: PropTypes.func.isRequired,
  resourceName: PropTypes.string.isRequired,
  onSearch: PropTypes.func,
  onLoadMore: PropTypes.func,
  value: PropTypes.any,
  renderItem: PropTypes.func,
  renderSelected: PropTypes.func,
  ariaName: PropTypes.string,
  allButtonLabel: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'gray']),
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
}

LoadMoreTrigger.propTypes = {
  onLoadMore: PropTypes.func,
  intersectionRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
}

export default MultipleSelect
