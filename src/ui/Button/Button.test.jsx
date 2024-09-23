import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import Button from './Button'

describe('Button', () => {
  describe('when rendered with the prop `to`', () => {
    it('renders a link with the right URL', () => {
      render(
        <Button
          to={{
            pageName: 'account',
            options: {
              provider: 'gh',
              owner: 'spotify',
            },
          }}
        />,
        { wrapper: MemoryRouter }
      )

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/account/gh/spotify')
    })
  })

  describe('when rendered without `to` prop with a hook', () => {
    it('renders a button', () => {
      render(<Button hook="hola">hola</Button>, { wrapper: MemoryRouter })

      const btn = screen.getByRole('button')
      expect(btn).toHaveTextContent('hola')
    })
  })

  describe('when rendered without `to` prop', () => {
    let mockError

    beforeEach(() => {
      mockError = vi.fn()
      const spy = vi.spyOn(console, 'error')
      spy.mockImplementation(mockError)
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    it('PropTypes warning is thrown that developers need to provide a hook prop if not using to', () => {
      render(<Button>hola</Button>, { wrapper: MemoryRouter })
      expect(mockError).toHaveBeenCalledTimes(1)
    })
  })

  describe('when isLoading', () => {
    it('disables the button', () => {
      render(
        <Button isLoading={true} hook="bonjour">
          bonjour
        </Button>,
        { wrapper: MemoryRouter }
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('disabled')
    })

    it('The spinner is displayed', () => {
      render(
        <Button isLoading={true} hook="bonjour">
          bonjour
        </Button>,
        { wrapper: MemoryRouter }
      )

      const spinner = screen.getByRole('presentation')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('when not isLoading', () => {
    it('The spinner is displayed', () => {
      render(
        <Button isLoading={false} hook="bonjour">
          bonjour
        </Button>,
        { wrapper: MemoryRouter }
      )

      const spinner = screen.queryByRole('presentation')
      expect(spinner).not.toBeInTheDocument()
    })
  })
})
