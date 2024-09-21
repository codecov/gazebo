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
      const mockFn = vi.fn()
      render(
        <Toggle
          label="🐕"
          dataMarketing="marketing"
          value={true}
          onClick={mockFn}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-toggle-active')
    })

    it('Slides circle to the left', () => {
      const mockFn = vi.fn()
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
      const mockFn = vi.fn()
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
      const mockFn = vi.fn()
      render(
        <Toggle
          label="🐕"
          dataMarketing="marketing"
          value={false}
          onClick={mockFn}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-toggle-inactive')
    })

    it('Slides circle to the right', () => {
      const mockFn = vi.fn()
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
      const mockFn = vi.fn()
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
      const mockFn = vi.fn()
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
      expect(button).toHaveClass('bg-toggle-disabled')
    })

    it('cursor is set to not allow', () => {
      const mockFn = vi.fn()
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
      const mockFn = vi.fn()
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
      const mockFn = vi.fn()
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
})
