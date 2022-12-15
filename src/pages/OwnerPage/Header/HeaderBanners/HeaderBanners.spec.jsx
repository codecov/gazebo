import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import HeaderBanners from './HeaderBanners'

jest.mock('config')

const server = setupServer()
const queryClient = new QueryClient()

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov']}>
    <QueryClientProvider client={queryClient}>
      <Route path="/:provider/:owner">{children}</Route>
    </QueryClientProvider>
  </MemoryRouter>
)

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
  }) {
    config.IS_SELF_HOSTED = isSelfHosted
    server.use(
      graphql.query('GetUploadsNumber', (req, res, ctx) => {
        if (hasReachedLimit) {
          return res(
            ctx.status(200),
            ctx.data({
              owner: {
                numberOfUploads: 252,
              },
            })
          )
        }

        if (isReachingLimit) {
          return res(
            ctx.status(200),
            ctx.data({
              owner: {
                numberOfUploads: 230,
              },
            })
          )
        }

        return res(ctx.status(200), ctx.data({}))
      })
    )
  }

  describe('displaying the FeedbackBanner', () => {
    describe('running in cloud', () => {
      beforeEach(() => {
        setup({})
      })

      it('displays the banner', async () => {
        render(
          <HeaderBanners
            provider="gh"
            owner={{ username: 'codecov', isCurrentUserPartOfOrg: true }}
          />,
          { wrapper }
        )

        const banner = await screen.findByText('Updating our web app')
        expect(banner).toBeInTheDocument()
      })
    })

    describe('running in self hosted', () => {
      beforeEach(() => {
        setup({ isSelfHosted: true })
      })

      it('does not display the banner', async () => {
        render(
          <HeaderBanners
            provider="gh"
            owner={{ username: 'codecov', isCurrentUserPartOfOrg: true }}
          />,
          { wrapper }
        )

        const banner = screen.queryByText('Updating our web app')
        expect(banner).not.toBeInTheDocument()
      })
    })
  })

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
})
