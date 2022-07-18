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
  function setup(userData = undefined) {
    useUser.mockReturnValue({ data: userData })

    render(
      <MemoryRouter initialEntries={['/bb/critical-role/bells-hells']}>
        <Route path="/:provider/:owner/:repo">
          <Footer />
        </Route>
      </MemoryRouter>
    )
  }

  describe('rendering the feedback link', () => {
    describe('user is signed in', () => {
      beforeEach(() => {
        setup(loggedInUser)
      })
      it('renders the link', () => {
        const feedback = screen.getByText('Feedback')
        expect(feedback).toBeInTheDocument()
      })
    })
    describe('user is not signed in', () => {
      beforeEach(() => {
        setup()
      })
      it('does not render link with no signed in user', () => {
        expect(screen.queryByText('Feedback')).toBeNull()
      })
    })
  })

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
