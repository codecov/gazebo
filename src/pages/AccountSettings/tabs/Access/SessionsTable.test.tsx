import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { type Mock } from 'vitest'

import { Session } from 'services/access'
import { formatTimeToNow } from 'shared/utils/dates'

import SessionsTable from './SessionsTable'

vi.mock('shared/utils/dates')
const mockedFormatTimeToNow = formatTimeToNow as Mock

window.confirm = () => true

const mockSessions: Session[] = [
  {
    sessionid: 0,
    ip: '0.0.0.0',
    lastseen: '2024-04-06T14:29:40.551485+00:00',
    useragent: 'testing',
    type: 'login',
    name: null,
    lastFour: '1234',
  },
]

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
})
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/bb/critical-role/bells-hells']}>
      <Route path="/:provider/:owner/:repo">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('SessionsTable', () => {
  function setup() {
    const user = userEvent.setup()
    mockedFormatTimeToNow.mockReturnValue('18 minutes ago')
    const mutation = vi.fn()
    server.use(
      graphql.mutation('DeleteSession', async (info) => {
        mutation(info.variables.input)

        return HttpResponse.json({ data: { owner: null } })
      })
    )
    return { mutation, user }
  }

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('when rendering SessionsTable', () => {
    describe('renders column headers', () => {
      it('renders IP header', async () => {
        setup()
        render(<SessionsTable sessions={mockSessions} />, { wrapper })

        const ipHeader = await screen.findByText('IP')
        expect(ipHeader).toBeInTheDocument()
      })

      it('renders last seen header', async () => {
        setup()
        render(<SessionsTable sessions={mockSessions} />, { wrapper })

        const lastSeenHeader = await screen.findByText('Last seen')
        expect(lastSeenHeader).toBeInTheDocument()
      })

      it('renders user agent header', async () => {
        setup()
        render(<SessionsTable sessions={mockSessions} />, { wrapper })

        const userAgentHeader = await screen.findByText('User agent')
        expect(userAgentHeader).toBeInTheDocument()
      })
    })

    describe('renders column data', () => {
      it('renders IP address', async () => {
        setup()
        render(<SessionsTable sessions={mockSessions} />, { wrapper })

        const ipAddress = await screen.findByText('0.0.0.0')
        expect(ipAddress).toBeInTheDocument()
      })

      it('renders relative last seen time', async () => {
        setup()
        render(<SessionsTable sessions={mockSessions} />, { wrapper })

        const lastSeen = await screen.findByText('18 minutes ago')
        expect(lastSeen).toBeInTheDocument()
      })

      it('renders user agent', async () => {
        setup()
        render(<SessionsTable sessions={mockSessions} />, { wrapper })

        const userAgent = await screen.findByText('0.0.0.0')
        expect(userAgent).toBeInTheDocument()
      })

      it('renders revoke button', async () => {
        setup()
        render(<SessionsTable sessions={mockSessions} />, { wrapper })

        const revokeButton = await screen.findByText('0.0.0.0')
        expect(revokeButton).toBeInTheDocument()
      })
    })
  })

  describe('when no sessions', () => {
    it('renders headers but no data', async () => {
      setup()
      render(<SessionsTable sessions={[]} />, { wrapper })

      const ipHeader = await screen.findByText('IP')
      expect(ipHeader).toBeInTheDocument()

      const rows = screen.queryAllByRole('row')
      expect(rows).toHaveLength(1)
    })
  })

  describe('when sessions is undefined', () => {
    it('renders headers but no data', async () => {
      setup()
      render(<SessionsTable sessions={undefined} />, { wrapper })

      const ipHeader = await screen.findByText('IP')
      expect(ipHeader).toBeInTheDocument()

      const rows = screen.queryAllByRole('row')
      expect(rows).toHaveLength(1)
    })
  })

  describe('when there are null sessions', () => {
    it('removes them from the sessions list prior to render', async () => {
      setup()
      render(<SessionsTable sessions={[null, ...mockSessions, null]} />, {
        wrapper,
      })

      const ipAddress = await screen.findByText('0.0.0.0')
      expect(ipAddress).toBeInTheDocument()

      const rows = screen.queryAllByRole('row')
      expect(rows).toHaveLength(2)
    })
  })

  describe('when lastseen is null', () => {
    it('renders a dash', async () => {
      setup()
      render(
        <SessionsTable
          sessions={[
            {
              sessionid: 0,
              ip: '0.0.0.0',
              lastseen: null,
              useragent: 'testing',
              type: 'login',
              name: null,
              lastFour: '1234',
            },
          ]}
        />,
        { wrapper }
      )

      const dash = await screen.findByText('-')
      expect(dash).toBeInTheDocument()
    })
  })

  describe('when useragent is null', () => {
    it('renders a dash', async () => {
      setup()
      render(
        <SessionsTable
          sessions={[
            {
              sessionid: 0,
              ip: '0.0.0.0',
              lastseen: '2024-04-06T14:29:40.551485+00:00',
              useragent: null,
              type: 'login',
              name: null,
              lastFour: '1234',
            },
          ]}
        />,
        { wrapper }
      )

      const dash = await screen.findByText('-')
      expect(dash).toBeInTheDocument()
    })
  })

  describe('when revoke is clicked', () => {
    it('calls the deleteSession mutation', async () => {
      const { mutation, user } = setup()
      render(<SessionsTable sessions={mockSessions} />, { wrapper })

      const revokeButton = await screen.findByText('Revoke')
      expect(revokeButton).toBeInTheDocument()

      await user.click(revokeButton)

      await waitFor(() =>
        expect(mutation).toHaveBeenCalledWith({ sessionid: 0 })
      )
    })
  })
})
