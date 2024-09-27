import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import DateRangePicker from './DateRangePicker'

class ResizeObserverMock {
  [x: string]: any
  constructor(cb: any) {
    this.cb = cb
  }
  observe() {
    this.cb([{ borderBoxSize: { inlineSize: 0, blockSize: 0 } }])
  }
  unobserve() {
    // do nothing
  }
  disconnect() {
    // do nothing
  }
}

global.window.ResizeObserver = ResizeObserverMock

describe('DateRangePicker', () => {
  function setup(addedProps?: {}) {
    const mockOnChange = vi.fn()
    const user = userEvent.setup()

    const props = {
      onChange: mockOnChange,
      ...addedProps,
    }

    return { user, props, mockOnChange }
  }

  describe('when no dates are provided', () => {
    it('renders button with text: pick a date', () => {
      const { props } = setup()
      render(<DateRangePicker {...props} />)

      const button = screen.getByRole('button', { name: 'Pick a date' })
      expect(button).toBeInTheDocument()
    })
  })

  describe('when start date is provided', () => {
    it('renders just the start date', () => {
      const { props } = setup({ startDate: new Date('2020-01-01') })
      render(<DateRangePicker {...props} />)

      const button = screen.getByRole('button', { name: 'Jan 01, 2020' })
      expect(button).toBeInTheDocument()
    })
  })

  describe('when both start and end date are provided', () => {
    it('renders just the start date', () => {
      const { props } = setup({
        startDate: new Date('2020-01-01'),
        endDate: new Date('2020-01-02'),
      })
      render(<DateRangePicker {...props} />)

      const button = screen.getByRole('button', {
        name: 'Jan 01, 2020 - Jan 02, 2020',
      })
      expect(button).toBeInTheDocument()
    })
  })

  describe('user clicks on a date', () => {
    it('calls onChange function', async () => {
      const { user, props, mockOnChange } = setup({
        startDate: new Date('2020-01-01'),
      })
      render(<DateRangePicker {...props} />)

      const button = screen.getByRole('button', { name: 'Jan 01, 2020' })
      await user.click(button)

      const gridCells = screen.getAllByRole('gridcell', { name: '31' })
      const date = within(gridCells[0]!).getByText('31')

      await user.click(date)

      await waitFor(() => expect(mockOnChange).toHaveBeenCalled())
    })
  })
})
