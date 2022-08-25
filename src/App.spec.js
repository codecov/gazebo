import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'

import config from 'config'

import { useFlags } from 'shared/featureFlags'

import App from './App'

jest.mock('./pages/EnterpriseLandingPage', () => () => 'EnterpriseLandingPage')
jest.mock('./pages/AccountSettings', () => () => 'AccountSettings')
jest.mock('./pages/AnalyticsPage', () => () => 'AnalyticsPage')
jest.mock('./pages/CommitPage', () => () => 'CommitPage')
jest.mock('./pages/FeedbackPage', () => () => 'FeedbackPage')
jest.mock('./pages/FileView', () => () => 'FileViewPage')
jest.mock('./pages/HomePage', () => () => 'HomePage')
jest.mock('./pages/LoginPage', () => () => 'LoginPage')
jest.mock('./pages/OwnerPage', () => () => 'OwnerPage')
jest.mock('./pages/MembersPage/MembersPage', () => () => 'MembersPage')
jest.mock('./pages/PlanPage/PlanPage', () => () => 'PlanPage')
jest.mock('./pages/PullRequestPage', () => () => 'PullRequestPage')
jest.mock('./pages/RepoPage/RepoPage', () => () => 'RepoPage')

jest.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => 'ReactQueryDevtools',
}))

jest.mock('shared/featureFlags')
jest.mock('config')

const user = {
  username: 'CodecovUser',
  email: 'codecov@codecov.io',
  name: 'codecov',
  avatarUrl: 'photo',
  onboardingCompleted: false,
}

