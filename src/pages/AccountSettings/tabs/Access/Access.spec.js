import Access from './Access'
import { render, screen } from '@testing-library/react'
import { useSessions } from 'services/access'

jest.mock('services/access')

describe('AccessTab', () => {
  const defaultProps = {
    provider: 'gh',
    owner: 'codecov',
  }

  function setup(props) {
    useSessions.mockReturnValue({
      data: {
        sessions: [
          {
            sessionid: 32,
            ip: '172.21.0.1',
            lastseen: '2021-04-19T18:35:05.451136Z',
            useragent: null,
            owner: 2,
            type: 'login',
            name: null,
          },
          {
            sessionid: 6,
            ip: '172.23.0.2',
            lastseen: '2020-07-29T18:36:06.443999Z',
            useragent:
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36',
            owner: 2,
            type: 'login',
            name: null,
          },
        ],
      },
    })
    const _props = { ...defaultProps, ...props }
    render(<Access {..._props} />)
  }

  describe('when rendering on base url', () => {
    beforeEach(() => {
      setup()
    })

    describe('renders elements', () => {
      it('renders title', () => {
        const title = screen.getByText(/API Tokens/)
        expect(title).toBeInTheDocument()
      })
      it('renders button', () => {
        const button = screen.getByText(/Generate Token/)
        expect(button).toBeInTheDocument()
      })
      it('renders sessions title', () => {
        const sessionsTitle = screen.getByText(/Login Sessions/)
        expect(sessionsTitle).toBeInTheDocument()
      })
      it('renders tokens summary', () => {
        expect(screen.getByTestId('tokens-summary')).toBeInTheDocument()
      })
      it('renders tokens docs link', () => {
        expect(screen.getByTestId('tokens-docs-link')).toBeInTheDocument()
      })
      it('renders no tokens message', () => {
        const sessionsTitle = screen.getByText(/No tokens created yet/)
        expect(sessionsTitle).toBeInTheDocument()
      })
    })

    describe('renders sessions table', () => {
      it('renders sessions table revoke button', () => {
        const buttons = screen.getAllByText(/Revoke/)
        expect(buttons.length).toBe(2)
      })
      it('renders sessions table user agent', () => {
        const useragents = screen.getAllByTestId('sessions-useragent')
        expect(useragents.length).toBe(2)
      })
      it('renders sessions table lastseen', () => {
        const lastseens = screen.getAllByTestId('sessions-lastseen')
        expect(lastseens.length).toBe(2)
      })
      it('renders sessions table ips', () => {
        const ip_1 = screen.getByText(/172.21.0.1/)
        const ip_2 = screen.getByText(/172.23.0.2/)
        expect(ip_1).toBeInTheDocument()
        expect(ip_2).toBeInTheDocument()
      })
    })
  })
})
