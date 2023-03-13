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
import Spinner from 'ui/Spinner'

const SelectClasses = {
  root: 'relative',
  item: 'block cursor-pointer py-2 px-4 text-sm font-normal',
  button: `flex w-full items-center justify-between whitespace-nowrap rounded text-left focus:outline-1 disabled:bg-ds-gray-primary disabled:text-ds-gray-quaternary`,
  ul: 'absolute z-20 max-h-80 min-w-fit rounded-bl rounded-br border-ds-gray-tertiary bg-white',
  loadMoreTrigger: 'invisible relative top-[-65px] block leading-[0]',
  searchInput:
    'bg-white border-l border-r border-t rounded border-ds-gray-tertiary pt-2 pb-4 px-4',
}

const UlVariantClass = {
  default: 'inset-x-0 border-gray-ds-tertiary',
  gray: 'inset-x-0 border-gray-ds-tertiary',
  text: 'left-0 whitespace-nowrap rounded border-t',
}

const ButtonVariantClass = {
  default: `h-8 rounded-md border border-ds-gray-tertiary bg-white px-3 hover:bg-ds-gray-secondary active:bg-ds-gray-secondary disabled:border-ds-gray-tertiary disabled:bg-ds-gray-primary disabled:text-ds-gray-quaternary`,
  gray: `h-8 rounded-md border border-ds-gray-tertiary bg-ds-gray-primary px-3 hover:bg-ds-gray-secondary active:bg-ds-gray-secondary disabled:border-ds-gray-tertiary disabled:bg-ds-gray-primary disabled:text-ds-gray-quaternary`,
  text: `flex text-ds-blue`,
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
      items,
      onChange,
      value,
      /* renderItem props:
       *  isHover: boolean
       *  isSelected: boolean
       *  selectedItem: value | item
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
      isLoading,
      searchValue = '',
      label,
    },
    ref
  ) => {
    const inputRef = useRef(null)
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
      onSelectedItemChange: ({ selectedItem }) => onChange(selectedItem),
      selectedItem: value,
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
            'font-semibold': isSelected,
          })}
          key={`${item}${index}`}
          {...getItemProps({ item, index })}
        >
          {renderItem(item, { isHover, isSelected, selectedItem })}
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
            className={cs(SelectClasses.button, ButtonVariantClass[variant], {
              'bg-ds-gray-secondary':
                isOpen && (variant === 'gray' || variant === 'default'),
            })}
            {...getToggleButtonProps({
              onClick: () => {
                if (!isOpen && onSearch) {
                  inputRef.current.focus()
                }
              },
            })}
          >
            {renderButton()}
            <Icon
              variant="solid"
              name={isOpen ? 'chevron-up' : 'chevron-down'}
            />
          </button>
          <div className={cs(!onSearch && 'hidden', 'absolute inset-x-0 z-10')}>
            <div className={cs({ hidden: !isOpen }, SelectClasses.searchInput)}>
              <SearchField
                dataMarketing="select-search"
                placeholder={getSearchPlaceholder(resourceName)}
                searchValue={searchValue}
                setSearchValue={(search) => !!onSearch && onSearch(search)}
                label={label}
                {...getInputProps({ ref: inputRef })}
              />
            </div>
          </div>
          <ul
            aria-label={ariaName}
            className={cs(
              SelectClasses.ul,
              UlVariantClass[variant],
              {
                'border-l border-r border-b overflow-auto': isOpen,
              },
              variant !== 'text' &&
                (!!onSearch
                  ? !!label
                    ? 'top-24 mt-1'
                    : 'top-20'
                  : 'top-8 rounded border-t')
            )}
            {...getMenuProps()}
          >
            {isOpen && (
              <>
                {items.map(_renderItem)}
                {items.length === 0 && onSearch && !isLoading && (
                  <p className="py-1 px-3 text-sm font-semibold">
                    No results found
                  </p>
                )}
                {isLoading && (
                  <span className="flex justify-center py-2 px-3">
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
  isLoading: PropTypes.bool,
  searchValue: PropTypes.string,
  label: PropTypes.string,
}

export default Select
