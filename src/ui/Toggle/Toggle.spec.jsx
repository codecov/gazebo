import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Toggle from './Toggle'

describe('Toggle', () => {
  function setup() {
    const user = userEvent.setup()
    return { user }
  }

  describe('Toggle is active', () => {
    it('renders active state', () => {
      const mockFn = jest.fn()
      render(
        <Toggle
          label="🐕"
          dataMarketing="marketing"
          value={true}
          onClick={mockFn}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-ds-primary-base')
    })

    it('Slides circle to the left', () => {
      const mockFn = jest.fn()
      render(
        <Toggle
          label="🐕"
          dataMarketing="marketing"
          value={true}
          onClick={mockFn}
        />
      )

      const button = screen.getByTestId('switch')
      expect(button).toHaveClass('translate-x-5')
    })

    it('calls onClick', async () => {
      const { user } = setup()
      const mockFn = jest.fn()
      render(
        <Toggle
          label="🐕"
          dataMarketing="marketing"
          value={true}
          onClick={mockFn}
        />
      )

      const button = screen.getByRole('button')

      await user.click(button)

      expect(mockFn).toHaveBeenCalled()
    })
  })

  describe('Toggle is not active', () => {
    it('renders inactive state', () => {
      const mockFn = jest.fn()
      render(
        <Toggle
          label="🐕"
          dataMarketing="marketing"
          value={false}
          onClick={mockFn}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-ds-gray-quinary')
    })

    it('Slides circle to the right', () => {
      const mockFn = jest.fn()
      render(
        <Toggle
          label="🐕"
          dataMarketing="marketing"
          value={false}
          onClick={mockFn}
        />
      )

      const button = screen.getByTestId('switch')
      expect(button).toHaveClass('translate-x-0')
    })

    it('calls onClick', async () => {
      const { user } = setup()
      const mockFn = jest.fn()
      render(
        <Toggle
          label="🐕"
          dataMarketing="marketing"
          value={false}
          onClick={mockFn}
        />
      )

      const button = screen.getByRole('button')

      await user.click(button)

      expect(mockFn).toHaveBeenCalled()
    })
  })

  describe('Toggle is disabled', () => {
    it('renders disabled state', () => {
      const mockFn = jest.fn()
      render(
        <Toggle
          label="🐕"
          dataMarketing="marketing"
          value={false}
          disabled={true}
          onClick={mockFn}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-ds-gray-quaternary')
    })

    it('cursor is set to not allow', () => {
      const mockFn = jest.fn()
      render(
        <Toggle
          label="🐕"
          dataMarketing="marketing"
          value={false}
          disabled={true}
          onClick={mockFn}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveClass('cursor-not-allowed')
    })

    it('does not trigger onClick', async () => {
      const { user } = setup()
      const mockFn = jest.fn()
      render(
        <Toggle
          label="🐕"
          dataMarketing="marketing"
          value={false}
          disabled={true}
          onClick={mockFn}
        />
      )

      const button = screen.getByRole('button')

      await user.click(button)

      expect(mockFn).not.toHaveBeenCalled()
    })

    it('has disabled state on button', () => {
      const mockFn = jest.fn()
      render(
        <Toggle
          label="🐕"
          dataMarketing="marketing"
          value={false}
          disabled={true}
          onClick={mockFn}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('disabled')
    })
  })

  describe('Shown Label', () => {
    it('is screen reader only', () => {
      const mockFn = jest.fn()
      render(
        <Toggle
          label="🐕"
          dataMarketing="marketing"
          value={false}
          showLabel={true}
          onClick={mockFn}
        />
      )

      const label = screen.getByText(/🐕/)
      expect(label).toHaveClass('cursor-pointer')
    })
  })
})
