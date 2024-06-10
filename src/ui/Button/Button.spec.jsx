import * as Sentry from '@sentry/react'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import Button from '.'

describe('Button', () => {
  function setup(props = {}) {
    const user = userEvent.setup()
    render(<Button {...props} />, {
      wrapper: MemoryRouter,
    })
    return { user }
  }

  describe('when rendered with the prop `to`', () => {
    it('renders a link with the right URL', () => {
      setup({
        to: {
          pageName: 'account',
          options: {
            provider: 'gh',
            owner: 'spotify',
          },
        },
      })

      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        '/account/gh/spotify'
      )
    })

    it('fires a sentry event on click', async () => {
      const { user } = setup({
        to: {
          pageName: 'account',
          options: {
            provider: 'gh',
            owner: 'spotify',
          },
        },
      })

      const link = screen.getByRole('link')

      await user.click(link)
      await waitFor(() => expect(Sentry.metrics.increment).toHaveBeenCalled())
    })
  })

  describe('when rendered without `to` prop with a hook', () => {
    it('renders a button', async () => {
      setup({
        children: 'hola',
        hook: 'hola',
      })
      expect(screen.getByRole('button')).toHaveTextContent('hola')
    })

    it('fires a sentry event on click', async () => {
      const { user } = setup({
        children: 'hola',
        hook: 'hola',
      })

      const button = screen.getByRole('button')

      await user.click(button)
      await waitFor(() => expect(Sentry.metrics.increment).toHaveBeenCalled())
    })
  })

  describe('when rendered without `to` prop', () => {
    let mockError

    beforeEach(() => {
      mockError = jest.fn()
      const spy = jest.spyOn(console, 'error')
      spy.mockImplementation(mockError)

      setup({
        children: 'hola',
      })
    })
    afterEach(() => jest.resetAllMocks())

    it('PropTypes warning is thrown that developers need to provide a hook prop if not using to', () => {
      expect(mockError).toHaveBeenCalledTimes(1)
    })
  })

  describe('when isLoading', () => {
    beforeEach(() => {
      setup({
        children: 'bonjour',
        isLoading: true,
        hook: 'bonjour',
      })
    })

    it('disables the button', () => {
      expect(screen.getByRole('button')).toHaveAttribute('disabled')
    })

    it('The spinner is displayed', () => {
      expect(screen.getByRole('presentation')).toBeInTheDocument()
    })
  })

  describe('when not isLoading', () => {
    beforeEach(() => {
      setup({
        children: 'bonjour',
        isLoading: false,
        hook: 'bonjour',
      })
    })

    it('The spinner is displayed', () => {
      expect(screen.queryByRole('presentation')).not.toBeInTheDocument()
    })
  })
})
