import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { subDays } from 'date-fns'

import TokensTable from './TokensTable'

const onTokenRevoke = jest.fn(() => true)

const data = {
  tokens: [
    {
      sessionid: 32,
      ip: null,
      lastseen: subDays(new Date(), 3).toISOString(),
      useragent: null,
      owner: 2,
      type: 'api',
      name: 'token name 1',
      lastFour: 'aaaa',
    },
    {
      sessionid: 6,
      ip: null,
      lastseen: subDays(new Date(), 1).toISOString(),
      useragent: null,
      owner: 2,
      type: 'api',
      name: 'token name 2',
      lastFour: 'bbbb',
    },
    {
      sessionid: 8,
      ip: null,
      lastseen: null,
      useragent: null,
      owner: 2,
      type: 'api',
      name: 'token name 3',
      lastFour: 'cccc',
    },
  ],
}

describe('TokensTable', () => {
  const defaultProps = {
    provider: 'gh',
    owner: 'codecov',
    onRevoke: onTokenRevoke,
  }
  function setup(props) {
    const _props = { ...defaultProps, ...props }
    render(<TokensTable {..._props} />)
  }

  describe('when rendering TokensTable', () => {
    beforeEach(() => {
      setup(data)
    })

    describe('renders tokens table', () => {
      it('renders tokens table revoke button', () => {
        const buttons = screen.getAllByText(/Revoke/)
        expect(buttons.length).toBe(3)
      })
      it('renders tokens table name', () => {
        const name1 = screen.getByText(/token name 1/)
        expect(name1).toBeInTheDocument()
        const name2 = screen.getByText(/token name 2/)
        expect(name2).toBeInTheDocument()
      })
      it('renders tokens table lastseen', () => {
        const lastseen1 = screen.getByText(/3 days/)
        const lastseen2 = screen.getByText(/1 day/)

        expect(lastseen1).toBeInTheDocument()
        expect(lastseen2).toBeInTheDocument()
      })
      it('renders tokens table ips', () => {
        const lastFour1 = screen.getByText(/xxxx aaaa/)
        const lastFour2 = screen.getByText(/xxxx bbbb/)
        expect(lastFour1).toBeInTheDocument()
        expect(lastFour2).toBeInTheDocument()
      })
    })

    describe('when revoking tokens', () => {
      beforeEach(() => {
        setup(data)
      })

      describe('renders triggers a revoke event', () => {
        it('triggers revoke on click', () => {
          userEvent.click(screen.getAllByText(/Revoke/)[0])
          expect(onTokenRevoke).toBeCalled()
          expect(onTokenRevoke).toBeCalledWith(32)
        })
      })
    })

    describe('render empty table', () => {
      beforeEach(() => {
        setup({ tokens: [] })
      })

      describe('renders triggers a revoke event', () => {
        it('triggers revoke on click', () => {
          userEvent.click(screen.getByText(/No tokens created yet/))
          expect(screen.getByText(/No tokens created yet/)).toBeInTheDocument()
        })
      })
    })
  })
})
