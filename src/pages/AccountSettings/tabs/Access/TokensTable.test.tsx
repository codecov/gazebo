import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'
import { type Mock } from 'vitest'

import { useRevokeUserToken } from 'services/access/useRevokeUserToken'

import TokensTable from './TokensTable'

vi.mock('services/access/useRevokeUserToken')
const mockedUseRevokeUserToken = useRevokeUserToken as Mock

window.confirm = () => true

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/bb/critical-role/bells-hells']}>
    <Route path="/:provider/:owner/:repo">{children}</Route>
  </MemoryRouter>
)

describe('TokensTable', () => {
  function setup() {
    const user = userEvent.setup()
    const mutate = vi.fn()
    mockedUseRevokeUserToken.mockReturnValue({ mutate })

    return { mutate, user }
  }

  afterEach(() => {
    vi.clearAllMocks()
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
                id: '32',
                type: 'api',
                name: 'token name 1',
                lastFour: 'aaaa',
              },
              {
                id: '6',
                type: 'api',
                name: 'token name 2',
                lastFour: 'bbbb',
              },
              {
                id: '8',
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
                id: '32',
                type: 'api',
                name: 'token name 1',
                lastFour: 'aaaa',
              },
              {
                id: '6',
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

      it('renders token last four digits', () => {
        render(
          <TokensTable
            tokens={[
              {
                id: '32',
                type: 'api',
                name: 'token name 1',
                lastFour: 'aaaa',
              },
              {
                id: '6',
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
        const { mutate, user } = setup()

        render(
          <TokensTable
            tokens={[
              {
                id: '32',
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

        const button = screen.getAllByText(/Revoke/)[0]

        if (button) {
          await user.click(button)
        }

        expect(mutate).toHaveBeenCalled()
        expect(mutate).toHaveBeenCalledWith({ tokenid: '32' })
      })
    })

    describe('when no tokens', () => {
      it('renders empty status', async () => {
        const { user } = setup()
        render(<TokensTable tokens={[]} />, {
          wrapper,
        })

        await user.click(screen.getByText(/No tokens created yet/))
        expect(screen.getByText(/No tokens created yet/)).toBeInTheDocument()
      })
    })

    describe('when tokens is undefined', () => {
      it('renders empty status', async () => {
        const { user } = setup()
        render(<TokensTable tokens={undefined} />, {
          wrapper,
        })

        await user.click(screen.getByText(/No tokens created yet/))
        expect(screen.getByText(/No tokens created yet/)).toBeInTheDocument()
      })
    })

    describe('when there are null sessions', () => {
      it('removes them prior to render', async () => {
        setup()
        render(
          <TokensTable
            tokens={[
              null,
              {
                id: '32',
                type: 'api',
                name: 'token name 1',
                lastFour: 'aaaa',
              },
              null,
            ]}
          />,
          {
            wrapper,
          }
        )

        const rows = screen.queryAllByRole('row')
        expect(rows).toHaveLength(2)
      })
    })
  })
})
