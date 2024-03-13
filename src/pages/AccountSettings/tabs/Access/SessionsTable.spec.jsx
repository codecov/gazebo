import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { subDays } from 'date-fns'
import { MemoryRouter, Route } from 'react-router-dom'

import { useDeleteSession } from 'services/access'

import SessionsTable from './SessionsTable'

jest.mock('services/access')
window.confirm = () => true

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/bb/critical-role/bells-hells']}>
    <Route path="/:provider/:owner/:repo">{children}</Route>
  </MemoryRouter>
)

describe('SessionsTable', () => {
  function setup() {
    const user = userEvent.setup()
    const mutate = jest.fn()

    useDeleteSession.mockReturnValue({ mutate })

    return { mutate, user }
  }

  describe('when rendering SessionsTable', () => {
    describe('renders sessions table', () => {
      beforeEach(() => setup())
      it('renders sessions table revoke button', () => {
        render(
          <SessionsTable
            provider="gh"
            owner="codecov"
            sessions={[
              {
                sessionid: 32,
                ip: '172.21.0.1',
                lastseen: subDays(new Date(), 3).toISOString(),
                useragent: 'Chrome/5.0 (Windows; Intel 10)',
                owner: 2,
                type: 'login',
                name: null,
              },
              {
                sessionid: 6,
                ip: '172.23.0.2',
                lastseen: subDays(new Date(), 1).toISOString(),
                useragent:
                  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36',
                owner: 2,
                type: 'login',
                name: null,
              },
              {
                sessionid: 8,
                ip: '172.23.0.3',
                lastseen: null,
                useragent: null,
                owner: 2,
                type: 'login',
                name: null,
              },
            ]}
          />,
          { wrapper }
        )

        const buttons = screen.getAllByText(/Revoke/)
        expect(buttons.length).toBe(3)
      })
      it('renders sessions table user agent', () => {
        render(
          <SessionsTable
            provider="gh"
            owner="codecov"
            sessions={[
              {
                sessionid: 32,
                ip: '172.21.0.1',
                lastseen: subDays(new Date(), 3).toISOString(),
                useragent: 'Chrome/5.0 (Windows; Intel 10)',
                owner: 2,
                type: 'login',
                name: null,
              },
              {
                sessionid: 6,
                ip: '172.23.0.2',
                lastseen: subDays(new Date(), 1).toISOString(),
                useragent:
                  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36',
                owner: 2,
                type: 'login',
                name: null,
              },
            ]}
          />,
          { wrapper }
        )

        const useragent1 = screen.getByText(/Macintosh/)
        expect(useragent1).toBeInTheDocument()
        const useragent2 = screen.getByText(/Windows/)
        expect(useragent2).toBeInTheDocument()
      })
      it('renders sessions table lastSeen', () => {
        render(
          <SessionsTable
            provider="gh"
            owner="codecov"
            sessions={[
              {
                sessionid: 32,
                ip: '172.21.0.1',
                lastseen: subDays(new Date(), 3).toISOString(),
                useragent: 'Chrome/5.0 (Windows; Intel 10)',
                owner: 2,
                type: 'login',
                name: null,
              },
              {
                sessionid: 6,
                ip: '172.23.0.2',
                lastseen: subDays(new Date(), 1).toISOString(),
                useragent:
                  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36',
                owner: 2,
                type: 'login',
                name: null,
              },
            ]}
          />,
          { wrapper }
        )

        const lastSeen1 = screen.getByText(/3 days/)
        const lastSeen2 = screen.getByText(/1 day/)

        expect(lastSeen1).toBeInTheDocument()
        expect(lastSeen2).toBeInTheDocument()
      })
      it('renders sessions table ips', () => {
        render(
          <SessionsTable
            provider="gh"
            owner="codecov"
            sessions={[
              {
                sessionid: 32,
                ip: '172.21.0.1',
                lastseen: subDays(new Date(), 3).toISOString(),
                useragent: 'Chrome/5.0 (Windows; Intel 10)',
                owner: 2,
                type: 'login',
                name: null,
              },
              {
                sessionid: 6,
                ip: '172.23.0.2',
                lastseen: subDays(new Date(), 1).toISOString(),
                useragent:
                  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36',
                owner: 2,
                type: 'login',
                name: null,
              },
            ]}
          />,
          { wrapper }
        )

        const ip1 = screen.getByText(/172.21.0.1/)
        const ip2 = screen.getByText(/172.23.0.2/)
        expect(ip1).toBeInTheDocument()
        expect(ip2).toBeInTheDocument()
      })
    })
  })

  describe('when revoking sessions', () => {
    describe('renders triggers a revoke event', () => {
      it('triggers revoke on click', async () => {
        const { mutate, user } = setup()
        render(
          <SessionsTable
            provider="gh"
            owner="codecov"
            sessions={[
              {
                sessionid: 32,
                ip: '172.21.0.1',
                lastseen: subDays(new Date(), 3).toISOString(),
                useragent: 'Chrome/5.0 (Windows; Intel 10)',
                owner: 2,
                type: 'login',
                name: null,
              },
            ]}
          />,
          { wrapper }
        )

        await user.click(screen.getAllByText(/Revoke/)[0])
        expect(mutate).toHaveBeenCalled()
        expect(mutate).toHaveBeenCalledWith({ sessionid: 32 })
      })
    })
  })
})
