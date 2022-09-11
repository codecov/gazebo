import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import MultiSelect from './MultiSelect'

describe('MultiSelect', () => {
  let props

  const defaultProps = {
    resourceName: 'flag',
    items: ['a', 'b', 'c'],
    selectedItems: [],
    onChange: jest.fn(),
    ariaName: 'Flag selector',
  }

  function setup(overProps) {
    props = {
      ...defaultProps,
      ...overProps,
    }
    render(<MultiSelect {...props} />)
  }

  describe('when rendered with no items selected', () => {
    beforeEach(() => {
      setup()
    })

    it('renders that all flags are selected', () => {
      const button = screen.getByText(/All flags/)
      expect(button).toBeInTheDocument()
    })

    it('doesnt render the individual items', () => {
      expect(screen.getByRole('listbox')).toBeEmptyDOMElement()
    })
  })

  describe('when clicking on the button', () => {
    beforeEach(() => {
      setup()
      const button = screen.getByText(/All flags/)
      userEvent.click(button)
    })

    it('renders the items', () => {
      expect(screen.getByRole('listbox')).not.toBeEmptyDOMElement()
    })

    describe('when clicking on one of the option', () => {
      const index = 1
      beforeEach(() => {
        // adding one here as the items are prepending with an option to select them all
        userEvent.click(screen.getAllByRole('option')[index + 1])
      })

      it('doesnt render the items anymore', () => {
        expect(screen.getByRole('listbox')).toBeEmptyDOMElement()
      })

      it('calls props.onChange with the item', () => {
        expect(props.onChange).toHaveBeenCalledWith([props.items[index]])
      })
    })
  })

  describe('when clicking on an already selected item', () => {
    beforeEach(() => {
      setup({ selectedItems: ['a'] })
      userEvent.click(screen.getByText(/1 flag selected/))
      userEvent.click(screen.getAllByRole('option')[1])
    })

    it('calls props.onChange without the item', () => {
      expect(props.onChange).toHaveBeenCalledWith([])
    })
  })

  describe('when clicking on the Select all item', () => {
    beforeEach(() => {
      setup({ selectedItems: ['a', 'b', 'c'] })
      userEvent.click(screen.getByText(/3 flags selected/))
      userEvent.click(screen.getAllByRole('option')[0])
    })

    it('clears the selection', () => {
      expect(props.onChange).toHaveBeenCalledWith([])
    })
  })
})
