import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { useUser } from 'services/user'

import Footer from './Footer'

jest.mock('services/user')
jest.mock('config')

const loggedInUser = {
  user: {
    username: 'p',
    avatarUrl: '',
  },
}

describe('Footer', () => {
  function setup(
    { userData = undefined, selfHosted = false } = {
      userData: undefined,
      selfHosted: false,
    }
  ) {
    useUser.mockReturnValue({ data: userData })
    config.IS_SELF_HOSTED = selfHosted

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
        setup({ userData: loggedInUser })
      })
      afterEach(() => jest.resetAllMocks())
      it('renders the link', () => {
        const feedback = screen.getByText('Feedback')
        expect(feedback).toBeInTheDocument()
      })
    })
    describe('user is not signed in', () => {
      beforeEach(() => {
        setup()
      })
      afterEach(() => jest.resetAllMocks())
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
    afterEach(() => jest.resetAllMocks())
    afterAll(() => {
      jest.useRealTimers()
    })

    it('renders a link', () => {
      const copywrite = screen.getByText(`© 3301 Codecov`)
      expect(copywrite).toBeInTheDocument()
    })
  })

  describe('pricing link', () => {
    describe('user is signed in', () => {
      beforeEach(() => {
        setup()
      })
      afterEach(() => jest.resetAllMocks())
      it('renders the link', () => {
        const feedback = screen.getByText('Pricing')
        expect(feedback).toBeInTheDocument()
      })
    })
    describe('self hosted build', () => {
      beforeEach(() => {
        setup({ selfHosted: true })
      })
      afterEach(() => jest.resetAllMocks())
      it('does not render pricing link', () => {
        expect(screen.queryByText('Pricing')).not.toBeInTheDocument()
      })
    })
  })
})
