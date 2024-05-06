import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { Session, useDeleteSession } from 'services/access'
import { formatTimeToNow } from 'shared/utils/dates'

import SessionsTable from './SessionsTable'

jest.mock('shared/utils/dates')
const mockedFormatTimeToNow = formatTimeToNow as jest.Mock

jest.mock('services/access')
const mockedUseDeleteSession = useDeleteSession as jest.Mock

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

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/bb/critical-role/bells-hells']}>
    <Route path="/:provider/:owner/:repo">{children}</Route>
  </MemoryRouter>
)

describe('SessionsTable', () => {
  function setup() {
    const user = userEvent.setup()
    const mutate = jest.fn()
    mockedUseDeleteSession.mockReturnValue({ mutate })
    mockedFormatTimeToNow.mockReturnValue('18 minutes ago')

    return { mutate, user }
  }

  afterEach(() => {
    jest.resetAllMocks()
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

      const data = screen.queryAllByRole('row')
      expect(data).toHaveLength(1)
    })
  })

  describe('when null sessions', () => {
    it('removes them from the sessions list prior to render', async () => {
      setup()
      render(<SessionsTable sessions={[null, ...mockSessions, null]} />, {
        wrapper,
      })

      const ipAddress = await screen.findByText('0.0.0.0')
      expect(ipAddress).toBeInTheDocument()

      const data = screen.queryAllByRole('row')
      expect(data).toHaveLength(2)
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

  describe('when revoke is clicked', () => {
    it('calls the deleteSession mutation', async () => {
      const { user, mutate } = setup()
      render(<SessionsTable sessions={mockSessions} />, { wrapper })

      const revokeButton = await screen.findByText('Revoke')
      expect(revokeButton).toBeInTheDocument()

      await user.click(revokeButton)

      expect(mutate).toHaveBeenCalledWith({
        sessionid: 0,
      })
    })
  })
})
