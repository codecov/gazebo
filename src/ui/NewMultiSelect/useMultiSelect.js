import { useCombobox, useMultipleSelection } from 'downshift'
import isEqual from 'lodash/isEqual'
import useIntersection from 'react-use/lib/useIntersection'

const SELECT_ALL_BUTTON = 'SELECT_ALL'

const isAllButton = (item) => item === SELECT_ALL_BUTTON

const isItemSelected = (item, selectedItems) =>
  selectedItems.some((selectedItem) => isEqual(selectedItem, item))

export function useMultiSelect({ value, onChange, items, intersectionRef }) {
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

  const toggleItem = (selectedItem) => {
    isItemSelected(selectedItem, selectedItems)
      ? removeSelectedItem(selectedItem)
      : addSelectedItem(selectedItem)
  }

  const filteredItems = items?.filter(
    (item) => !isItemSelected(item, selectedItems)
  )

  const listItems = [SELECT_ALL_BUTTON, ...selectedItems, ...filteredItems]

  const {
    isOpen,
    getToggleButtonProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
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

  return {
    getDropdownProps,
    isOpen,
    getToggleButtonProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
    selectedItems,
    reset,
    listItems,
    isIntersecting: intersection?.isIntersecting,
    isAllButton,
    isItemSelected,
    getInputProps,
    getComboboxProps,
  }
}
