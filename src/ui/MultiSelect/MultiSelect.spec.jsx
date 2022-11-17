import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import useIntersection from 'react-use/lib/useIntersection'

import MultiSelect from './MultiSelect'

jest.mock('react-use/lib/useIntersection')

describe('MultiSelect', () => {
  let multiSelectRef
  const onChange = jest.fn()

  let props = {}
  const defaultProps = {
    ariaName: 'multi-select test',
    dataMarketing: 'multi-select test',
    items: ['item1', 'item2', 'item3'],
    onChange,
  }

  beforeEach(() => {
    props = { ...defaultProps }
  })

  describe('when rendered', () => {
    it('renders the default placeholder', () => {
      render(<MultiSelect {...props} />)

      const button = screen.getByText(/All/)
      expect(button).toBeInTheDocument()
    })

    it('does not render the dropdown and its items', () => {
      render(<MultiSelect {...props} />)

      const listbox = screen.getByRole('listbox')
      expect(listbox).toBeEmptyDOMElement()
    })

    describe('when no items are passed', () => {
      it('uses default items value', () => {
        render(
          <MultiSelect
            ariaName="multi-select test"
            dataMarketing={'multi-select test'}
            onChange={onChange}
          />
        )

        const listbox = screen.getByRole('listbox')
        expect(listbox).toBeEmptyDOMElement()
      })
    })
  })

  describe('when rendering with a resourceName', () => {
    beforeEach(() => {
      props = {
        ...defaultProps,
        resourceName: 'item',
      }
    })

    it('renders the correct placeholder', () => {
      render(<MultiSelect {...props} />)

      const allItems = screen.getByText('All items')
      expect(allItems).toBeInTheDocument()
    })
  })

  describe('when rendering with a value', () => {
    beforeEach(() => {
      props = {
        ...defaultProps,
        value: ['item1'],
        resourceName: 'item',
      }
    })

    it('renders the default selected items count', () => {
      render(<MultiSelect {...props} />)

      const itemSelected = screen.getByText('1 item selected')
      expect(itemSelected).toBeInTheDocument()
    })
  })

  describe('when select button is triggered', () => {
    describe('when triggered with a click', () => {
      it('renders the items', () => {
        render(<MultiSelect {...props} />)

        const button = screen.getByText('All')
        userEvent.click(button)

        const listbox = screen.getByRole('listbox')
        expect(listbox).not.toBeEmptyDOMElement()

        const item1 = screen.getByText('item1')
        expect(item1).toBeInTheDocument()

        const item2 = screen.getByText('item2')
        expect(item2).toBeInTheDocument()

        const item3 = screen.getByText('item3')
        expect(item3).toBeInTheDocument()
      })
    })

    describe('when triggered enter', () => {
      it('renders the items', () => {
        render(<MultiSelect {...props} />)

        const button = screen.getByText('All')
        userEvent.type(button, '{enter}')

        const listbox = screen.getByRole('listbox')
        expect(listbox).not.toBeEmptyDOMElement()
      })
    })
  })

  describe('when selecting an item from the list', () => {
    describe('when selected with a click', () => {
      it('highlights the selected item', () => {
        render(<MultiSelect {...props} />)

        const button = screen.getByText('All')
        userEvent.click(button)

        const item1Click = screen.getByText('item1')
        userEvent.click(item1Click)

        const item1 = screen.getByText('item1')
        expect(item1).toHaveClass('font-bold')
      })

      it('calls onChange with the item', () => {
        render(<MultiSelect {...props} />)

        const button = screen.getByText('All')
        userEvent.click(button)

        const item1Click = screen.getByText('item1')
        userEvent.click(item1Click)

        expect(onChange).toHaveBeenCalledWith(['item1'])
      })

      it('renders the all button', () => {
        render(<MultiSelect {...props} />)

        const button = screen.getByText('All')
        userEvent.click(button)

        const item1Click = screen.getByText('item1')
        userEvent.click(item1Click)

        const all = screen.getByText('All')
        expect(all).toBeInTheDocument()
      })
    })

    describe('when selected with enter key', () => {
      it('calls onChange with the item', () => {
        render(<MultiSelect {...props} />)

        const button = screen.getByText('All')
        userEvent.click(button)

        const item = screen.getByText(/item1/)
        userEvent.type(item, '{enter}')

        expect(onChange).toHaveBeenCalledWith(['item1'])
      })
    })
  })

  describe('when rendered with complex items and custom item rendered', () => {
    beforeEach(() => {
      const items = [{ name: 'item1' }, { name: 'item2' }, { name: 'item3' }]
      const value = [items[0]]
      const renderItem = ({ name }) => <p>{name}</p>

      props = {
        ...defaultProps,
        items,
        value,
        renderItem,
        resourceName: 'item',
      }
    })

    it('renders the default selected items count', () => {
      render(<MultiSelect {...props} />)

      const itemSelected = screen.getByText('1 item selected')
      expect(itemSelected).toBeInTheDocument()
    })

    describe('when clicking on the button', () => {
      it('renders the option user the custom rendered', () => {
        render(<MultiSelect {...props} />)

        const button = screen.getByText('1 item selected')
        userEvent.click(button)

        const listbox = screen.getByRole('listbox')
        expect(listbox).not.toBeEmptyDOMElement()

        const item1 = screen.getByText(/item1/)
        expect(item1).toBeInTheDocument()

        const item2 = screen.getByText(/item2/)
        expect(item2).toBeInTheDocument()

        const item3 = screen.getByText(/item3/)
        expect(item3).toBeInTheDocument()
      })
    })
  })

  describe('when selected item has a custom renderer', () => {
    beforeEach(() => {
      const value = ['item1']
      const renderSelected = (item) => <p>Selected: {item}</p>

      props = {
        ...defaultProps,
        value,
        renderSelected,
      }
    })

    it('renders the custom selected item', () => {
      render(<MultiSelect {...props} />)

      const selectedCount = screen.getByText(/Selected: item1/)
      expect(selectedCount).toBeInTheDocument()
    })
  })

  describe('when onSearch function is passed without a resourceName', () => {
    const onSearch = jest.fn()

    beforeEach(() => {
      props = {
        ...defaultProps,
        onSearch,
      }
    })

    it('renders a search input with the correct placeholder', () => {
      render(<MultiSelect {...props} />)

      const button = screen.getByText(/All/)
      userEvent.click(button)

      const searchField = screen.getByRole('textbox')
      expect(searchField).toBeInTheDocument()
    })
  })

  describe('when onSearch function is passed', () => {
    const onSearch = jest.fn()

    beforeEach(() => {
      props = {
        ...defaultProps,
        onSearch,
        resourceName: 'item',
      }
    })

    it('renders a search input', () => {
      render(<MultiSelect {...props} />)

      const button = screen.getByText(/All items/)
      userEvent.click(button)

      const searchField = screen.getByRole('textbox')
      expect(searchField).toBeInTheDocument()
    })

    describe('when typing in the search field', () => {
      it('calls onSearch with the search value', async () => {
        render(<MultiSelect {...props} />)

        const button = screen.getByText(/All items/)
        userEvent.click(button)

        const searchField = screen.getByRole('textbox')
        userEvent.type(searchField, 'item1')

        await waitFor(() => expect(onSearch).toHaveBeenCalledWith('item1'))
      })
    })
  })

  describe('when onLoadMore function is passed', () => {
    const onLoadMore = jest.fn()

    beforeEach(() => {
      props = {
        ...defaultProps,
        onLoadMore,
      }
      useIntersection.mockReturnValue({ isIntersecting: true })
    })

    it('renders an invisible load more trigger', () => {
      render(<MultiSelect {...props} />)
      const button = screen.getByText('All')
      userEvent.click(button)

      const loadingMsg = screen.getByText(/Loading more items/)
      expect(loadingMsg).toBeInTheDocument()
    })

    describe('when load more trigger span is intersecting', () => {
      it('calls onLoadMore with the search value', async () => {
        render(<MultiSelect {...props} />)

        const button = screen.getByText('All')
        userEvent.click(button)

        await waitFor(() => expect(onLoadMore).toHaveBeenCalled())
      })
    })
  })

  describe('when selecting a selected item from the list', () => {
    beforeEach(() => {
      props = {
        ...defaultProps,
        value: ['item1', 'item2', 'item3'],
        resourceName: 'item',
      }
    })

    describe('when the item is clicked', () => {
      it('No longer highlights the selected item', () => {
        render(<MultiSelect {...props} />)

        const button = screen.getByText(/3 items selected/)
        userEvent.click(button)

        const item1Click = screen.getByText('item1')
        userEvent.click(item1Click)

        const item1 = screen.getByText('item1')
        expect(item1).not.toHaveClass('font-bold')
      })

      it('calls onChange without the item', () => {
        render(<MultiSelect {...props} />)

        const button = screen.getByText(/3 items selected/)
        userEvent.click(button)

        const item1Click = screen.getByText('item1')
        userEvent.click(item1Click)

        expect(onChange).toHaveBeenCalledWith(['item2', 'item3'])
      })
    })

    describe('when the item is selected with enter key', () => {
      it('No longer highlights the selected item', () => {
        render(<MultiSelect {...props} />)

        const button = screen.getByText(/3 items selected/)
        userEvent.click(button)

        userEvent.keyboard('{ArrowDown}')
        userEvent.keyboard('{ArrowDown}')
        userEvent.keyboard('{enter}')

        const item1 = screen.getByText('item1')
        expect(item1).not.toHaveClass('font-bold')
      })

      it('calls onChange without the item', () => {
        render(<MultiSelect {...props} />)

        const button = screen.getByText(/3 items selected/)
        userEvent.click(button)

        userEvent.keyboard('{ArrowDown}')
        userEvent.keyboard('{ArrowDown}')
        userEvent.keyboard('{enter}')

        expect(onChange).toHaveBeenCalledWith(['item2', 'item3'])
      })
    })
  })

  describe('when selecting all button', () => {
    beforeEach(() => {
      props = {
        ...defaultProps,
        value: ['item1', 'item2', 'item3'],
        resourceName: 'item',
      }
    })

    it('calls onChange with an empty array', () => {
      render(<MultiSelect {...props} />)

      const button = screen.getByText(/3 items selected/)
      userEvent.click(button)

      const allButton = screen.getByText(/All items/)
      userEvent.click(allButton)

      expect(onChange).toHaveBeenCalledWith([])
    })
  })

  describe('when isLoading is true', () => {
    beforeEach(() => {
      props = {
        ...defaultProps,
        items: [],
        isLoading: true,
      }
    })

    it('a spinner is rendered', async () => {
      render(<MultiSelect {...props} />)

      const button = screen.getByText(/All/)
      userEvent.click(button)

      const presentation = screen.getByRole('presentation')
      expect(presentation).toBeInTheDocument()
    })
  })

  describe('when forward ref is passed', () => {
    beforeEach(() => {
      props = {
        ...defaultProps,
        value: ['item1', 'item2', 'item3'],
        resourceName: 'item',
      }
    })

    it('reset selected function is defined', () => {
      render(
        <MultiSelect
          {...props}
          ref={(ref) => {
            multiSelectRef = ref
          }}
        />
      )

      const button = screen.getByText(/3 items selected/)
      userEvent.click(button)

      act(() => {
        multiSelectRef.resetSelected()
      })

      expect(multiSelectRef.resetSelected).toBeDefined()
    })
  })
})
