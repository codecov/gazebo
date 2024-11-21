import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { type Mock } from 'vitest'

import { useImage } from 'services/image'

import MyContextSwitcher from './MyContextSwitcher'

vi.mock('services/image')
const mockedUseImage = useImage as Mock

const mocks = vi.hoisted(() => ({
  useIntersection: vi.fn(),
}))

vi.mock('react-use', async () => {
  const original = await vi.importActual('react-use')

  return {
    ...original,
    useIntersection: mocks.useIntersection,
  }
})

const org1 = {
  username: 'codecov',
  avatarUrl: 'https://github.com/codecov.png?size=40',
}

const org2 = {
  username: 'spotify',
  avatarUrl: 'https://github.com/spotify.png?size=40',
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: (initialEntries?: string) => React.FC<React.PropsWithChildren> =
  (initialEntries = '/gh') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider/:owner" exact>
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

describe('MyContextSwitcher', () => {
  function setup(noData = false) {
    const user = userEvent.setup()

    mockedUseImage.mockReturnValue({
      src: 'imageUrl',
      isLoading: false,
      error: null,
    })
    server.use(
      graphql.query('MyContexts', (info) => {
        if (noData) {
          return HttpResponse.json({ data: { me: null } })
        }

        const orgList = info.variables?.after ? org2 : org1
        const hasNextPage = info.variables?.after ? false : true
        const endCursor = info.variables?.after ? 'second' : 'first'

        const queryData = {
          me: {
            owner: {
              username: 'cool-user',
              avatarUrl: 'http://127.0.0.1/avatar-url',
              defaultOrgUsername: null,
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

        return HttpResponse.json({ data: queryData })
      }),
      graphql.query('DetailOwner', (info) => {
        if (noData) {
          return HttpResponse.json({ data: { me: null } })
        }

        const queryData = {
          owner: {
            username: 'codecov',
            avatarUrl: 'http://127.0.0.1/avatar-url',
          },
        }
        return HttpResponse.json({ data: queryData })
      })
    )

    return { user }
  }

  describe('when there are no contexts (user not logged in)', () => {
    it('renders nothing', async () => {
      setup(true)
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
    it('loads second item', async () => {
      setup()
      mocks.useIntersection.mockReturnValue({ isIntersecting: true })
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
