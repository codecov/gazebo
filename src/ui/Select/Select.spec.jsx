import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import { MemoryRouter, Route } from 'react-router-dom'
import useIntersection from 'react-use/lib/useIntersection'

import Select from './Select'

jest.mock('react-use/lib/useIntersection')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/bb/critical-role/bells-hells']}>
      <Route path="/:provider/:owner/:repo">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('Select', () => {
  function setup() {
    const user = userEvent.setup()

    return { user }
  }

  describe('rendering with default values', () => {
    it('renders the default placeholder', () => {
      const onChange = jest.fn()
      render(
        <Select
          ariaName="select test"
          dataMarketing="select test"
          items={['item1', 'item2', 'item3']}
          onChange={onChange}
        />,
        { wrapper },
        { wrapper }
      )

      const button = screen.getByText('Select')
      expect(button).toBeInTheDocument()
    })

    it('does not render the dropdown and items', () => {
      const onChange = jest.fn()
      render(
        <Select
          ariaName="select test"
          dataMarketing="select test"
          items={['item1', 'item2', 'item3']}
          onChange={onChange}
        />,
        { wrapper },
        { wrapper }
      )

      const listbox = screen.getByRole('listbox')
      expect(listbox).toBeEmptyDOMElement()
    })
  })

  describe('toggling dropdown', () => {
    it('displays the dropdown', async () => {
      const { user } = setup()
      const onChange = jest.fn()
      render(
        <Select
          ariaName="select test"
          dataMarketing="select test"
          items={['item1', 'item2', 'item3']}
          onChange={onChange}
        />,
        { wrapper },
        { wrapper }
      )
      const button = screen.getByText('Select')
      await user.click(button)

      const item1 = screen.getByText('item1')
      expect(item1).toBeInTheDocument()
    })

    it('hides the dropdown', async () => {
      const { user } = setup()
      const onChange = jest.fn()
      render(
        <Select
          ariaName="select test"
          dataMarketing="select test"
          items={['item1', 'item2', 'item3']}
          onChange={onChange}
        />,
        { wrapper },
        { wrapper }
      )

      const button = screen.getByText('Select')
      await user.click(button)
      await user.click(button)

      const listbox = screen.getByRole('listbox')
      expect(listbox).toBeEmptyDOMElement()
    })
  })

  describe('rendering with a resourceName', () => {
    it('renders with correct placeholder', async () => {
      const { user } = setup()
      const onChange = jest.fn()
      render(
        <Select
          ariaName="select test"
          dataMarketing="select test"
          items={['item1', 'item2', 'item3']}
          onChange={onChange}
          resourceName="item"
        />,
        { wrapper }
      )

      const button = screen.getByText('Select')
      await user.click(button)

      const searchText = screen.getByText('Search for items')
      expect(searchText).toBeInTheDocument()
    })
  })

  describe('when rendering with a value', () => {
    it('renders the default selected item', () => {
      const onChange = jest.fn()
      render(
        <Select
          ariaName="select test"
          dataMarketing="select test"
          items={['item1', 'item2', 'item3']}
          onChange={onChange}
          value="item1"
          resourceName="items"
        />,
        { wrapper }
      )

      const buttonText = screen.getByText('item1')
      expect(buttonText).toBeInTheDocument()
    })
  })

  describe('when rendering with a searchValue', () => {
    it('renders the default selected item', async () => {
      const { user } = setup()
      const onChange = jest.fn()
      render(
        <Select
          ariaName="select test"
          dataMarketing="select test"
          items={['item1', 'item2', 'item3']}
          onChange={onChange}
          resourceName="items"
          searchValue="searching"
        />,
        { wrapper }
      )

      const button = screen.getByText('Select')
      await user.click(button)

      const searchField = screen.getByRole('combobox')
      expect(searchField).toHaveValue('searching')
    })
  })

  describe('when select is triggered', () => {
    it('renders the items', async () => {
      const { user } = setup()
      const onChange = jest.fn()
      render(
        <Select
          ariaName="select test"
          dataMarketing="select test"
          items={['item1', 'item2', 'item3']}
          onChange={onChange}
        />,
        { wrapper }
      )

      const button = screen.getByText('Select')
      await user.click(button)

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
    afterEach(() => {
      jest.resetAllMocks()
    })

    it('highlights the selected item', async () => {
      const { user } = setup()
      const onChange = jest.fn()
      render(
        <Select
          ariaName="select test"
          dataMarketing="select test"
          items={['item1', 'item2', 'item3']}
          onChange={onChange}
        />,
        { wrapper }
      )

      const button = screen.getByText('Select')
      await user.click(button)

      const item1Click = screen.getByText('item1')
      await user.click(item1Click)

      const item1Button = screen.getByText('item1')
      expect(item1Button).toBeInTheDocument()
    })

    it('calls onChange with the item', async () => {
      const { user } = setup()
      const onChange = jest.fn()
      render(
        <Select
          ariaName="select test"
          dataMarketing="select test"
          items={['item1', 'item2', 'item3']}
          onChange={onChange}
        />,
        { wrapper }
      )
      const button = screen.getByText('Select')
      await user.click(button)

      const item1Click = screen.getByText('item1')
      await user.click(item1Click)

      await waitFor(() => expect(onChange).toHaveBeenCalledWith('item1'))
    })
  })

  describe('when rendered with complex items and custom item rendering', () => {
    it('renders the option user the custom rendered', async () => {
      const { user } = setup()
      const onChange = jest.fn()
      render(
        <Select
          ariaName="select test"
          dataMarketing="select test"
          onChange={onChange}
          items={[{ name: 'item1' }, { name: 'item2' }, { name: 'item3' }]}
          renderItem={(item) => <p>{item.name}</p>}
          value={{ name: 'item1' }}
        />,
        { wrapper }
      )

      const button = screen.getByText('item1')
      await user.click(button)

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
    it('renders the custom selected item', () => {
      const onChange = jest.fn()
      render(
        <Select
          ariaName="select test"
          dataMarketing="select test"
          items={['item1', 'item2', 'item3']}
          onChange={onChange}
          renderItem={(item) => <p>Selected: {item}</p>}
          value="item1"
        />,
        { wrapper }
      )

      const selectedItem = screen.getByText('Selected: item1')
      expect(selectedItem).toBeInTheDocument()
    })
  })

  describe('when onSearch is passed', () => {
    afterEach(() => {
      jest.resetAllMocks()
    })

    it('renders search input', async () => {
      const { user } = setup()

      const onChange = jest.fn()
      const onSearch = jest.fn()
      render(
        <Select
          ariaName="select test"
          dataMarketing="select test"
          items={['item1', 'item2', 'item3']}
          onChange={onChange}
          onSearch={onSearch}
          resourceName="item"
        />,
        { wrapper }
      )

      const button = screen.getByText('Select')
      await user.click(button)

      const searchField = screen.getByRole('combobox')
      expect(searchField).toBeInTheDocument()
    })

    it('calls onSearch with the search value', async () => {
      const { user } = setup()
      const onChange = jest.fn()
      const onSearch = jest.fn()
      render(
        <Select
          ariaName="select test"
          dataMarketing="select test"
          items={['item1', 'item2', 'item3']}
          resourceName="item"
          onChange={onChange}
          onSearch={onSearch}
        />,
        { wrapper }
      )

      const button = screen.getByText('Select')
      await user.click(button)

      const searchField = await screen.findByPlaceholderText(
        /Search for items/i
      )
      await user.type(searchField, 'any text here')

      await waitFor(() => expect(onSearch).toHaveBeenCalled())
    })

    describe('when there are no items', () => {
      it('renders no results found when item length is zero', async () => {
        const { user } = setup()
        const onChange = jest.fn()
        const onSearch = jest.fn()
        render(
          <Select
            ariaName="select test"
            dataMarketing="select test"
            items={[]}
            onChange={onChange}
            onSearch={onSearch}
            resourceName="item"
          />,
          { wrapper }
        )

        const button = screen.getByText('Select')
        await user.click(button)

        const searchField = await screen.findByPlaceholderText(
          /Search for items/i
        )
        await user.type(searchField, 'any text here')

        await waitFor(() => expect(onSearch).toHaveBeenCalled())

        const noResults = await screen.findByText('No results found')
        expect(noResults).toBeInTheDocument()
      })
    })
  })

  describe('when onLoadMore function is passed', () => {
    beforeEach(() => {
      useIntersection.mockReturnValue({ isIntersecting: true })
    })
    afterEach(() => {
      jest.resetAllMocks()
    })

    it('renders an invisible load more trigger', async () => {
      const { user } = setup()
      const onChange = jest.fn()
      const onSearch = jest.fn()
      const onLoadMore = jest.fn()
      render(
        <Select
          ariaName="select test"
          dataMarketing="select test"
          items={['item1', 'item2', 'item3']}
          onChange={onChange}
          onSearch={onSearch}
          onLoadMore={onLoadMore}
        />,
        { wrapper }
      )

      const button = screen.getByText('Select')
      await user.click(button)

      const loadingMsg = screen.getByText('Loading more items...')
      expect(loadingMsg).toBeInTheDocument()
    })

    it('when load more trigger span is intersecting calls onLoadMore', async () => {
      const { user } = setup()
      const onChange = jest.fn()
      const onSearch = jest.fn()
      const onLoadMore = jest.fn()
      render(
        <Select
          ariaName="select test"
          dataMarketing="select test"
          items={['item1', 'item2', 'item3']}
          onChange={onChange}
          onSearch={onSearch}
          onLoadMore={onLoadMore}
        />,
        { wrapper }
      )

      const button = screen.getByText('Select')
      await user.click(button)

      await waitFor(() => expect(onLoadMore).toHaveBeenCalled())
    })
  })

  describe('when isLoading is true', () => {
    it('renders a spinner', async () => {
      const { user } = setup()
      const onSearch = jest.fn()
      const onChange = jest.fn()

      render(
        <Select
          ariaName="select test"
          dataMarketing="select test"
          items={[]}
          onChange={onChange}
          onSearch={onSearch}
          isLoading={true}
        />,
        { wrapper }
      )

      const button = screen.getByText('Select')
      await user.click(button)

      const presentation = screen.getByRole('presentation')
      expect(presentation).toBeInTheDocument()
    })
  })

  describe('when ref is forwarded', () => {
    it('sets reset function', async () => {
      let selectRef
      const { user } = setup()
      const onSearch = jest.fn()
      const onChange = jest.fn()

      render(
        <Select
          ariaName="select test"
          dataMarketing="select test"
          items={[]}
          onChange={onChange}
          onSearch={onSearch}
          ref={(ref) => {
            selectRef = ref
          }}
        />,
        { wrapper }
      )

      const button = screen.getByText('Select')
      await user.click(button)

      act(() => {
        selectRef.resetSelected()
      })

      expect(selectRef.resetSelected).toBeDefined()
    })
  })
})
