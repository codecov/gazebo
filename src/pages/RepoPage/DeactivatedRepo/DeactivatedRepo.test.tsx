import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import DeactivatedRepo from './DeactivatedRepo'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
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
      graphql.query('GetRepo', (info) => {
        return HttpResponse.json({
          data: {
            owner: {
              isCurrentUserPartOfOrg,
              isAdmin: null,
              isCurrentUserActivated: null,
              orgUploadToken: '9e6a6189-20f1-482d-ab62-ecfaa2629290',
              repository: {
                __typename: 'Repository',
                private: false,
                uploadToken: '9e6a6189-20f1-482d-ab62-ecfaa2629295',
                defaultBranch: 'main',
                yaml: '',
                activated: false,
                oldestCommitAt: '',
                active: false,
                isFirstPullRequest: false,
              },
            },
          },
        })
      })
    )
  }

  describe('when user is part of org', () => {
    beforeEach(() => {
      setup()
    })

    it('renders corresponding message', async () => {
      render(<DeactivatedRepo />, { wrapper })

      const message = await screen.findByText(/To reactivate the repo go to/)
      expect(message).toBeInTheDocument()
    })
  })

  describe('when user is not part of org', () => {
    beforeEach(() => {
      setup(false)
    })

    it('renders corresponding message', async () => {
      render(<DeactivatedRepo />, { wrapper })

      const message = await screen.findByText(
        /Contact an administrator of your git organization/
      )
      expect(message).toBeInTheDocument()
    })
  })
})
