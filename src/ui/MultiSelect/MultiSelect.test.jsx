import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import MultiSelect from './MultiSelect'

const mocks = vi.hoisted(() => ({
  useIntersection: vi.fn(),
}))

vi.mock('react-use', async () => {
  const original = await vi.importActual('react-use')

  return {
    ...original,
    useIntersection: mocks.useIntersection,
  }
})

describe('MultiSelect', () => {
  function setup() {
    const user = userEvent.setup()

    return { user }
  }

  describe('when rendered', () => {
    it('renders the default placeholder', () => {
      const onChange = vi.fn()
      render(
        <MultiSelect
          ariaName="multi-select test"
          dataMarketing="multi-select test"
          onChange={onChange}
          items={['item1', 'item2', 'item3']}
        />
      )

      const button = screen.getByText(/All/)
      expect(button).toBeInTheDocument()
    })

    it('does not render the dropdown and its items', () => {
      const onChange = vi.fn()
      render(
        <MultiSelect
          ariaName="multi-select test"
          dataMarketing="multi-select test"
          onChange={onChange}
          items={['item1', 'item2', 'item3']}
        />
      )

      const listbox = screen.getByRole('listbox')
      expect(listbox).toBeEmptyDOMElement()
    })

    describe('when no items are passed', () => {
      it('uses default items value', () => {
        const onChange = vi.fn()
        render(
          <MultiSelect
            ariaName="multi-select test"
            dataMarketing="multi-select test"
            onChange={onChange}
          />
        )

        const listbox = screen.getByRole('listbox')
        expect(listbox).toBeEmptyDOMElement()
      })
    })
  })

  describe('when rendering with a resourceName', () => {
    it('renders the correct placeholder', () => {
      const onChange = vi.fn()
      render(
        <MultiSelect
          ariaName="multi-select test"
          dataMarketing={'multi-select test'}
          onChange={onChange}
          resourceName="item"
        />
      )

      const allItems = screen.getByText('All items')
      expect(allItems).toBeInTheDocument()
    })
  })

  describe('when rendering with a value', () => {
    it('renders the default selected items count', () => {
      const onChange = vi.fn()
      render(
        <MultiSelect
          ariaName="multi-select test"
          dataMarketing={'multi-select test'}
          onChange={onChange}
          value={['item1']}
          resourceName="item"
        />
      )

      const itemSelected = screen.getByText('1 item selected')
      expect(itemSelected).toBeInTheDocument()
    })
  })

  describe('when select button is triggered', () => {
    describe('when triggered with a click', () => {
      it('renders the items', async () => {
        const { user } = setup()
        const onChange = vi.fn()
        render(
          <MultiSelect
            ariaName="multi-select test"
            dataMarketing="multi-select test"
            items={['item1', 'item2', 'item3']}
            onChange={onChange}
          />
        )

        const button = screen.getByText('All')
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

    describe('when triggered enter', () => {
      it('renders the items', async () => {
        const { user } = setup()
        const onChange = vi.fn()
        render(
          <MultiSelect
            ariaName="multi-select test"
            dataMarketing="multi-select test"
            onChange={onChange}
          />
        )
        const button = screen.getByText('All')
        await user.type(button, '{enter}')

        const listbox = screen.getByRole('listbox')
        expect(listbox).not.toBeEmptyDOMElement()
      })
    })
  })

  describe('when selecting an item from the list', () => {
    describe('when selected with a click', () => {
      it('highlights the selected item', async () => {
        const { user } = setup()
        const onChange = vi.fn()
        render(
          <MultiSelect
            ariaName="multi-select test"
            dataMarketing="multi-select test"
            onChange={onChange}
            items={['item1', 'item2', 'item3']}
          />
        )

        const button = screen.getByText('All')
        await user.click(button)

        const item1Click = screen.getByText('item1')
        await user.click(item1Click)

        const item1 = screen.getByText('item1')
        await waitFor(() => expect(item1).toHaveClass('font-bold'))
      })

      it('calls onChange with the item', async () => {
        const { user } = setup()
        const onChange = vi.fn()
        render(
          <MultiSelect
            ariaName="multi-select test"
            dataMarketing="multi-select test"
            onChange={onChange}
            items={['item1', 'item2', 'item3']}
          />
        )

        const button = screen.getByText('All')
        await user.click(button)

        const item1Click = screen.getByText('item1')
        await user.click(item1Click)

        await waitFor(() => expect(onChange).toHaveBeenCalledWith(['item1']))
      })

      it('renders the all button', async () => {
        const { user } = setup()
        const onChange = vi.fn()
        render(
          <MultiSelect
            ariaName="multi-select test"
            dataMarketing="multi-select test"
            items={['item1', 'item2', 'item3']}
            onChange={onChange}
          />
        )
        const button = screen.getByText('All')
        await user.click(button)

        const item1Click = screen.getByRole('option', { name: 'item1' })
        await user.click(item1Click)

        const clearSelected = screen.getByRole('option', {
          name: 'Clear selected',
        })
        expect(clearSelected).toBeInTheDocument()
      })
    })

    describe('when selected with enter key', () => {
      it('calls onChange with the item', async () => {
        const { user } = setup()
        const onChange = vi.fn()
        render(
          <MultiSelect
            ariaName="multi-select test"
            dataMarketing="multi-select test"
            onChange={onChange}
            items={['item1', 'item2', 'item3']}
          />
        )

        const button = screen.getByText('All')
        await user.click(button)

        const item = screen.getByText(/item1/)
        await user.type(item, '{enter}')

        expect(onChange).toHaveBeenCalledWith(['item1'])
      })
    })
  })

  describe('when rendered with complex items and custom item rendered', () => {
    it('renders the default selected items count', () => {
      const items = [{ name: 'item1' }, { name: 'item2' }, { name: 'item3' }]
      const value = [items[0]]
      const onChange = vi.fn()
      render(
        <MultiSelect
          ariaName="multi-select test"
          dataMarketing={'multi-select test'}
          onChange={onChange}
          items={items}
          value={value}
          renderItem={({ name }) => <p>{name}</p>}
          resourceName="item"
        />
      )

      const itemSelected = screen.getByText('1 item selected')
      expect(itemSelected).toBeInTheDocument()
    })

    describe('when clicking on the button', () => {
      it('renders the option user the custom rendered', async () => {
        const { user } = setup()
        const items = [{ name: 'item1' }, { name: 'item2' }, { name: 'item3' }]
        const value = [items[0]]
        const onChange = vi.fn()
        render(
          <MultiSelect
            ariaName="multi-select test"
            dataMarketing="multi-select test"
            onChange={onChange}
            items={items}
            value={value}
            renderItem={({ name }) => <p>{name}</p>}
            resourceName="item"
          />
        )

        const button = screen.getByText('1 item selected')
        await user.click(button)

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
    it('renders the custom selected item', () => {
      const onChange = vi.fn()
      render(
        <MultiSelect
          ariaName="multi-select test"
          dataMarketing={'multi-select test'}
          onChange={onChange}
          items={['item1', 'item2', 'item3']}
          value={['item1']}
          renderSelected={(item) => <p>Selected: {item}</p>}
          resourceName="item"
        />
      )

      const selectedCount = screen.getByText(/Selected: item1/)
      expect(selectedCount).toBeInTheDocument()
    })
  })

  describe('when onSearch function is passed without a resourceName', () => {
    it('renders a search input with the correct placeholder', async () => {
      const { user } = setup()
      const onSearch = vi.fn()
      const onChange = vi.fn()
      render(
        <MultiSelect
          ariaName="multi-select test"
          dataMarketing={'multi-select test'}
          onChange={onChange}
          onSearch={onSearch}
          items={['item1', 'item2', 'item3']}
          resourceName="item"
        />
      )

      const button = screen.getByText(/All/)
      await user.click(button)

      const searchField = screen.getByRole('combobox')
      expect(searchField).toBeInTheDocument()
    })
  })

  describe('when onSearch function is passed', () => {
    describe('there are items found', () => {
      it('renders a search input', async () => {
        const { user } = setup()
        const onSearch = vi.fn()
        const onChange = vi.fn()
        render(
          <MultiSelect
            ariaName="multi-select test"
            dataMarketing="multi-select test"
            onChange={onChange}
            onSearch={onSearch}
            items={['item1', 'item2', 'item3']}
            renderItem={(item) => <p>Selected: {item}</p>}
            resourceName="item"
          />
        )

        const button = screen.getByText(/All items/)
        await user.click(button)

        const searchField = screen.getByRole('combobox')
        expect(searchField).toBeInTheDocument()
      })

      describe('when typing in the search field', () => {
        it('calls onSearch with the search value', async () => {
          const { user } = setup()
          const onSearch = vi.fn()
          const onChange = vi.fn()
          render(
            <MultiSelect
              ariaName="multi-select test"
              dataMarketing="multi-select test"
              onChange={onChange}
              onSearch={onSearch}
              items={['item1', 'item2', 'item3']}
              renderItem={(item) => <p>Selected: {item}</p>}
              resourceName="item"
            />
          )

          const button = screen.getByText(/All items/)
          await user.click(button)

          const searchField = screen.getByRole('combobox')
          await user.type(searchField, 'item1')

          await waitFor(() => expect(onSearch).toHaveBeenCalledWith('item1'))
        })
      })
    })

    describe('when there are no items returned', () => {
      it('renders no results found', async () => {
        const { user } = setup()
        const onSearch = vi.fn()
        const onChange = vi.fn()
        render(
          <MultiSelect
            ariaName="multi-select test"
            dataMarketing="multi-select test"
            onChange={onChange}
            onSearch={onSearch}
            items={[]}
            resourceName="item"
          />
        )

        const button = screen.getByText(/All items/)
        await user.click(button)

        const noResults = await screen.findByText('No results found')
        expect(noResults).toBeInTheDocument()
      })
    })
  })

  describe('when onLoadMore function is passed', () => {
    beforeEach(() => {
      mocks.useIntersection.mockReturnValue({ isIntersecting: true })
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    it('renders an invisible load more trigger', async () => {
      const { user } = setup()
      const onLoadMore = vi.fn()
      const onChange = vi.fn()
      render(
        <MultiSelect
          ariaName="multi-select test"
          dataMarketing={'multi-select test'}
          onChange={onChange}
          onLoadMore={onLoadMore}
        />
      )

      const button = screen.getByText('All')
      await user.click(button)

      const loadingMsg = screen.getByText(/Loading more items/)
      expect(loadingMsg).toBeInTheDocument()
    })

    describe('when load more trigger span is intersecting', () => {
      it('calls onLoadMore with the search value', async () => {
        const { user } = setup()
        const onLoadMore = vi.fn()
        const onChange = vi.fn()
        render(
          <MultiSelect
            ariaName="multi-select test"
            dataMarketing="multi-select test"
            onChange={onChange}
            onLoadMore={onLoadMore}
          />
        )

        const button = screen.getByText('All')
        await user.click(button)

        await waitFor(() => expect(onLoadMore).toHaveBeenCalled())
      })
    })
  })

  describe('when selecting a selected item from the list', () => {
    describe('when the item is clicked', () => {
      it('No longer highlights the selected item', async () => {
        const { user } = setup()
        const onChange = vi.fn()
        render(
          <MultiSelect
            ariaName="multi-select test"
            dataMarketing="multi-select test"
            onChange={onChange}
            items={['item1', 'item2', 'item3']}
            value={['item1', 'item2', 'item3']}
            resourceName="item"
          />
        )

        const button = screen.getByText(/3 items selected/)
        await user.click(button)

        const item1Click = screen.getByRole('option', { name: 'item1' })
        await user.click(item1Click)

        const item1 = screen.getByRole('option', { name: 'item1' })
        expect(item1).toHaveClass('block cursor-pointer py-1 px-3 text-sm')
      })

      it('calls onChange without the item', async () => {
        const { user } = setup()
        const onChange = vi.fn()
        render(
          <MultiSelect
            ariaName="multi-select test"
            dataMarketing="multi-select test"
            onChange={onChange}
            items={['item1', 'item2', 'item3']}
            value={['item1', 'item2', 'item3']}
            resourceName="item"
          />
        )

        const button = screen.getByText(/3 items selected/)
        await user.click(button)

        const item1Click = screen.getByText('item1')
        await user.click(item1Click)

        await waitFor(() =>
          expect(onChange).toHaveBeenCalledWith(['item2', 'item3'])
        )
      })
    })

    describe('when the item is selected with enter key', () => {
      it('No longer highlights the selected item', async () => {
        const { user } = setup()
        const onChange = vi.fn()
        render(
          <MultiSelect
            ariaName="multi-select test"
            dataMarketing="multi-select test"
            items={['item1', 'item2', 'item3']}
            value={['item1', 'item2', 'item3']}
            resourceName="item"
            onChange={onChange}
          />
        )

        const button = screen.getByText(/3 items selected/)
        await user.click(button)

        await user.keyboard('{ArrowDown}')
        await user.keyboard('{ArrowDown}')
        await user.keyboard('{enter}')

        const item1 = screen.getByText('item1')
        expect(item1).not.toHaveClass('font-bold')
      })

      it('calls onChange without the item', async () => {
        const { user } = setup()
        const onChange = vi.fn()
        render(
          <MultiSelect
            ariaName="multi-select test"
            dataMarketing="multi-select test"
            items={['item1', 'item2', 'item3']}
            value={['item1', 'item2', 'item3']}
            resourceName="item"
            onChange={onChange}
          />
        )

        const button = screen.getByText(/3 items selected/)
        await user.click(button)

        await user.keyboard('{ArrowDown}')
        await user.keyboard('{ArrowDown}')
        await user.keyboard('{enter}')

        expect(onChange).toHaveBeenCalledWith(['item2', 'item3'])
      })
    })
  })

  describe('when selecting all button', () => {
    it('calls onChange with an empty array', async () => {
      const { user } = setup()
      const onChange = vi.fn()
      render(
        <MultiSelect
          ariaName="multi-select test"
          dataMarketing="multi-select test"
          items={['item1', 'item2', 'item3']}
          value={['item1', 'item2', 'item3']}
          resourceName="item"
          onChange={onChange}
        />
      )

      const button = screen.getByText(/3 items selected/)
      await user.click(button)

      const clearSelectedButton = screen.getByText(/Clear selected/)
      await user.click(clearSelectedButton)

      await waitFor(() => expect(onChange).toHaveBeenCalledWith([]))
    })
  })

  describe('when isLoading is true', () => {
    it('a spinner is rendered', async () => {
      const { user } = setup()
      const onChange = vi.fn()
      render(
        <MultiSelect
          ariaName="multi-select test"
          dataMarketing="multi-select test"
          onChange={onChange}
          items={[]}
          isLoading={true}
        />
      )

      const button = screen.getByText(/All/)
      await user.click(button)

      const presentation = screen.getByRole('presentation')
      expect(presentation).toBeInTheDocument()
    })
  })

  describe('when forward ref is passed', () => {
    it('reset selected function is defined', async () => {
      const { user } = setup()
      const onChange = vi.fn()
      let multiSelectRef
      render(
        <MultiSelect
          ariaName="multi-select test"
          dataMarketing="multi-select test"
          items={['item1', 'item2', 'item3']}
          onChange={onChange}
          value={['item1', 'item2', 'item3']}
          resourceName="item"
          ref={(ref) => {
            multiSelectRef = ref
          }}
        />
      )

      const button = screen.getByText(/3 items selected/)
      await user.click(button)

      act(() => {
        multiSelectRef.resetSelected()
      })

      expect(multiSelectRef.resetSelected).toBeDefined()
    })
  })
})
