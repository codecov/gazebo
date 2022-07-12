import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useUser } from 'services/user'

import Footer from './Footer'

jest.mock('services/user')

const loggedInUser = {
  user: {
    username: 'p',
    avatarUrl: '',
  },
}

describe('Footer', () => {
  function setup() {
    useUser.mockReturnValue(loggedInUser)
    render(
      <MemoryRouter initialEntries={['/bb/critical-role/bells-hells']}>
        <Route path="/:provider/:owner/:repo">
          <Footer />
        </Route>
      </MemoryRouter>
    )
  }

  describe('renders the current years copywrite', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('3301-01-01'))
      setup()
    })
    afterAll(() => {
      jest.useRealTimers()
    })

    it('renders a link', () => {
      const copywrite = screen.getByText(`© 3301 Codecov`)
      expect(copywrite).toBeInTheDocument()
    })
  })
})
