import cs from 'classnames'
import { useCombobox, useMultipleSelection } from 'downshift'
import identity from 'lodash/identity'
import isEqual from 'lodash/isEqual'
import pluralize from 'pluralize'
import PropTypes from 'prop-types'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { useIntersection } from 'react-use'

import { dataMarketingType } from 'shared/propTypes'

import Icon from '../Icon'
import SearchField from '../SearchField'
import Spinner from '../Spinner'

const SelectClasses = {
  button:
    'flex justify-between items-center w-full border border-ds-gray-tertiary rounded bg-ds-container text-left px-3 h-8 disabled:text-ds-gray-quaternary disabled:bg-ds-gray-primary disabled:border-ds-gray-tertiary focus:outline-1 whitespace-nowrap',
  listContainer:
    'overflow-hidden rounded-bl rounded-br bg-ds-container border-ds-gray-tertiary absolute w-full z-40 max-h-80 min-w-fit',
  listItem: 'block cursor-pointer py-1 px-3 text-sm',
  loadMoreTrigger: 'relative top-[-65px] invisible block leading-[0]',
}

const VariantClasses = {
  default: ``,
  gray: `bg-ds-gray-primary`,
}

const SELECT_ALL_BUTTON = 'SELECT_ALL'

function isAllButton(item) {
  return item === SELECT_ALL_BUTTON
}

function getDefaultButtonPlaceholder(items, resourceName) {
  if (items.length === 0) {
    return `All ${pluralize(resourceName, items.length)}`
  }
  return `${pluralize(resourceName, items.length, true)} selected`
}

function getSearchPlaceholder(resourceName) {
  if (resourceName) {
    return `Search for ${pluralize(resourceName)}`
  }
  return 'Search'
}

