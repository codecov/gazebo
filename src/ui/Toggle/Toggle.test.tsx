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

  describe('isLoading behavior', () => {
    describe('when isLoading is true', () => {
      it('renders spinner', () => {
        render(
          <Toggle
            label="🐕"
            dataMarketing="marketing"
            value={true}
            disabled={false}
            isLoading={true}
            onClick={() => {}}
          />
        )

        const spinner = screen.getByTestId('toggle-loading-spinner')
        expect(spinner).toBeInTheDocument()
      })

      describe('and is clicked', () => {
        it('does not fire onClick', async () => {
          const { user } = setup()
          const mockFn = vi.fn()
          render(
            <Toggle
              label="🐕"
              dataMarketing="marketing"
              value={false}
              disabled={false}
              onClick={mockFn}
              isLoading={true}
            />
          )

          const button = screen.getByRole('button')

          await user.click(button)

          expect(mockFn).not.toHaveBeenCalled()
        })
      })
    })

    describe('when isLoading is false', () => {
      it('does not render spinner', () => {
        render(
          <Toggle
            label="🐕"
            dataMarketing="marketing"
            value={true}
            disabled={false}
            isLoading={false}
            onClick={() => {}}
          />
        )

        const spinner = screen.queryByTestId('toggle-loading-spinner')
        expect(spinner).not.toBeInTheDocument()
      })

      describe('and is clicked', () => {
        it('does fire onClick', async () => {
          const { user } = setup()
          const mockFn = vi.fn()
          render(
            <Toggle
              label="🐕"
              dataMarketing="marketing"
              value={false}
              disabled={false}
              onClick={mockFn}
              isLoading={false}
            />
          )

          const button = screen.getByRole('button')

          await user.click(button)

          expect(mockFn).toHaveBeenCalled()
        })
      })
    })
  })
})
