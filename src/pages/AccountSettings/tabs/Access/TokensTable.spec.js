import { render, screen } from '@testing-library/react'
import { subDays } from 'date-fns'
import TokensTable from './TokensTable'

describe('TokensTable', () => {
  const defaultProps = {
    provider: 'gh',
    owner: 'codecov',
  }
  function setup(props) {
    const data = {
      tokens: [
        {
          sessionid: 32,
          ip: null,
          lastseen: subDays(new Date(), 3),
          useragent: null,
          owner: 2,
          type: 'api',
          name: 'token name 1',
          lastFour: 'aaaa',
        },
        {
          sessionid: 6,
          ip: null,
          lastseen: subDays(new Date(), 1),
          useragent: null,
          owner: 2,
          type: 'api',
          name: 'token name 2',
          lastFour: 'bbbb',
        },
      ],
    }

    const _props = { ...defaultProps, ...props, ...data }
    render(<TokensTable {..._props} />)
  }

  describe('when rendering on base url', () => {
    beforeEach(() => {
      setup()
    })

    describe('renders tokens table', () => {
      it('renders tokens table revoke button', () => {
        const buttons = screen.getAllByText(/Revoke/)
        expect(buttons.length).toBe(2)
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
  })
})
