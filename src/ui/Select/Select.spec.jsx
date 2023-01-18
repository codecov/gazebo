import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import useIntersection from 'react-use/lib/useIntersection'

import Select from './Select'

jest.mock('react-use/lib/useIntersection')

describe('Select', () => {
  let selectRef
  const onChange = jest.fn()

  let props = {}
  const defaultProps = {
    ariaName: 'select test',
    dataMarketing: 'select test',
    items: ['item1', 'item2', 'item3'],
    onChange,
  }

  beforeEach(() => {
    props = { ...defaultProps }
  })

  describe('rendering with default values', () => {
    it('renders the default placeholder', () => {
      render(<Select {...props} />)

      const button = screen.getByText('Select')
      expect(button).toBeInTheDocument()
    })

    it('does not render the dropdown and items', () => {
      render(<Select {...props} />)

      const listbox = screen.getByRole('listbox')
      expect(listbox).toBeEmptyDOMElement()
    })
  })

  describe('toggling dropdown', () => {
    it('displays the dropdown', () => {
      render(<Select {...props} />)

      const button = screen.getByText('Select')
      userEvent.click(button)

      const item1 = screen.getByText('item1')
      expect(item1).toBeInTheDocument()
    })

    it('hides the dropdown', () => {
      render(<Select {...props} />)

      const button = screen.getByText('Select')
      userEvent.click(button)
      userEvent.click(button)

      const listbox = screen.getByRole('listbox')
      expect(listbox).toBeEmptyDOMElement()
    })
  })

  describe('rendering with a resourceName', () => {
    beforeEach(() => {
      props = {
        ...defaultProps,
        resourceName: 'item',
      }
    })

    it('renders with correct placeholder', () => {
      render(<Select {...props} />)

      const button = screen.getByText('Select')
      userEvent.click(button)

      const searchText = screen.getByText('Search for items')
      expect(searchText).toBeInTheDocument()
    })
  })

  describe('when rendering with a value', () => {
    beforeEach(() => {
      props = {
        ...defaultProps,
        value: 'item1',
        resourceName: 'items',
      }
    })

    it('renders the default selected item', () => {
      render(<Select {...props} />)

      const buttonText = screen.getByText('item1')
      expect(buttonText).toBeInTheDocument()
    })
  })

  describe('when rendering with a searchValue', () => {
    beforeEach(() => {
      props = {
        ...defaultProps,
        resourceName: 'items',
        searchValue: 'searching',
      }
    })

    it('renders the default selected item', () => {
      render(<Select {...props} />)

      const button = screen.getByText('Select')
      userEvent.click(button)

      const searchField = screen.getByRole('textbox')
      expect(searchField).toHaveValue('searching')
    })
  })

  describe('when select is triggered', () => {
    it('renders the items', () => {
      render(<Select {...props} />)

      const button = screen.getByText('Select')
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

  describe('when selecting an item from the list', () => {
    it('highlights the selected item', () => {
      render(<Select {...props} />)

      const button = screen.getByText('Select')
      userEvent.click(button)

      const item1Click = screen.getByText('item1')
      userEvent.click(item1Click)

      const item1Button = screen.getByText('item1')
      expect(item1Button).toBeInTheDocument()
    })

    it('calls onChange with the item', () => {
      render(<Select {...props} />)

      const button = screen.getByText('Select')
      userEvent.click(button)

      const item1Click = screen.getByText('item1')
      userEvent.click(item1Click)

      expect(onChange).toHaveBeenCalledWith('item1')
    })
  })

  describe('when rendered with complex items and custom item rendering', () => {
    beforeEach(() => {
      const items = [{ name: 'item1' }, { name: 'item2' }, { name: 'item3' }]
      const value = items[0]
      const renderItem = (item) => <p>{item.name}</p>

      props = {
        ...defaultProps,
        items,
        renderItem,
        value,
      }
    })

    it('renders the option user the custom rendered', () => {
      render(<Select {...props} />)

      const button = screen.getByText('item1')
      userEvent.click(button)

      const listbox = screen.getByRole('listbox')
      expect(listbox).not.toBeEmptyDOMElement()

      const item1Count = screen.getAllByText(/item1/)
      expect(item1Count.length).toBe(2)

      const item2 = screen.getByText(/item2/)
      expect(item2).toBeInTheDocument()

      const item3 = screen.getByText(/item3/)
      expect(item3).toBeInTheDocument()
    })
  })

  describe('when selectedItem has a custom renderer', () => {
    beforeEach(() => {
      const value = 'item1'
      const renderSelected = (item) => <p>Selected: {item}</p>

      props = {
        ...defaultProps,
        value,
        renderSelected,
      }
    })

    it('renders the custom selected item', () => {
      render(<Select {...props} />)

      const selectedItem = screen.getByText('Selected: item1')
      expect(selectedItem).toBeInTheDocument()
    })
  })

  describe('when onSearch is passed', () => {
    const onSearch = jest.fn()

    beforeEach(() => {
      jest.resetAllMocks()
      props = {
        ...defaultProps,
        onSearch,
        resourceName: 'item',
      }
    })

    afterEach(() => {})

    it('renders search input', () => {
      render(<Select {...props} />)

      const button = screen.getByText('Select')
      userEvent.click(button)

      const searchField = screen.getByRole('textbox')
      expect(searchField).toBeInTheDocument()
    })

    it('calls onSearch with the search value', async () => {
      render(<Select {...props} />)

      const button = screen.getByText('Select')
      userEvent.click(button)

      const searchField = await screen.findByPlaceholderText(
        /Search for items/i
      )
      userEvent.type(searchField, 'any text here')

      await waitFor(() => expect(onSearch).toHaveBeenCalled())
    })

    describe('when there are no items', () => {
      beforeEach(() => {
        props = {
          ...defaultProps,
          onSearch,
          resourceName: 'item',
          items: [],
        }
      })

      it('renders no results found when item length is zero', async () => {
        render(<Select {...props} />)

        const button = screen.getByText('Select')
        userEvent.click(button)

        const searchField = await screen.findByPlaceholderText(
          /Search for items/i
        )
        userEvent.type(searchField, 'any text here')

        await waitFor(() => expect(onSearch).toHaveBeenCalled())

        const noResults = await screen.findByText('No results found')
        expect(noResults).toBeInTheDocument()
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
      render(<Select {...props} />)

      const button = screen.getByText('Select')
      userEvent.click(button)

      const loadingMsg = screen.getByText('Loading more items...')
      expect(loadingMsg).toBeInTheDocument()
    })

    describe('when load more trigger span is intersecting', () => {
      it('calls onLoadMore', async () => {
        render(<Select {...props} />)

        const button = screen.getByText('Select')
        userEvent.click(button)

        await waitFor(() => expect(onLoadMore).toHaveBeenCalled())
      })
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

    it('renders a spinner', () => {
      render(<Select {...props} />)

      const button = screen.getByText('Select')
      userEvent.click(button)

      const presentation = screen.getByRole('presentation')
      expect(presentation).toBeInTheDocument()
    })
  })

  describe('when ref is forwarded', () => {
    beforeEach(() => {
      props = {
        ...defaultProps,
      }
    })

    it('sets reset function', () => {
      render(
        <Select
          {...props}
          ref={(ref) => {
            selectRef = ref
          }}
        />
      )

      const button = screen.getByText('Select')
      userEvent.click(button)

      act(() => {
        selectRef.resetSelected()
      })

      expect(selectRef.resetSelected).toBeDefined()
    })
  })
})
