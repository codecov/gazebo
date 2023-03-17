import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { BrowserRouter } from 'react-router-dom'

import config from 'config'

import { useFlags } from 'shared/featureFlags'

import App from './App'

jest.mock('./pages/EnterpriseLandingPage', () => () => 'EnterpriseLandingPage')
jest.mock('./pages/AccountSettings', () => () => 'AccountSettings')
jest.mock('./pages/AdminSettings', () => () => 'AdminSettingsPage')
jest.mock('./pages/AllOrgsPlanPage', () => () => 'AllOrgsPlanPage')
jest.mock('./pages/AnalyticsPage', () => () => 'AnalyticsPage')
jest.mock('./pages/CommitDetailPage', () => () => 'CommitDetailPage')
jest.mock('./pages/FeedbackPage', () => () => 'FeedbackPage')
jest.mock('./pages/HomePage', () => () => 'HomePage')
jest.mock('./pages/LoginPage', () => () => 'LoginPage')
jest.mock('./pages/OwnerPage', () => () => 'OwnerPage')
jest.mock('./pages/MembersPage', () => () => 'MembersPage')
jest.mock('./pages/PlanPage/PlanPage', () => () => 'PlanPage')
jest.mock('./pages/PullRequestPage', () => () => 'PullRequestPage')
jest.mock('./pages/RepoPage', () => () => 'RepoPage')
jest.mock('./pages/TermsOfService', () => () => 'TermsOfService')

jest.mock('./shared/GlobalBanners', () => () => '')

jest.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => 'ReactQueryDevtools',
}))

jest.mock('config')
jest.mock('shared/featureFlags')

const user = {
  username: 'CodecovUser',
  email: 'codecov@codecov.io',
  name: 'codecov',
  avatarUrl: 'photo',
  onboardingCompleted: false,
}

const server = setupServer()
beforeAll(() => {
  // silence Error at useUser: Aborted
  console.error = () => {}
  server.listen()
})
afterEach(() => {
  config.IS_SELF_HOSTED = false
  server.resetHandlers()
})
afterAll(() => server.close())

const wrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>

