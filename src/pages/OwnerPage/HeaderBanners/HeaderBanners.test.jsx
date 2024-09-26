import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, http, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { TrialStatuses } from 'services/account'

import HeaderBanners from './HeaderBanners'

vi.mock('config')

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov']}>
      <Route path="/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const mockPlanDataResponse = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: 'monthly',
  marketingName: 'Pro Team',
  monthlyUploadLimit: 250,
  value: 'test-plan',
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 1,
  hasSeatsLeft: true,
}

const mockPlanDataResponseNoUploadLimit = {
  ...mockPlanDataResponse,
  monthlyUploadLimit: null,
}

beforeAll(() => {
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

describe('HeaderBanners', () => {
  function setup({
    isSelfHosted = false,
    hasReachedLimit = false,
    isReachingLimit = false,
    integrationId = 9,
  }) {
    config.IS_SELF_HOSTED = isSelfHosted
    server.use(
      graphql.query('OwnerPageData', (info) => {
        if (hasReachedLimit) {
          return HttpResponse.json({
            data: { owner: { numberOfUploads: 252 } },
          })
        }

        if (isReachingLimit) {
          return HttpResponse.json({
            data: { owner: { numberOfUploads: 230 } },
          })
        }

        return HttpResponse.json({
          data: { owner: { numberOfUploads: 230 } },
        })
      }),
      graphql.query('GetPlanData', (info) => {
        return HttpResponse.json({
          data: {
            owner: {
              hasPrivateRepos: true,
              plan: mockPlanDataResponse,
            },
          },
        })
      }),
      http.get('/internal/gh/codecov/account-details/', (info) => {
        return HttpResponse.json({ integrationId })
      })
    )
  }

  describe('displaying ExceededUploadsAlert banner', () => {
    describe('org has exceeded limit', () => {
      beforeEach(() => {
        setup({
          hasReachedLimit: true,
        })
      })

      it('displays the banner', async () => {
        render(
          <HeaderBanners
            provider="gh"
            owner={{ username: 'codecov', isCurrentUserPartOfOrg: true }}
          />,
          { wrapper }
        )

        const banner = await screen.findByText('Upload limit has been reached')
        expect(banner).toBeInTheDocument()
      })
    })

    describe('org has not exceeded limit', () => {
      beforeEach(() => {
        setup({
          hasReachedLimit: false,
        })
      })

      it('does not display the banner', async () => {
        render(
          <HeaderBanners
            provider="gh"
            owner={{ username: 'codecov', isCurrentUserPartOfOrg: true }}
          />,
          { wrapper }
        )

        const banner = screen.queryByText('Upload limit has been reached')
        expect(banner).not.toBeInTheDocument()
      })
    })
  })

  describe('displaying ReachingUploadLimit banner', () => {
    describe('org has exceeded limit', () => {
      beforeEach(() => {
        setup({
          isReachingLimit: true,
        })
      })

      it('displays the banner', async () => {
        render(
          <HeaderBanners
            provider="gh"
            owner={{ username: 'codecov', isCurrentUserPartOfOrg: true }}
          />,
          { wrapper }
        )

        const banner = await screen.findByText('Upload limit almost reached')
        expect(banner).toBeInTheDocument()
      })
    })

    describe('org has not exceeded limit', () => {
      beforeEach(() => {
        setup({
          isReachingLimit: false,
        })
      })

      it('does not display the banner', async () => {
        render(
          <HeaderBanners
            provider="gh"
            owner={{ username: 'codecov', isCurrentUserPartOfOrg: true }}
          />,
          { wrapper }
        )

        const banner = screen.queryByText('Upload limit almost reached')
        expect(banner).not.toBeInTheDocument()
      })
    })
  })

  describe('org has no monthlyUploadLimit defined', () => {
    beforeEach(() => {
      setup({
        hasReachedLimit: true,
      })
      server.use(
        graphql.query('GetPlanData', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.data({
              owner: {
                hasPrivateRepos: true,
                plan: mockPlanDataResponseNoUploadLimit,
              },
            })
          )
        })
      )
    })

    it('treats monthly uploads as unlimited', () => {
      render(
        <HeaderBanners
          provider="gh"
          owner={{ username: 'codecov', isCurrentUserPartOfOrg: true }}
        />,
        { wrapper }
      )

      const banner = screen.queryByText('Upload limit')
      expect(banner).not.toBeInTheDocument()
    })
  })

  describe('user does not have gh app installed', () => {
    beforeEach(() => {
      setup({
        integrationId: null,
      })
    })

    it('displays github app config banner', async () => {
      render(
        <HeaderBanners
          provider="gh"
          owner={{ username: 'codecov', isCurrentUserPartOfOrg: true }}
        />,
        { wrapper }
      )

      await waitFor(() => {
        const banner = screen.getByText("Codecov's GitHub app")
        return expect(banner).toBeInTheDocument()
      })
    })
  })

  describe('user is running in self hosted mode', () => {
    beforeEach(() => {
      setup({
        isSelfHosted: true,
      })
    })

    it('renders an empty dom', () => {
      const { container } = render(
        <HeaderBanners
          provider="gh"
          owner={{ username: 'codecov', isCurrentUserPartOfOrg: true }}
        />,
        { wrapper }
      )

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('error in api response', () => {
    server.use(
      http.get('/internal/gh/codecov/account-details/', (info) => {
        return HttpResponse.error(404)
      })
    )

    it('does not display github app config banner', async () => {
      render(
        <HeaderBanners
          provider="gh"
          owner={{ username: 'codecov', isCurrentUserPartOfOrg: true }}
        />,
        { wrapper }
      )

      const banner = screen.queryByText("Codecov's GitHub app")
      expect(banner).not.toBeInTheDocument()
    })
  })
})
