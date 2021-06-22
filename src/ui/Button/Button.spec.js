import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Button from '.'

describe('Button', () => {
  function setup(props = {}, location = '/gh/codecov') {
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

  describe('when rendered without `to` prop', () => {
    beforeEach(() => {
      setup({
        children: 'hola',
      })
    })

    it('renders a button', () => {
      expect(screen.getByRole('button')).toHaveTextContent('hola')
    })
  })

  describe('when isLoading', () => {
    beforeEach(() => {
      setup({
        children: 'bonjour',
        isLoading: true,
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
      })
    })

    it('The spinner is displayed', () => {
      expect(screen.queryByRole('presentation')).not.toBeInTheDocument()
    })
  })
})
