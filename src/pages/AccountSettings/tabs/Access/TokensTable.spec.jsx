import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRevokeUserToken } from 'services/access'

import TokensTable from './TokensTable'

jest.mock('services/access')
window.confirm = () => true

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/bb/critical-role/bells-hells']}>
    <Route path="/:provider/:owner/:repo">{children}</Route>
  </MemoryRouter>
)

describe('TokensTable', () => {
  function setup() {
    const mutate = jest.fn()
    useRevokeUserToken.mockReturnValue({ mutate })

    return { mutate }
  }

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when rendering TokensTable', () => {
    describe('renders tokens table', () => {
      beforeEach(() => {
        setup()
      })
      it('renders tokens table revoke button', () => {
        render(
          <TokensTable
            tokens={[
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
            ]}
          />,
          {
            wrapper,
          }
        )

        const buttons = screen.getAllByText(/Revoke/)
        expect(buttons.length).toBe(3)
      })

      it('renders tokens table name', () => {
        render(
          <TokensTable
            tokens={[
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
            ]}
          />,
          {
            wrapper,
          }
        )

        const name1 = screen.getByText(/token name 1/)
        expect(name1).toBeInTheDocument()
        const name2 = screen.getByText(/token name 2/)
        expect(name2).toBeInTheDocument()
      })

      it('renders tokens table ips', () => {
        render(
          <TokensTable
            tokens={[
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
            ]}
          />,
          {
            wrapper,
          }
        )

        const lastFour1 = screen.getByText(/xxxx aaaa/)
        const lastFour2 = screen.getByText(/xxxx bbbb/)
        expect(lastFour1).toBeInTheDocument()
        expect(lastFour2).toBeInTheDocument()
      })
    })

    describe('when revoking tokens', () => {
      it('triggers revoke on click', async () => {
        const { mutate } = setup()

        render(
          <TokensTable
            tokens={[
              {
                id: 32,
                type: 'api',
                name: 'token name 1',
                lastFour: 'aaaa',
              },
            ]}
          />,
          {
            wrapper,
          }
        )

        const user = userEvent.setup()
        await user.click(screen.getAllByText(/Revoke/)[0])

        expect(mutate).toBeCalled()
        expect(mutate).toBeCalledWith({ tokenid: 32 })
      })
    })

    describe('render empty table', () => {
      beforeEach(() => {
        setup()
      })

      describe('renders triggers a revoke event', () => {
        it('triggers revoke on click', () => {
          render(<TokensTable tokens={[]} />, {
            wrapper,
          })

          userEvent.click(screen.getByText(/No tokens created yet/))
          expect(screen.getByText(/No tokens created yet/)).toBeInTheDocument()
        })
      })
    })
  })
})
