import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import DeactivatedRepo from './DeactivatedRepo'

const queryClient = new QueryClient()
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/gazebo']}>
      <Route path="/:provider/:owner/:repo">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
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

describe('DeactivatedRepo', () => {
  function setup(isCurrentUserPartOfOrg = true) {
    server.use(
      graphql.query('GetRepo', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: {
              isCurrentUserPartOfOrg,
            },
          })
        )
      )
    )
  }

  describe('when user is part of org', () => {
    beforeEach(() => {
      setup()
    })

    it('renders corresponding message', async () => {
      render(<DeactivatedRepo />, { wrapper })

      expect(
        await screen.findByText(/To reactivate the repo go to/)
      ).toBeInTheDocument()
    })
  })

  describe('when user is not part of org', () => {
    beforeEach(() => {
      setup(false)
    })

    it('renders corresponding message', async () => {
      render(<DeactivatedRepo />, { wrapper })

      expect(
        await screen.findByText(
          /Contact an administrator of your git organization/
        )
      ).toBeInTheDocument()
    })
  })
})
