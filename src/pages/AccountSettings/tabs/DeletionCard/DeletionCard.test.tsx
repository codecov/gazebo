import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import DeletionCard from './DeletionCard'

vi.mock('copy-to-clipboard', () => ({ default: () => true }))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/account/gh/test-user']}>
      <Route path="/account/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const server = setupServer()

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.restoreHandlers()
})

afterAll(() => {
  server.close()
})

describe('DeletionCard', () => {
  function setup({ externalId = 'ext-id-123' }: { externalId?: string } = {}) {
    server.use(
      graphql.query('DetailOwner', () =>
        HttpResponse.json({
          data: {
            owner: {
              ownerid: 1,
              username: 'test-user',
              avatarUrl: 'http://127.0.0.1/avatar-url',
              isCurrentUserPartOfOrg: true,
              isAdmin: true,
              isOnlyUsingSentryApp: false,
              externalId,
            },
          },
        })
      )
    )
  }

  it('renders header', () => {
    setup()
    render(<DeletionCard isPersonalSettings={true} />, { wrapper })

    const header = screen.getByRole('heading', { name: 'Delete account' })
    expect(header).toBeInTheDocument()
  })

  describe('when isPersonalSettings is true', () => {
    it('renders account deletion message', () => {
      setup()
      render(<DeletionCard isPersonalSettings={true} />, { wrapper })

      const message = screen.getByText(
        /Erase my personal account and all my repositories./
      )
      expect(message).toBeInTheDocument()
    })
  })

  describe('when isPersonalSettings is false', () => {
    it('renders organization deletion message', () => {
      setup()
      render(<DeletionCard isPersonalSettings={false} />, { wrapper })

      const message = screen.getByText(
        /Erase organization and all its repositories./
      )
      expect(message).toBeInTheDocument()
    })
  })

  describe('when the owner has an external id', () => {
    it('renders the owner id', async () => {
      setup({ externalId: 'ext-id-123' })
      render(<DeletionCard isPersonalSettings={true} />, { wrapper })

      const ownerId = await screen.findByText(/Owner ID: ext-id-123/)
      expect(ownerId).toBeInTheDocument()
    })
  })
})
