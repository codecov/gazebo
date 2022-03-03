import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { subDays } from 'date-fns'

import SessionsTable from './SessionsTable'

const onRevoke = jest.fn(() => true)

describe('SessionsTable', () => {
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
          lastseen: subDays(new Date(), 3),
          useragent: 'Chrome/5.0 (Windows; Intel 10)',
          owner: 2,
          type: 'login',
          name: null,
        },
        {
          sessionid: 6,
          ip: '172.23.0.2',
          lastseen: subDays(new Date(), 1),
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

    const _props = { ...defaultProps, ...props, ...data }
    render(<SessionsTable {..._props} />)
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
      setup({ onRevoke: onRevoke })
    })

    describe('renders triggers a revoke event', () => {
      it('triggers revoke on click', () => {
        userEvent.click(screen.getAllByText(/Revoke/)[0])
        expect(onRevoke).toBeCalled()
        expect(onRevoke).toBeCalledWith(32)
      })
    })
  })
})
