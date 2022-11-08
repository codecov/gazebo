import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRevokeUserToken } from 'services/access'

import TokensTable from './TokensTable'

jest.mock('services/access')
window.confirm = () => true

const data = {
  tokens: [
    {
      id: 32,
      type: 'api',
      name: 'token name 1',
      lastFour: 'aaaa',
    },
    {
      id: 6,
      type: 'api',
      name: 'token name 2',
      lastFour: 'bbbb',
    },
    {
      id: 8,
      type: 'api',
      name: 'token name 3',
      lastFour: 'cccc',
    },
  ],
}

const defaultProps = {
  provider: 'gh',
  owner: 'codecov',
}

describe('TokensTable', () => {
  let mutate = jest.fn()
  function setup(props) {
    useRevokeUserToken.mockReturnValue({ mutate })

    const _props = { ...defaultProps, ...props }
    render(
      <MemoryRouter initialEntries={['/bb/critical-role/bells-hells']}>
        <Route path="/:provider/:owner/:repo">
          <TokensTable {..._props} />
        </Route>
      </MemoryRouter>
    )
  }

  afterEach(() => {
    jest.resetAllMocks()
  })

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

      it('triggers revoke on click', () => {
        userEvent.click(screen.getAllByText(/Revoke/)[0])
        expect(mutate).toBeCalled()
        expect(mutate).toBeCalledWith({ tokenid: 32 })
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
