import { render, screen, waitFor } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import useIntersection from 'react-use/lib/useIntersection'

import { useImage } from 'services/image'

import MyContextSwitcher from './MyContextSwitcher'

jest.mock('services/image')
jest.mock('react-use/lib/useIntersection')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const org1 = {
  username: 'codecov',
  avatarUrl: 'https://github.com/codecov.png?size=40',
}

const org2 = {
  username: 'spotify',
  avatarUrl: 'https://github.com/spotify.png?size=40',
}

const wrapper =
  (initialEntries = '/gh') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/:provider/:owner" exact>
            {children}
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

beforeAll(() => server.listen())

afterEach(() => {
  queryClient.clear()
  server.restoreHandlers()
})

afterAll(() => server.close())

describe('MyContextSwitcher', () => {
  function setup(noData = false) {
    const user = userEvent.setup()

    useImage.mockReturnValue({ src: 'imageUrl', isLoading: false, error: null })
    server.use(
      graphql.query('MyContexts', (req, res, ctx) => {
        if (noData) {
          return res(ctx.status(200), ctx.data({}))
        }

        const orgList = !!req.variables?.after ? org2 : org1
        const hasNextPage = req.variables?.after ? false : true
        const endCursor = req.variables?.after ? 'second' : 'first'

        const queryData = {
          me: {
            owner: {
              username: 'cool-user',
              avatarUrl: '',
            },
            myOrganizations: {
              edges: [{ node: orgList }],
              pageInfo: {
                hasNextPage,
                endCursor,
              },
            },
          },
        }

        return res(ctx.status(200), ctx.data(queryData))
      }),
      graphql.query('DetailOwner', (req, res, ctx) => {
        if (noData) {
          return res(ctx.status(200), ctx.data({}))
        }

        const queryData = {
          owner: {
            username: 'codecov',
            avatarUrl: 'some-url',
          },
        }

        return res(ctx.status(200), ctx.data(queryData))
      })
    )

    return { user }
  }

  describe('when there are no contexts (user not logged in)', () => {
    beforeEach(() => {
      setup(true)
    })

    it('renders nothing', async () => {
      const { container } = render(
        <MyContextSwitcher pageName="accountPage" />,
        {
          wrapper: wrapper(),
        }
      )

      await waitFor(() => expect(container).toBeEmptyDOMElement())
    })
  })

  describe('when the user has some contexts', () => {
    it('renders the button with the organization', async () => {
      setup()
      render(<MyContextSwitcher pageName="owner" />, {
        wrapper: wrapper('/gh/codecov'),
      })

      const button = await screen.findByRole('button', {
        name: /codecov/i,
      })
      expect(button).toBeInTheDocument()
    })
  })

  describe('user "scrolls" and fetches next page', () => {
    beforeEach(() => {
      setup()
      useIntersection.mockReturnValue({ isIntersecting: true })
    })

    it('loads second item', async () => {
      render(<MyContextSwitcher pageName="owner" />, {
        wrapper: wrapper('/gh/codecov'),
      })

      const button = await screen.findByRole('button', {
        name: /codecov/i,
      })
      expect(button).toBeInTheDocument()

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const spotify = await screen.findByText(/spotify/i)
      expect(spotify).toBeInTheDocument()
    })
  })
})
