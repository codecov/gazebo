import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import OwnerExternalId from './OwnerExternalId'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: (initialEntries?: string) => React.FC<React.PropsWithChildren> =
  (initialEntries = '/gh/codecov') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider/:owner">{children}</Route>
        <Route path="/:provider" exact>
          {children}
        </Route>
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

describe('OwnerExternalId', () => {
  function setup(externalId: string | null = 'ext-id-123') {
    server.use(
      graphql.query('DetailOwner', () =>
        HttpResponse.json({
          data: { owner: { username: 'codecov', externalId } },
        })
      )
    )
  }

  describe('when there is an owner with an external id', () => {
    it('renders the copyable external id', async () => {
      setup()
      render(<OwnerExternalId />, { wrapper: wrapper('/gh/codecov') })

      const externalId = await screen.findByText(/Owner ID: ext-id-123/)
      expect(externalId).toBeInTheDocument()
    })
  })

  describe('when the owner has no external id', () => {
    it('renders nothing', async () => {
      setup(null)
      const { container } = render(<OwnerExternalId />, {
        wrapper: wrapper('/gh/codecov'),
      })

      await waitFor(() => expect(container).toBeEmptyDOMElement())
    })
  })

  describe('when there is no owner in the route', () => {
    it('renders nothing', async () => {
      setup()
      const { container } = render(<OwnerExternalId />, {
        wrapper: wrapper('/gh'),
      })

      await waitFor(() => expect(container).toBeEmptyDOMElement())
    })
  })
})