const server = new setupServer()
beforeAll(() => server.listen())
beforeEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('App', () => {
  function setup() {
    useFlags.mockReturnValue({
      gazeboPlanTab: true,
    })

    server.use(
      graphql.query('DetailOwner', (_, res, ctx) =>
        res(ctx.status(200), ctx.data({ owner: 'codecov' }))
      ),
      graphql.query('CurrentUser', (_, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            me: { user: user, trackingMetadata: { ownerid: 123 }, ...user },
          })
        )
      ),
      graphql.query('GetServiceProviders', (_, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            loginProviders: ['GITHUB'],
          })
        )
      ),
      rest.get('/internal/gh/codecov/account-details/', (_, res, ctx) =>
        res(ctx.status(200))
      )
    )

    render(<App />)
  }

  describe('rendering account settings page', () => {
    beforeEach(() => {
      window.history.pushState(
        {},
        'Test Account Settings Page',
        '/account/gh/codecov/'
      )
      setup()
    })

    it('renders the loading state', () => {
      const loading = screen.getByTestId('logo-spinner')
      expect(loading).toBeInTheDocument()
    })

    it('renders the AccountSettings page', async () => {
      await waitForElementToBeRemoved(() =>
        screen.queryByTestId('logo-spinner')
      )

      expect(screen.getByText(/AccountSettings/i)).toBeInTheDocument()
    })
  })

  describe('rendering analytics page', () => {
    beforeEach(() => {
      window.history.pushState(
        {},
        'Test Analytics Page',
        '/analytics/gh/codecov/'
      )
      setup()
    })

    it('renders the loading state', () => {
      const loading = screen.getByTestId('logo-spinner')
      expect(loading).toBeInTheDocument()
    })

    it('renders the Analytics page', () => {
      expect(screen.getByText(/AnalyticsPage/i)).toBeInTheDocument()
    })
  })

  describe('rendering commit page', () => {
    beforeEach(() => {
      window.history.pushState(
        {},
        'Test Commit Page',
        '/gh/codecov/repo/commit/commit/file.js'
      )
      setup()
    })

    it('renders the loading state', () => {
      const loading = screen.getByTestId('logo-spinner')
      expect(loading).toBeInTheDocument()
    })

    it('renders the commit page', () => {
      expect(screen.getByText(/CommitPage/i)).toBeInTheDocument()
    })
  })

  describe('rendering enterprise landing page', () => {
    describe('IS_ENTERPRISE is true', () => {
      beforeAll(() => {
        config.IS_ENTERPRISE = true
      })

      describe('/', () => {
        it('renders landing page', () => {
          window.history.pushState({}, 'Test Landing Page Render', '/')
          setup()

          const page = screen.getByText('EnterpriseLandingPage')
          expect(page).toBeInTheDocument()
        })
      })
    })
  })

  describe('rendering feedback page', () => {
    beforeEach(() => {
      window.history.pushState({}, 'Test Feedback Page', '/gh/feedback')
      setup()
    })

    it('renders the loading state', () => {
      const loading = screen.getByTestId('logo-spinner')
      expect(loading).toBeInTheDocument()
    })

    it('renders the feedback page', () => {
      expect(screen.getByText(/FeedbackPage/i)).toBeInTheDocument()
    })
  })

  describe('rendering file view page', () => {
    beforeEach(() => {
      window.history.pushState(
        {},
        'Test File View Page',
        '/gh/codecov/repo/blob/ref/path'
      )
      setup()
    })

    it('renders the loading state', () => {
      const loading = screen.getByTestId('logo-spinner')
      expect(loading).toBeInTheDocument()
    })

    it('renders the file view page', () => {
      expect(screen.getByText(/FileViewPage/i)).toBeInTheDocument()
    })
  })

  describe('rendering home page', () => {
    describe('IS_ENTERPRISE is false', () => {
      beforeAll(() => {
        config.IS_ENTERPRISE = false
      })

      describe('/', () => {
        it('redirects to /gh', async () => {
          window.history.pushState({}, 'Test Landing Page Redirect', '/')
          setup()

          await waitForElementToBeRemoved(() =>
            screen.queryByTestId('logo-spinner')
          )

          const page = screen.getByText('HomePage')
          expect(page).toBeInTheDocument()
        })
      })
    })
  })

  describe('rendering login page', () => {
    describe('IS_ENTERPRISE is true', () => {
      beforeAll(() => {
        config.IS_ENTERPRISE = true
      })

      describe('/login/:provider', () => {
        it('redirects to landing page', () => {
          window.history.pushState(
            {},
            'Test Landing Page Redirect',
            '/login/gh'
          )
          setup()

          const page = screen.getByText('EnterpriseLandingPage')
          expect(page).toBeInTheDocument()
        })
      })

      describe('/login', () => {
        it('redirects to landing page', () => {
          window.history.pushState({}, 'Test Landing Page Redirect', '/login')
          setup()

          const page = screen.getByText('EnterpriseLandingPage')
          expect(page).toBeInTheDocument()
        })
      })
    })

    describe('IS_ENTERPRISE is false', () => {
      beforeAll(() => {
        config.IS_ENTERPRISE = false
      })

      describe('/login/:provider', () => {
        it('renders login page', async () => {
          window.history.pushState(
            {},
            'Test Landing Page Redirect',
            '/login/gh'
          )
          setup()

          await waitForElementToBeRemoved(() =>
            screen.queryByTestId('logo-spinner')
          )

          const page = screen.getByText('LoginPage')
          expect(page).toBeInTheDocument()
        })
      })

      describe('/login', () => {
        it('renders login page', () => {
          window.history.pushState({}, 'Test Landing Page Redirect', '/login')
          setup()

          const page = screen.getByText('LoginPage')
          expect(page).toBeInTheDocument()
        })
      })
    })
  })

  describe('rendering owner page', () => {
    beforeEach(() => {
      window.history.pushState({}, 'Test Owner Page', '/gh/codecov')
      setup()
    })

    it('renders the loading state', () => {
      const loading = screen.getByTestId('logo-spinner')
      expect(loading).toBeInTheDocument()
    })

    it('renders the owner page', () => {
      expect(screen.getByText(/OwnerPage/i)).toBeInTheDocument()
    })
  })

  describe('rendering plan page', () => {
    beforeEach(() => {
      window.history.pushState({}, 'Test Plan Page', '/plan/gh/codecov/')
      setup()
    })

    it('renders the loading state', () => {
      const loading = screen.getByTestId('logo-spinner')
      expect(loading).toBeInTheDocument()
    })

    it('renders plan page', async () => {
      const page = screen.getByText(/PlanPage/i)
      expect(page).toBeInTheDocument()
    })
  })

  describe('rendering members page', () => {
    beforeEach(() => {
      window.history.pushState({}, 'Test Members Page', '/members/gh/codecov/')
      setup()
    })

    it('renders the loading state', () => {
      const loading = screen.getByTestId('logo-spinner')
      expect(loading).toBeInTheDocument()
    })

    it('renders members page', () => {
      const page = screen.getByText(/MembersPage/i)
      expect(page).toBeInTheDocument()
    })
  })

  describe('rendering pull request page', () => {
    beforeEach(() => {
      window.history.pushState(
        {},
        'Test Pull Request Page',
        '/gh/codecov/repo/pull/pullId'
      )
      setup()
    })

    it('renders the loading state', () => {
      const loading = screen.getByTestId('logo-spinner')
      expect(loading).toBeInTheDocument()
    })

    it('renders the pull request page', () => {
      expect(screen.getByText(/PullRequestPage/i)).toBeInTheDocument()
    })
  })

  describe('rendering Repo page', () => {
    beforeEach(() => {
      window.history.pushState({}, 'Test Owner Page', '/gh/codecov/repo')
      setup()
    })

    it('renders the loading state', () => {
      const loading = screen.getByTestId('logo-spinner')
      expect(loading).toBeInTheDocument()
    })

    it('renders the repo page', async () => {
      expect(screen.getByText(/RepoPage/i)).toBeInTheDocument()
    })
  })
})
