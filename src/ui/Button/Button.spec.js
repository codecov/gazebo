import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import Button from '.'

describe('Button', () => {
  function setup(props = {}) {
    render(<Button {...props} />, {
      wrapper: MemoryRouter,
    })
  }

  describe('when rendered with the prop `to`', () => {
    beforeEach(() => {
      setup({
        to: {
          pageName: 'account',
          options: {
            provider: 'gh',
            owner: 'spotify',
          },
        },
      })
    })

    it('renders a link with the right URL', () => {
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        '/account/gh/spotify'
      )
    })
  })

  describe('when rendered without `to` prop with a hook', () => {
    beforeEach(() => {
      setup({
        children: 'hola',
        hook: 'hola',
      })
    })

    it('renders a button', () => {
      expect(screen.getByRole('button')).toHaveTextContent('hola')
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