describe('App', () => {
  function setup(
    { termsOfServicePage = false } = { termsOfServicePage: false }
  ) {
    useFlags.mockReturnValue({
      termsOfServicePage,
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

    it('renders the AccountSettings page', async () => {
      render(<App />, { wrapper })

      const page = await screen.findByText(/AccountSettings/i)
      expect(page).toBeInTheDocument()
    })
  })

  describe('rendering admin settings page', () => {
    describe('IS_SELF_HOSTED is true', () => {
      beforeEach(() => {
        config.IS_SELF_HOSTED = true
      })

      describe('/admin/gh/access', () => {
        beforeEach(() => {
          window.history.pushState(
            {},
            'Test Admin Settings Page',
            '/admin/gh/access'
          )
          setup()
        })

        it('renders admin settings page', async () => {
          render(<App />, { wrapper })

          const page = await screen.findByText('AdminSettingsPage')
          expect(page).toBeInTheDocument()
        })
      })
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

    it('renders the Analytics page', async () => {
      render(<App />, { wrapper })

      const page = await screen.findByText(/AnalyticsPage/i)
      expect(page).toBeInTheDocument()
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

    it('renders the commit page', async () => {
      render(<App />, { wrapper })

      const page = await screen.findByText(/CommitDetailPage/i)
      expect(page).toBeInTheDocument()
    })
  })

  describe('rendering enterprise landing page', () => {
    describe('IS_SELF_HOSTED is true', () => {
      beforeEach(() => {
        config.IS_SELF_HOSTED = true
      })

      describe('/', () => {
        beforeEach(() => {
          window.history.pushState({}, 'Test Landing Page Render', '/')
          setup()
        })

        it('renders landing page', async () => {
          render(<App />, { wrapper })

          const page = await screen.findByText('EnterpriseLandingPage')
          expect(page).toBeInTheDocument()
        })
      })
    })
  })

  describe('rendering feedback page', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the feedback page', async () => {
      render(<App />, { wrapper })

      const page = await screen.findByText(/FeedbackPage/i)
      expect(page).toBeInTheDocument()
    })
  })

  describe('rendering home page', () => {
    describe('IS_SELF_HOSTED is false', () => {
      beforeEach(() => {
        config.IS_SELF_HOSTED = false
        window.history.pushState({}, 'Test Landing Page Redirect', '/')
        setup()
      })

      describe('/', () => {
        it('redirects to /gh', async () => {
          render(<App />, { wrapper })

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
    describe('IS_SELF_HOSTED is true', () => {
      beforeEach(() => {
        config.IS_SELF_HOSTED = true
      })

      describe('/login/:provider', () => {
        beforeEach(() => {
          window.history.pushState(
            {},
            'Test Landing Page Redirect',
            '/login/gh'
          )
          setup()
        })

        it('redirects to landing page', () => {
          render(<App />, { wrapper })

          const page = screen.getByText('EnterpriseLandingPage')
          expect(page).toBeInTheDocument()
        })
      })

      describe('/login', () => {
        beforeEach(() => {
          window.history.pushState({}, 'Test Landing Page Redirect', '/login')
          setup()
        })

        it('redirects to landing page', () => {
          render(<App />, { wrapper })

          const page = screen.getByText('EnterpriseLandingPage')
          expect(page).toBeInTheDocument()
        })
      })
    })

    describe('IS_SELF_HOSTED is false', () => {
      beforeAll(() => {
        config.IS_SELF_HOSTED = false
      })

      describe('/login/:provider', () => {
        beforeEach(() => {
          window.history.pushState(
            {},
            'Test Landing Page Redirect',
            '/login/gh'
          )
          setup()
        })

        it('renders login page', async () => {
          render(<App />, { wrapper })

          const page = await screen.findByText('LoginPage')
          expect(page).toBeInTheDocument()
        })
      })

      describe('/login', () => {
        beforeEach(() => {
          window.history.pushState({}, 'Test Landing Page Redirect', '/login')
          setup()
        })

        it('renders login page', () => {
          render(<App />, { wrapper })

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

    it('renders the owner page', async () => {
      render(<App />, { wrapper })

      const page = await screen.findByText(/OwnerPage/i)
      expect(page).toBeInTheDocument()
    })
  })

  describe('rendering plan page', () => {
    describe('cloud', () => {
      beforeEach(() => {
        window.history.pushState({}, 'Test Plan Page', '/plan/gh/codecov/')
        config.IS_SELF_HOSTED = false
        setup()
      })
      afterEach(() => (config.IS_SELF_HOSTED = false))

      it('renders plan page', async () => {
        render(<App />, { wrapper })

        const page = await screen.findByText(/PlanPage/i)
        expect(page).toBeInTheDocument()
      })
    })
    describe('self hosted', () => {
      beforeEach(() => {
        window.history.pushState({}, 'Test Plan Page', '/plan/gh/codecov/')
        config.IS_SELF_HOSTED = true
        setup()
      })
      afterEach(() => (config.IS_SELF_HOSTED = false))

      it('renders plan page', async () => {
        render(<App />, { wrapper })

        const page = screen.queryByText(/PlanPage/i)
        expect(page).not.toBeInTheDocument()
      })
    })
  })

  describe('rendering all orgs plan page', () => {
    describe('cloud', () => {
      beforeEach(() => {
        window.history.pushState({}, 'Test Plan Page', '/plan/gh')
        config.IS_SELF_HOSTED = false
        setup()
      })

      afterEach(() => (config.IS_SELF_HOSTED = false))

      it('renders plan page', async () => {
        render(<App />, { wrapper })

        const page = await screen.findByText(/AllOrgsPlanPage/i)
        expect(page).toBeInTheDocument()
      })
    })

    describe('self hosted', () => {
      beforeEach(() => {
        window.history.pushState({}, 'Test Plan Page', '/plan/gh/')
        config.IS_SELF_HOSTED = true
        setup()
      })

      afterEach(() => (config.IS_SELF_HOSTED = false))

      it('renders plan page', async () => {
        render(<App />, { wrapper })

        const page = screen.queryByText(/AllOrgsPlanPage/i)
        expect(page).not.toBeInTheDocument()
      })
    })
  })

  describe('rendering members page', () => {
    describe('cloud', () => {
      beforeEach(() => {
        config.IS_SELF_HOSTED = false
        window.history.pushState(
          {},
          'Test Members Page',
          '/members/gh/codecov/'
        )
        setup()
      })
      afterEach(() => jest.resetAllMocks())

      it('renders members page', async () => {
        render(<App />, { wrapper })

        const page = await screen.findByText(/MembersPage/i)
        expect(page).toBeInTheDocument()
      })
    })
    describe('self hosted', () => {
      beforeEach(() => {
        config.IS_SELF_HOSTED = true
        window.history.pushState(
          {},
          'Test Members Page',
          '/members/gh/codecov/'
        )
        setup()
      })
      afterEach(() => jest.resetAllMocks())

      it('renders members page', () => {
        render(<App />, { wrapper })

        const page = screen.queryByText(/MembersPage/i)
        expect(page).not.toBeInTheDocument()
      })
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

    it('renders the pull request page', async () => {
      render(<App />, { wrapper })

      const page = await screen.findByText(/PullRequestPage/i)
      expect(page).toBeInTheDocument()
    })
  })

  describe('rendering Repo page', () => {
    beforeEach(() => {
      window.history.pushState({}, 'Test Owner Page', '/gh/codecov/repo')
      setup()
    })

    it('renders the repo page', async () => {
      render(<App />, { wrapper })

      const page = screen.getByText(/RepoPage/i)
      expect(page).toBeInTheDocument()
    })
  })

  describe('rendering terms of service page', () => {
    beforeEach(() => {
      setup({
        termsOfServicePage: true,
      })
    })

    it('renders the terms of service page', () => {
      render(<App />, { wrapper })

      const page = screen.getByText(/TermsOfService/i)
      expect(page).toBeInTheDocument()
    })
  })
})
