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
    { userData = undefined, selfHosted = false, versionNumber } = {
      userData: undefined,
      selfHosted: false,
      versionNumber: undefined,
    }
  ) {
    useUser.mockReturnValue({ data: userData })
    config.IS_SELF_HOSTED = selfHosted
    config.CODECOV_VERSION = versionNumber

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

  describe('renders the current years copyright', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('3301-01-01'))
      setup()
    })
    afterEach(() => jest.resetAllMocks())
    afterAll(() => {
      jest.useRealTimers()
    })

    it('renders a link', () => {
      const copyright = screen.getByText(`© 3301 Codecov`)
      expect(copyright).toBeInTheDocument()
    })
  })

  describe('build mode specific links', () => {
    describe('on cloud', () => {
      beforeEach(() => {
        setup()
      })
      afterEach(() => jest.resetAllMocks())
      it('renders the link', () => {
        const pricing = screen.getByText('Pricing')
        expect(pricing).toBeInTheDocument()
      })
      it('renders licensing link', () => {
        expect(screen.queryByText('Licensing')).not.toBeInTheDocument()
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
      it('renders licensing link', () => {
        expect(screen.getByText('Licensing')).toBeInTheDocument()
      })
    })
  })

  describe('renders the version number', () => {
    describe('app is running in self hosted', () => {
      beforeEach(() => {
        setup({ selfHosted: true, versionNumber: 'v5.0.0' })
      })

      it('displays the version number', () => {
        const versionNumber = screen.getByText('v5.0.0')
        expect(versionNumber).toBeInTheDocument()
      })
    })

    describe('app is not running in self hosted', () => {
      beforeEach(() => {
        setup({ selfHosted: false })
      })
      it('does not display the version number', () => {
        const versionNumber = screen.queryByText('v5.0.0')
        expect(versionNumber).not.toBeInTheDocument()
      })
    })
  })
})
