import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LoginErrorHandler from '.'

describe('LoginErrorHandler', () => {
  function setup() {
    render(
      <MemoryRouter initialEntries={['login/gh/codecov']}>
        <LoginErrorHandler />
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })
    it('renders 404 error text', () => {
      expect(screen.getByText('404 error')).toBeInTheDocument()
    })

    it('renders 404 error pic', () => {
      expect(screen.getByText('error-404.svg')).toBeInTheDocument()
    })

    it('renders sign up button', () => {
      expect(screen.getByRole('link', { name: 'Sign up' })).toBeInTheDocument()
    })

    it('renders log in link', () => {
      expect(screen.getByRole('link', { name: 'Log in' })).toBeInTheDocument()
    })
  })
})
