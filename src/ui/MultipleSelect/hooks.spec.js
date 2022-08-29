import { renderHook } from '@testing-library/react-hooks'
import { useMultipleSelection, useSelect } from 'downshift'
import useIntersection from 'react-use/lib/useIntersection'

import { useMultiSelect } from './hooks'

jest.mock('downshift')
jest.mock('react-use/lib/useIntersection')

const items = ['item1', 'item2', 'item3']

describe('useMultiSelect', () => {
  let hookData
  const intersectionRef = { current: null }
  const selectedItem = 'item3'

  const useMultipleSelectionData = {
    getDropdownProps: jest.fn(),
    addSelectedItem: jest.fn(),
    removeSelectedItem: jest.fn(),
    reset: jest.fn(),
  }

  const useSelectData = {
    isOpen: false,
    getToggleButtonProps: jest.fn(),
    getMenuProps: jest.fn(),
    highlightedIndex: -1,
    getItemProps: jest.fn(),
  }

  function setup({ isIntersecting = false, hasSelectedItems = false }) {
    useMultipleSelection.mockReturnValue({
      ...useMultipleSelectionData,
      selectedItems: hasSelectedItems ? [selectedItem] : [],
    })
    useSelect.mockReturnValue(useSelectData)
    useIntersection.mockReturnValue({ isIntersecting })

    hookData = renderHook(() =>
      useMultiSelect({ value: [], onChange: jest.fn(), items, intersectionRef })
    )
  }

  it('returns data accordingly', () => {
    setup({})
    console.log(hookData.result.current)
    expect(hookData.result.current.getDropdownProps).toEqual(
      useMultipleSelectionData.getDropdownProps
    )
    expect(hookData.result.current.getToggleButtonProps).toEqual(
      useSelectData.getToggleButtonProps
    )
    expect(hookData.result.current.getMenuProps).toEqual(
      useSelectData.getMenuProps
    )
    expect(hookData.result.current.getItemProps).toEqual(
      useSelectData.getItemProps
    )
    expect(hookData.result.current.reset).toEqual(
      useMultipleSelectionData.reset
    )
    expect(hookData.result.current.isAllButton).toBeDefined()
    expect(hookData.result.current.isItemSelected).toBeDefined()
    expect(hookData.result.current.isOpen).toEqual(false)
    expect(hookData.result.current.listItems).toEqual([
      'SELECT_ALL',
      'item1',
      'item2',
      'item3',
    ])
    expect(hookData.result.current.selectedItems).toEqual([])
    expect(hookData.result.current.highlightedIndex).toEqual(-1)
    expect(hookData.result.current.isIntersecting).toEqual(false)
  })

  describe('when there isIntersecting is true', () => {
    it('returns data accordingly', () => {
      setup({ isIntersecting: true })
      expect(hookData.result.current.isIntersecting).toEqual(true)
    })
  })

  describe('when there are selected items', () => {
    beforeEach(() => {
      setup({ hasSelectedItems: true })
    })
    it('selectedItems value is returned accordingly', () => {
      expect(hookData.result.current.selectedItems).toEqual([selectedItem])
    })

    it('selected item is returned on the top of the list', () => {
      expect(hookData.result.current.listItems[1]).toEqual(selectedItem)
    })
  })
})
