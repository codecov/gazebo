import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
  mockAllIsIntersecting,
  mockIsIntersecting,
} from 'react-intersection-observer/test-utils'
import { MemoryRouter, Route } from 'react-router-dom'

import AdminAccessTable from './AdminAccessTable'

const mockFirstResponse = {
  count: 1,
  next: 'http://localhost/internal/users?is_admin=true&page=2',
  previous: null,
  results: [
    {
      ownerid: 1,
      username: 'user1-codecov',
      email: 'user1@codecov.io',
      name: 'User 1',
      isAdmin: true,
      activated: true,
    },
  ],
  total_pages: 2,
}

const mockSecondResponse = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      ownerid: 2,
      username: 'user2-codecov',
      email: 'user2@codecov.io',
      name: null,
      isAdmin: true,
      activated: true,
    },
    {
      ownerid: 3,
      username: null,
      email: null,
      name: null,
      isAdmin: true,
      activated: true,
    },
  ],
  total_pages: 2,
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      suspense: false,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh']}>
      <Route path="/:provider">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('AdminAccessTable', () => {
  function setup() {
    server.use(
      http.get('/internal/users', (info) => {
        const searchParams = new URL(info.request.url).searchParams
        const pageNumber = Number(searchParams.get('page'))

        if (pageNumber > 1) {
          return HttpResponse.json(mockSecondResponse)
        }

        return HttpResponse.json(mockFirstResponse)
      })
    )
    mockAllIsIntersecting(false)
  }

  describe('renders headers', () => {
    it('displays the Admin heading', async () => {
      setup()
      render(<AdminAccessTable />, { wrapper })

      const admin = await screen.findByText('Admin')
      expect(admin).toBeInTheDocument()
    })

    it('displays the Email heading', async () => {
      setup()
      render(<AdminAccessTable />, { wrapper })

      const email = await screen.findByText('Email')
      expect(email).toBeInTheDocument()
    })
  })

  describe('renders data', () => {
    it('displays admin name', async () => {
      setup()
      render(<AdminAccessTable />, { wrapper })

      const name = await screen.findByText('User 1')
      expect(name).toBeInTheDocument()
    })

    it('displays admin username when name not available', async () => {
      setup()
      render(<AdminAccessTable />, { wrapper })

      const loading = await screen.findByText('Loading')
      mockIsIntersecting(loading, true)

      const username = await screen.findByText('user2-codecov')
      expect(username).toBeInTheDocument()
    })

    it('displays admin ownerid when name and username not available', async () => {
      setup()
      // This really should never happen, but it's better than showing nothing.
      render(<AdminAccessTable />, { wrapper })

      const loading = await screen.findByText('Loading')
      mockIsIntersecting(loading, true)

      const ownerid = await screen.findByText('3')
      expect(ownerid).toBeInTheDocument()
    })

    it('displays admin email', async () => {
      setup()
      render(<AdminAccessTable />, { wrapper })

      const email = await screen.findByText('user1@codecov.io')
      expect(email).toBeInTheDocument()
    })
  })

  describe('handles pagination', () => {
    it('should fetch only the first page', async () => {
      setup()
      render(<AdminAccessTable />, { wrapper })

      const user1 = await screen.findByText('User 1')
      expect(user1).toBeInTheDocument()

      const user2 = screen.queryByText('user2-codecov')
      expect(user2).not.toBeInTheDocument()
    })

    it('should fetch the second page once the bottom of table is visible', async () => {
      setup()
      render(<AdminAccessTable />, { wrapper })

      const user1 = await screen.findByText('User 1')
      expect(user1).toBeInTheDocument()

      let user2 = screen.queryByText('user2-codecov')
      expect(user2).not.toBeInTheDocument()

      const loading = await screen.findByText('Loading')
      mockIsIntersecting(loading, true)

      user2 = await screen.findByText('user2-codecov')
      expect(user2).toBeInTheDocument()
    })
  })
})
