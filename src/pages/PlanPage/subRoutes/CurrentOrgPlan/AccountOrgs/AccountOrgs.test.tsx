import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { delay, graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils'
import { MemoryRouter, Route, useLocation } from 'react-router'

import AccountOrgs from './AccountOrgs'

import { Account } from '../queries/EnterpriseAccountDetailsQueryOpts'

const mockAccount: Account = {
  name: 'my-account',
  totalSeatCount: 10,
  activatedUserCount: 3,
  organizations: {
    totalCount: 4,
  },
}

const org1 = {
  username: 'org1',
  activatedUserCount: 7,
  isCurrentUserPartOfOrg: true,
}

const org2 = {
  username: 'org2',
  activatedUserCount: 4,
  isCurrentUserPartOfOrg: false,
}

const org3 = {
  username: 'org3',
  activatedUserCount: 2,
  isCurrentUserPartOfOrg: true,
}

const mockPageOne = {
  owner: {
    account: {
      organizations: {
        edges: [
          {
            node: org1,
          },
          {
            node: org2,
          },
        ],
        pageInfo: {
          hasNextPage: true,
          endCursor: 'asdf',
        },
      },
    },
  },
}

const mockPageTwo = {
  owner: {
    account: {
      organizations: {
        edges: [
          {
            node: org3,
          },
          {
            node: null,
          },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
        },
      },
    },
  },
}

const mockReversedOrgs = {
  owner: {
    account: {
      organizations: {
        edges: [
          {
            node: org3,
          },
          {
            node: org2,
          },
        ],
        pageInfo: {
          hasNextPage: true,
          endCursor: 'zzzz',
        },
      },
    },
  },
}

let testLocation: ReturnType<typeof useLocation>

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <MemoryRouter initialEntries={['/plan/gh/codecov']}>
      <Route path="/plan/:provider/:owner">{children}</Route>
      <Route
        path="*"
        render={({ location }) => {
          testLocation = location
          return null
        }}
      />
    </MemoryRouter>
  </QueryClientProviderV5>
)

const server = setupServer()
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('AccountOrgs', () => {
  function setup() {
    mockAllIsIntersecting(false)
    server.use(
      graphql.query('InfiniteAccountOrganizations', async (info) => {
        if (info.variables.direction === 'DESC') {
          return HttpResponse.json({
            data: mockReversedOrgs,
          })
        }
        if (info.variables.after) {
          await delay(100) // for testing the spinner
          return HttpResponse.json({
            data: mockPageTwo,
          })
        }
        return HttpResponse.json({
          data: mockPageOne,
        })
      })
    )
  }

  it('renders Header', async () => {
    setup()
    render(<AccountOrgs account={mockAccount} />, { wrapper })

    const header = await screen.findByText('Account details')
    expect(header).toBeInTheDocument()
    const description = await screen.findByText(
      /To modify your orgs and seats, please/
    )
    expect(description).toBeInTheDocument()
  })

  it('renders total orgs', async () => {
    setup()
    render(<AccountOrgs account={mockAccount} />, { wrapper })

    const label = await screen.findByText('Total organizations')
    expect(label).toBeInTheDocument()

    const number = await screen.findByText(mockAccount.organizations.totalCount)
    expect(number).toBeInTheDocument()
  })

  it('renders total seats', async () => {
    setup()
    render(<AccountOrgs account={mockAccount} />, { wrapper })

    const label = await screen.findByText('Total seats')
    expect(label).toBeInTheDocument()

    const number = await screen.findByText(mockAccount.totalSeatCount)
    expect(number).toBeInTheDocument()
  })

  it('renders seats remaining', async () => {
    setup()
    render(<AccountOrgs account={mockAccount} />, { wrapper })

    const label = await screen.findByText('Seats remaining')
    expect(label).toBeInTheDocument()

    const number = await screen.findByText(
      mockAccount.totalSeatCount - mockAccount.activatedUserCount
    )
    expect(number).toBeInTheDocument()
  })

  describe('organization list', () => {
    it('renders column headers', async () => {
      setup()
      render(<AccountOrgs account={mockAccount} />, { wrapper })

      const nameHeader = await screen.findByText('Organization name')
      expect(nameHeader).toBeInTheDocument()
      const membersHeader = await screen.findByText('Activated members')
      expect(membersHeader).toBeInTheDocument()
    })

    it('renders column data', async () => {
      setup()
      render(<AccountOrgs account={mockAccount} />, { wrapper })

      const org1 = await screen.findByText('org1')
      expect(org1).toBeInTheDocument()
      const org1Members = await screen.findByRole('cell', { name: '7' })
      expect(org1Members).toBeInTheDocument()
      const org2 = await screen.findByText('org2')
      expect(org2).toBeInTheDocument()
      const org2Members = await screen.findByRole('cell', { name: '4' })
      expect(org2Members).toBeInTheDocument()
    })

    it('renders not in org message', async () => {
      setup()
      render(<AccountOrgs account={mockAccount} />, { wrapper })

      const notInOrg = await screen.findByText('Not a member')
      expect(notInOrg).toBeInTheDocument()
    })

    describe('when another page of data is available', () => {
      describe('and bottom of table is visible', () => {
        it('fetches next page of data', async () => {
          setup()
          render(<AccountOrgs account={mockAccount} />, { wrapper })

          const org1 = await screen.findByText('org1')
          expect(org1).toBeInTheDocument()
          let org3 = screen.queryByText('org3')
          expect(org3).not.toBeInTheDocument()
          let org3Members = screen.queryByRole('cell', { name: '2' })
          expect(org3Members).not.toBeInTheDocument()

          mockAllIsIntersecting(true)

          org3 = await screen.findByText('org3')
          expect(org3).toBeInTheDocument()
          org3Members = await screen.findByRole('cell', { name: '2' })
          expect(org3Members).toBeInTheDocument()
        })
      })
    })

    describe('when user clicks on the Org name header', () => {
      it('changes the ordering direction', async () => {
        setup()
        render(<AccountOrgs account={mockAccount} />, { wrapper })
        const user = userEvent.setup()

        const header = await screen.findByText('Organization name')
        expect(header).toBeInTheDocument()

        let org1: HTMLElement | null = await screen.findByText('org1')
        expect(org1).toBeInTheDocument()

        await user.click(header)

        const org3 = await screen.findByText('org3')
        expect(org3).toBeInTheDocument()
        org1 = screen.queryByText('org1')
        expect(org1).not.toBeInTheDocument()
      })
    })

    describe('when user clicks on activated user count', () => {
      describe('and they are a member of that org', () => {
        it('redirects them to the member page for that org', async () => {
          setup()
          const user = userEvent.setup()
          render(<AccountOrgs account={mockAccount} />, { wrapper })

          const org1Members = await screen.findByRole('link', { name: '7' })
          expect(org1Members).toBeInTheDocument()

          await user.click(org1Members)

          await waitFor(() =>
            expect(testLocation.pathname).toBe('/members/gh/org1')
          )
        })
      })

      describe('and they are not a member of that org', () => {
        it('does nothing', async () => {
          setup()
          const user = userEvent.setup()
          render(<AccountOrgs account={mockAccount} />, { wrapper })

          const org2Members = await screen.findByRole('cell', { name: '4' })
          expect(org2Members).toBeInTheDocument()

          await user.click(org2Members)

          await waitFor(() =>
            expect(testLocation.pathname).toBe('/plan/gh/codecov')
          )
        })
      })
    })
  })
})