function isItemSelected(item, selectedItems) {
  return selectedItems.some((selectedItem) => isEqual(selectedItem, item))
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

function DropdownList({
  ariaName,
  isOpen,
  onSearch,
  getMenuProps,
  listItems,
  selectedItems,
  highlightedIndex,
  getItemProps,
  resourceName,
  renderItem,
  isLoading,
  intersectionRef,
  onLoadMore,
}) {
  return (
    <ul
      aria-label={ariaName}
      className={cs(
        SelectClasses.listContainer,
        {
          'border border-gray-ds-tertiary max-h-72 overflow-y-auto': isOpen,
        },
        onSearch ? 'top-16' : 'top-8'
      )}
      {...getMenuProps()}
    >
      {isOpen && (
        <>
          {listItems.map((item, index) => (
            <li
              className={cs(SelectClasses.listItem, {
                'px-2 font-bold border-l-4 border-l-ds-secondary-text':
                  isItemSelected(item, selectedItems) ||
                  (isAllButton(item) && selectedItems.length === 0),
                'bg-ds-gray-secondary': highlightedIndex === index,
                'py-2 border-b border-ds-gray-tertiary': isAllButton(item),
              })}
              key={`${item}_${index}`}
              {...getItemProps({ item, index })}
            >
              {isAllButton(item)
                ? selectedItems.length === 0
                  ? `All ${pluralize(resourceName)}`
                  : 'Clear selected'
                : renderItem(item)}
            </li>
          ))}
          {listItems.length <= 1 && onSearch && !isLoading && (
            <p className="px-3 py-1 text-sm font-semibold">No results found</p>
          )}
          {isLoading && (
            <span className="flex px-3 py-2">
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
  )
}

DropdownList.propTypes = {
  ariaName: PropTypes.string,
  isOpen: PropTypes.bool,
  onSearch: PropTypes.func,
  getMenuProps: PropTypes.func,
  listItems: PropTypes.array,
  selectedItems: PropTypes.array,
  highlightedIndex: PropTypes.number,
  getItemProps: PropTypes.func,
  resourceName: PropTypes.string,
  renderItem: PropTypes.func,
  isLoading: PropTypes.bool,
  intersectionRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  onLoadMore: PropTypes.func,
}

const MultiSelect = forwardRef(
  (
    {
      dataMarketing,
      ariaName,
      disabled,
      isLoading,
      items = [],
      onChange,
      onLoadMore,
      onSearch,
      renderItem = identity,
      renderSelected,
      resourceName = '',
      value = [],
      variant,
      selectedItemsOverride,
    },
    ref
  ) => {
    const intersectionRef = useRef(null)

    const {
      getDropdownProps,
      addSelectedItem,
      removeSelectedItem,
      selectedItems,
      reset,
    } = useMultipleSelection({
      initialSelectedItems: value,
      selectedItems: selectedItemsOverride,
      onSelectedItemsChange: ({ selectedItems }) => onChange(selectedItems),
    })

    useImperativeHandle(ref, () => ({
      resetSelected: () => {
        reset()
      },
    }))

    const toggleItem = (selectedItem) => {
      isItemSelected(selectedItem, selectedItems)
        ? removeSelectedItem(selectedItem)
        : addSelectedItem(selectedItem)
    }

    const listItems = [
      SELECT_ALL_BUTTON,
      ...selectedItems,
      ...(items?.filter((item) => !isItemSelected(item, selectedItems)) ?? []),
    ]

    const {
      getToggleButtonProps,
      getInputProps,
      getItemProps,
      getMenuProps,
      isOpen,
      highlightedIndex,
    } = useCombobox({
      selectedItem: null,
      items: listItems,
      stateReducer: (_state, { changes, type }) => {
        switch (type) {
          case useCombobox.stateChangeTypes.InputKeyDownArrowDown:
          case useCombobox.stateChangeTypes.InputKeyDownArrowUp:
          case useCombobox.stateChangeTypes.InputKeyDownEnter:
          case useCombobox.stateChangeTypes.ItemClick:
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
          case useCombobox.stateChangeTypes.InputKeyDownEnter:
          case useCombobox.stateChangeTypes.ItemClick:
            isAllButton(selectedItem) ? reset() : toggleItem(selectedItem)
            break
          default:
            break
        }
      },
    })

    const intersection = useIntersection(intersectionRef, {
      root: null,
      rootMargin: '0px',
      threshold: 0,
    })

    useEffect(() => {
      let unMounted = false
      if (intersection?.isIntersecting && onLoadMore) {
        if (unMounted) return
        onLoadMore()
      }

      return () => {
        unMounted = true
      }
    }, [intersection?.isIntersecting, onLoadMore])

    function renderSelectedItems() {
      return renderSelected
        ? renderSelected(selectedItems)
        : getDefaultButtonPlaceholder(selectedItems, resourceName)
    }

    return (
      <div className="relative">
        <div>
          <button
            data-marketing={dataMarketing}
            aria-label={ariaName}
            className={cs(SelectClasses.button, VariantClasses[variant])}
            disabled={disabled}
            {...getDropdownProps()}
            {...getToggleButtonProps(
              getDropdownProps({ preventKeyAction: isOpen })
            )}
          >
            {renderSelectedItems()}
            <Icon
              name={isOpen ? 'chevron-up' : 'chevron-down'}
              variant="solid"
            />
          </button>
          <div
            className={cs(!onSearch && 'hidden', 'absolute', 'inset-x-0 z-50')}
          >
            <div className={cs(!isOpen && 'hidden')}>
              <SearchField
                dataMarketing="multiselect-search"
                variant="topRounded"
                placeholder={getSearchPlaceholder(resourceName)}
                searchValue=""
                setSearchValue={(search) => onSearch && onSearch(search)}
                {...getInputProps()}
              />
            </div>
          </div>
        </div>
        <DropdownList
          ariaName={ariaName}
          isOpen={isOpen}
          onSearch={onSearch}
          getMenuProps={getMenuProps}
          listItems={listItems}
          selectedItems={selectedItems}
          highlightedIndex={highlightedIndex}
          getItemProps={getItemProps}
          resourceName={resourceName}
          renderItem={renderItem}
          isLoading={isLoading}
          intersectionRef={intersectionRef}
          onLoadMore={onLoadMore}
        />
      </div>
    )
  }
)

MultiSelect.displayName = 'MultiSelect'

MultiSelect.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any),
  onChange: PropTypes.func.isRequired,
  resourceName: PropTypes.string,
  onSearch: PropTypes.func,
  onLoadMore: PropTypes.func,
  value: PropTypes.any,
  renderItem: PropTypes.func,
  renderSelected: PropTypes.func,
  ariaName: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['default', 'gray']),
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  dataMarketing: dataMarketingType,
  selectedItemsOverride: PropTypes.array,
}

export default MultiSelect
