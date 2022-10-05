import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { subDays } from 'date-fns'
import { MemoryRouter, Route } from 'react-router-dom'

import { useDeleteSession } from 'services/access'

import SessionsTable from './SessionsTable'

jest.mock('services/access')
window.confirm = () => true

describe('SessionsTable', () => {
  let mutate = jest.fn()
  const defaultProps = {
    provider: 'gh',
    owner: 'codecov',
  }
  function setup(props) {
    const data = {
      sessions: [
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
      ],
    }

    useDeleteSession.mockReturnValue({ mutate })

    const _props = { ...defaultProps, ...props, ...data }
    render(
      <MemoryRouter initialEntries={['/bb/critical-role/bells-hells']}>
        <Route path="/:provider/:owner/:repo">
          <SessionsTable {..._props} />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendering SessionsTable', () => {
    beforeEach(() => {
      setup()
    })

    describe('renders sessions table', () => {
      it('renders sessions table revoke button', () => {
        const buttons = screen.getAllByText(/Revoke/)
        expect(buttons.length).toBe(3)
      })
      it('renders sessions table user agent', () => {
        const useragent1 = screen.getByText(/Macintosh/)
        expect(useragent1).toBeInTheDocument()
        const useragent2 = screen.getByText(/Windows/)
        expect(useragent2).toBeInTheDocument()
      })
      it('renders sessions table lastseen', () => {
        const lastseen1 = screen.getByText(/3 days/)
        const lastseen2 = screen.getByText(/1 day/)

        expect(lastseen1).toBeInTheDocument()
        expect(lastseen2).toBeInTheDocument()
      })
      it('renders sessions table ips', () => {
        const ip_1 = screen.getByText(/172.21.0.1/)
        const ip_2 = screen.getByText(/172.23.0.2/)
        expect(ip_1).toBeInTheDocument()
        expect(ip_2).toBeInTheDocument()
      })
    })
  })

  describe('when revoking sessions', () => {
    beforeEach(() => {
      setup({})
    })

    describe('renders triggers a revoke event', () => {
      it('triggers revoke on click', () => {
        userEvent.click(screen.getAllByText(/Revoke/)[0])
        expect(mutate).toBeCalled()
        expect(mutate).toBeCalledWith({ sessionid: 32 })
      })
    })
  })
})
