import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import OrganizationList from './OrganizationList'

jest.mock('ui/Avatar', () => () => 'Avatar')

const queryClient = new QueryClient()
const server = setupServer()
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh']}>
      <Route path="/:provider">{children}</Route>
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

const orgList = [
  {
    username: 'fearne-calloway-org',
    avatarUrl: 'https://github.com/fearne.png?size=40',
    defaultOrgUsername: null,
  },
  {
    username: 'ira-wendagoth-org',
    avatarUrl: 'https://github.com/fearne.png?size=40',
    defaultOrgUsername: null,
  },
]

const afterLoadedEntry = {
  username: 'liliana-temult-org',
  avatarUrl: 'https://github.com/liliana.png?size=40',
  defaultOrgUsername: null,
}

const currentUser = {
  username: 'morrigan-org',
  avatarUrl: 'https://github.com/morri.png?size=40',
  defaultOrgUsername: 'fearne-calloway-org',
}

const contextData = {
  me: {
    owner: currentUser,
    myOrganizations: {
      edges: [{ node: orgList[0] }, { node: orgList[1] }],
      pageInfo: {
        hasNextPage: true,
        endCursor: '2',
      },
    },
  },
}

const selectedOrgUsername = 'fearne-calloway-org'
const setSelectedOrgUsername = jest.fn()

const defaultProps = {
  selectedOrgUsername,
  setSelectedOrgUsername,
}

describe('OrganizationList', () => {
  function setup(data = contextData) {
    const user = userEvent.setup()

    server.use(
      graphql.query('MyContexts', (req, res, ctx) => {
        if (req?.variables?.after === '2') {
          const mockResponse = {
            me: {
              owner: currentUser,
              myOrganizations: {
                edges: [{ node: afterLoadedEntry }],
                pageInfo: {
                  hasNextPage: false,
                  endCursor: '2',
                },
              },
            },
          }
          return res(ctx.status(200), ctx.data(mockResponse))
        } else {
          return res(ctx.status(200), ctx.data(data))
        }
      })
    )

    return { user }
  }

  describe('when rendered', () => {
    it('displays the usernames and avatars', async () => {
      setup()
      render(<OrganizationList {...defaultProps} />, { wrapper })

      const fearneUsername = await screen.findByText(/fearne-calloway-org/)
      expect(fearneUsername).toBeInTheDocument()
      const defaultOrg = await screen.findByText(/Current default org/)
      expect(defaultOrg).toBeInTheDocument()

      const morriUsername = await screen.findByText(/morri/)
      expect(morriUsername).toBeInTheDocument()

      const iraWendagoth = await screen.findByText(/ira-wendagoth-org/)
      expect(iraWendagoth).toBeInTheDocument()

      const allAvatars = await screen.findAllByText(/Avatar/)
      expect(allAvatars).toHaveLength(3)
    })

    it('displays all orgs and repos', async () => {
      setup()
      render(<OrganizationList {...defaultProps} />, { wrapper })

      const allOrgsAndReposText = await screen.findByText(/All orgs and repos/)
      expect(allOrgsAndReposText).toBeInTheDocument()
    })

    it('displays the load more button', async () => {
      setup()
      render(<OrganizationList {...defaultProps} />, { wrapper })

      const loadMoreButton = await screen.findByText('Load More')
      expect(loadMoreButton).toBeInTheDocument()
    })

    it('loads next page of data', async () => {
      const { user } = setup()
      render(<OrganizationList {...defaultProps} />, { wrapper })
      const loadMoreButton = await screen.findByText('Load More')
      await user.click(loadMoreButton)

      const lilianaOrg = await screen.findByText('liliana-temult-org')
      expect(lilianaOrg).toBeInTheDocument()
    })
  })

  describe('when there is no default org', () => {
    beforeEach(() => {
      const currentUser = {
        username: 'morrigan-org',
        avatarUrl: 'https://github.com/morri.png?size=40',
        defaultOrgUsername: null,
      }

      const contextData = {
        me: {
          owner: currentUser,
          myOrganizations: {
            edges: [{ node: orgList[0] }, { node: orgList[1] }],
            pageInfo: {
              hasNextPage: true,
              endCursor: '2',
            },
          },
        },
      }
      setup(contextData)
    })

    it('displays default text if current user has no default org', async () => {
      render(<OrganizationList {...defaultProps} />, { wrapper })
      const allOrgsAndReposText = await screen.findByText(/All orgs and repos/)
      expect(allOrgsAndReposText).toBeInTheDocument()
    })
  })
})
