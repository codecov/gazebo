import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import A from '.'

describe('A', () => {
  function setup(props = {}) {
    render(<A {...props} />, {
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

  describe('when rendered without `to` prop with a hook passed', () => {
    beforeEach(() => {
      setup({
        children: 'hola',
        href: '/banana',
        hook: 'banana',
      })
    })

    it('renders a A', () => {
      expect(screen.getByRole('link')).toHaveAttribute('href', '/banana')
    })
  })

  describe('when rendered without `to` prop', () => {
    let mockError

    beforeEach(() => {
      mockError = jest.fn()
      const spy = jest.spyOn(console, 'error')
      spy.mockImplementation(mockError)

      setup({
        href: '/banana',
      })
    })
    afterEach(() => jest.resetAllMocks())

    it('PropTypes warning is thrown that developers need to provide a hook prop if not using to', () => {
      expect(mockError).toHaveBeenCalledTimes(1)
    })
  })
})
