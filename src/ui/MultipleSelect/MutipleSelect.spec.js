import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import useIntersection from 'react-use/lib/useIntersection'

import MultipleSelect from './MultipleSelect'

jest.mock('react-use/lib/useIntersection')

describe('MultipleSelect', () => {
  let props
  const onChange = jest.fn()
  const defaultProps = {
    items: ['item1', 'item2', 'item3'],
    resourceName: 'item',
    onChange,
  }

  function setup(overProps, isIntersecting = false) {
    props = {
      ...defaultProps,
      ...overProps,
    }

    useIntersection.mockReturnValue({ isIntersecting })

    render(<MultipleSelect {...props} />)
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the default placeholder', () => {
      const button = screen.getByText(/Select items/)
      expect(button).toBeInTheDocument()
    })

    it('doesnt render the dropdown and its items', () => {
      expect(screen.getByRole('listbox')).toBeEmptyDOMElement()
    })
  })

  describe('when rendering with a custom placeholder', () => {
    beforeEach(() => {
      setup({ placeholder: 'Custom placeholder' })
    })

    it('renders the placeholder', () => {
      expect(screen.getByText(/Custom placeholder/)).toBeInTheDocument()
    })
  })

  describe('when rendering with a value', () => {
    beforeEach(() => {
      setup({ value: ['item1'] })
    })

    it('renders the default selected items count', () => {
      expect(screen.getByText(/1 item selected/)).toBeInTheDocument()
    })
  })

  describe('when select button is triggered', () => {
    beforeEach(() => {
      setup()
    })

    describe('when triggered with a click', () => {
      beforeEach(() => {
        const button = screen.getByText(/Select/)
        userEvent.click(button)
      })

      it('renders the items', () => {
        expect(screen.getByRole('listbox')).not.toBeEmptyDOMElement()
        expect(screen.getByText(/item1/)).toBeInTheDocument()
        expect(screen.getByText(/item2/)).toBeInTheDocument()
        expect(screen.getByText(/item3/)).toBeInTheDocument()
      })
    })

    describe('when triggered enter', () => {
      beforeEach(() => {
        const button = screen.getByText(/Select/)
        userEvent.type(button, '{enter}')
      })

      it('renders the items', () => {
        expect(screen.getByRole('listbox')).not.toBeEmptyDOMElement()
      })
    })

    describe('when triggered with space button', () => {
      beforeEach(() => {
        const button = screen.getByText(/Select/)
        userEvent.type(button, '{space}')
      })

      it('renders the items', () => {
        expect(screen.getByRole('listbox')).not.toBeEmptyDOMElement()
      })
    })
  })

  describe('when selecting an item from the list', () => {
    beforeEach(() => {
      setup()
      const button = screen.getByText(/Select/)
      userEvent.click(button)
    })

    describe('when selected with a click', () => {
      beforeEach(() => {
        userEvent.click(screen.getByText(/item1/))
      })
      it('highlights the selected item', () => {
        expect(screen.getByText(/item1/)).toHaveClass('font-bold')
      })

      it('calls onChange with the item', () => {
        expect(onChange).toHaveBeenCalledWith(['item1'])
      })

      it('renders the all button', () => {
        expect(screen.getByText(/All items/)).toBeInTheDocument()
      })
    })

    describe('when selected with enter key', () => {
      beforeEach(() => {
        const item = screen.getByText(/item1/)
        userEvent.type(item, '{enter}')
      })

      it('calls onChange with the item', () => {
        expect(onChange).toHaveBeenCalledWith(['item1'])
      })
    })

    describe('when selected with space key', () => {
      beforeEach(() => {
        const item = screen.getByText(/item1/)
        userEvent.type(item, '{space}')
      })

      it('calls onChange with the item', () => {
        expect(onChange).toHaveBeenCalledWith(['item1'])
      })
    })
  })

  describe('when rendered with complex items and custom item rendered', () => {
    beforeEach(() => {
      const items = [{ name: 'item1' }, { name: 'item2' }, { name: 'item3' }]

      const value = [items[0]]

      const renderItem = ({ name }) => <p>{name}</p>

      setup({
        items,
        value,
        renderItem,
      })
    })

    it('renders the default selected items count', () => {
      expect(screen.getByText('1 item selected')).toBeInTheDocument()
    })

    describe('when clicking on the button', () => {
      beforeEach(() => {
        const button = screen.getByText('1 item selected')
        userEvent.click(button)
      })

      it('renders the option user the custom rendered', () => {
        expect(screen.getByRole('listbox')).not.toBeEmptyDOMElement()
        expect(screen.getByText(/item1/)).toBeInTheDocument()
        expect(screen.getByText(/item2/)).toBeInTheDocument()
        expect(screen.getByText(/item3/)).toBeInTheDocument()
      })
    })
  })

  describe('when selected item has a custom renderer', () => {
    beforeEach(() => {
      const value = ['item1']
      const renderSelected = (item) => <p>Selected: {item}</p>
      setup({
        value,
        renderSelected,
      })
    })

    it('renders the custom selected item', () => {
      expect(screen.getByText(/Selected: item1/)).toBeInTheDocument()
    })
  })

  describe('when onSearch function is passed', () => {
    const onSearch = jest.fn()

    beforeEach(() => {
      setup({
        onSearch,
      })
      const button = screen.getByText(/Select/)
      userEvent.click(button)
    })

    it('renders a search input', () => {
      const searchField = screen.getByRole('textbox', {
        name: 'Search for items',
      })
      expect(searchField).toBeInTheDocument()
    })

    describe('when typing in the search field', () => {
      beforeEach(() => {
        const searchField = screen.getByRole('textbox', {
          name: 'Search for items',
        })
        userEvent.type(searchField, 'item1')
      })
      it('calls onSeardch with the search value', async () => {
        await waitFor(() => expect(onSearch).toHaveBeenCalledWith('item1'))
      })
    })
  })

  describe('when onLoadMore function is passed', () => {
    const onLoadMore = jest.fn()

    beforeEach(() => {
      setup(
        {
          onLoadMore,
        },
        true
      )
      const button = screen.getByText(/Select/)
      userEvent.click(button)
    })

    it('renders an invisible load more trigger', () => {
      expect(screen.getByText(/Loading more items/)).toBeInTheDocument()
    })

    describe('when scrolling to the bottom of the list', () => {
      it('calls onLoadMore with the search value', async () => {
        await waitFor(() => expect(onLoadMore).toHaveBeenCalled())
      })
    })
  })

  describe('when selecting a selected item from the list', () => {
    beforeEach(() => {
      setup({ value: ['item1', 'item2', 'item3'] })
      const button = screen.getByText(/3 items selected/)
      userEvent.click(button)
    })

    describe('when the item is clicked', () => {
      beforeEach(() => {
        userEvent.click(screen.getByText('item1'))
      })
      it('No longer highlights the selected item', () => {
        expect(screen.getByText('item1')).not.toHaveClass('font-bold')
      })

      it('calls onChange without the item', () => {
        expect(onChange).toHaveBeenCalledWith(['item2', 'item3'])
      })
    })

    describe('when the item is selected with enter key', () => {
      beforeEach(() => {
        userEvent.keyboard('{ArrowDown}')
        userEvent.keyboard('{ArrowDown}')
        userEvent.keyboard('{enter}')
      })
      it('No longer highlights the selected item', () => {
        expect(screen.getByText('item2')).not.toHaveClass('font-bold')
      })

      it('calls onChange without the item', () => {
        expect(onChange).toHaveBeenCalledWith(['item1', 'item3'])
      })
    })

    describe('when the item is selected with space key', () => {
      beforeEach(() => {
        userEvent.keyboard('{ArrowDown}')
        userEvent.keyboard('{ArrowDown}')
        userEvent.keyboard('{space}')
      })
      it('No longer highlights the selected item', () => {
        expect(screen.getByText('item2')).not.toHaveClass('font-bold')
      })

      it('calls onChange without the item', () => {
        expect(onChange).toHaveBeenCalledWith(['item1', 'item3'])
      })
    })
  })

  describe('when selecting all button', () => {
    beforeEach(() => {
      setup({ value: ['item1', 'item2', 'item3'] })
      const button = screen.getByText(/3 items selected/)
      userEvent.click(button)
      const allButton = screen.getByText(/All items/)
      userEvent.click(allButton)
    })

    it('calls onChange with an empty array', () => {
      expect(onChange).toHaveBeenCalledWith([])
    })
  })
})
