import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Select from './Select'

describe('Select', () => {
  let props

  const defaultProps = {
    items: ['a', 'b', 'c'],
    onChange: jest.fn(),
    value: 'a',
  }

  function setup(overProps) {
    props = {
      ...defaultProps,
      ...overProps,
    }
    render(<Select {...props} />)
  }

  describe('when rendered with no items selected', () => {
    beforeEach(() => {
      setup({ value: null })
    })

    it('renders the default placeholder', () => {
      const button = screen.getByText(/Select/)
      expect(button).toBeInTheDocument()
    })

    it('doesnt render the individual items', () => {
      expect(screen.getByRole('listbox')).toBeEmptyDOMElement()
    })
  })

  describe('when rendering with no items selected and custom placeholder', () => {
    beforeEach(() => {
      setup({ value: null, placeholder: 'Alternative placeholder' })
    })

    it('renders the placeholder', () => {
      const tab = screen.getByText(/Alternative placeholder/)
      expect(tab).toBeInTheDocument()
    })
  })

  describe('when rendering with an item', () => {
    beforeEach(() => {
      setup({ value: null, placeholder: 'Alternative placeholder' })
    })

    it('renders the placeholder', () => {
      const button = screen.getByText(/Alternative placeholder/)
      expect(button).toBeInTheDocument()
    })
  })

  describe('when clicking on the button', () => {
    beforeEach(() => {
      setup({ value: null })
      const button = screen.getByText(/Select/)
      userEvent.click(button)
    })

    it('renders the items', () => {
      expect(screen.getByRole('listbox')).not.toBeEmptyDOMElement()
    })

    describe('when clicking on one of the option', () => {
      const index = 1
      beforeEach(() => {
        userEvent.click(screen.getAllByRole('option')[index])
      })

      it('doesnt render the items anymore', () => {
        expect(screen.getByRole('listbox')).toBeEmptyDOMElement()
      })

      it('calls props.onChange with the item', () => {
        expect(props.onChange).toHaveBeenCalledWith(props.items[index])
      })
    })
  })

  describe('when rendered with complex items and custom item rendered', () => {
    beforeEach(() => {
      const items = [
        { planName: 'free' },
        { planName: 'pro' },
        { planName: 'enterprise' },
      ]

      const value = items[0]

      const renderItem = (item) => <p>{item.planName}</p>

      setup({
        items,
        value,
        renderItem,
      })
    })

    it('renders the selected item', () => {
      const button = screen.getByText(props.items[0].planName)
      expect(button).toBeInTheDocument()
    })

    describe('when clicking on the button', () => {
      beforeEach(() => {
        const button = screen.getByText(props.items[0].planName)
        userEvent.click(button)
      })

      it('renders the option user the custom rendered', () => {
        const options = screen.getAllByRole('option')
        expect(options[0]).toHaveTextContent(props.items[0].planName)
        expect(options[1]).toHaveTextContent(props.items[1].planName)
        expect(options[2]).toHaveTextContent(props.items[2].planName)
      })
    })
  })

  describe('when selected item has a custom select option', () => {
    beforeEach(() => {
      const items = [`Don't forget EQ`, `Yeehaw`, `Scarlett Dawn`]
      const value = items[0]
      const renderSelected = (item) => <p>Selected: {item}</p>
      setup({
        items,
        value,
        renderSelected,
      })
    })

    it('renders the custom selected item', () => {
      const button = screen.getByText(/Selected: Don't forget EQ/)
      expect(button).toBeInTheDocument()
    })
  })
})
