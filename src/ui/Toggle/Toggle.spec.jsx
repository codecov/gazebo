import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Toggle from './Toggle'

describe('Toggle', () => {
  const requiredProps = {
    label: '🐕',
  }
  function setup(props) {
    render(<Toggle {...requiredProps} {...props} />)
  }

  describe('Toggle is active', () => {
    let mockFn = jest.fn()
    beforeEach(() => {
      setup({ value: true, onClick: mockFn })
    })

    it('renders active state', () => {
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-ds-blue-darker')
    })

    it('Slides circle to the left', () => {
      const button = screen.getByTestId('switch')
      expect(button).toHaveClass('translate-x-5')
    })

    it('calls onClick', async () => {
      const button = screen.getByRole('button')

      await userEvent.click(button)

      expect(mockFn).toBeCalled()
    })
  })

  describe('Toggle is not active', () => {
    let mockFn = jest.fn()
    beforeEach(() => {
      setup({ value: false, onClick: mockFn })
    })

    it('renders inactive state', () => {
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-ds-gray-quinary')
    })

    it('Slides circle to the right', () => {
      const button = screen.getByTestId('switch')
      expect(button).toHaveClass('translate-x-0')
    })

    it('calls onClick', async () => {
      const button = screen.getByRole('button')

      await userEvent.click(button)

      expect(mockFn).toBeCalled()
    })
  })

  describe('Toggle is disabled', () => {
    let mockFn = jest.fn()

    beforeEach(() => {
      setup({ value: false, disabled: true, onClick: mockFn })
    })

    it('renders disabled state', () => {
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-ds-gray-quaternary')
    })

    it('cursor is set to not allow', () => {
      const button = screen.getByRole('button')
      expect(button).toHaveClass('cursor-not-allowed')
    })

    it('does not trigger onClick', () => {
      const button = screen.getByRole('button')

      userEvent.click(button)

      expect(mockFn).not.toBeCalled()
    })

    it('has disabled state on button', () => {
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('disabled')
    })
  })

  describe('Shown Label', () => {
    beforeEach(() => {
      setup({ value: false, showLabel: true })
    })

    it('is screen reader only', () => {
      const label = screen.getByText(/🐕/)
      expect(label).toHaveClass('cursor-pointer')
    })
  })
})
