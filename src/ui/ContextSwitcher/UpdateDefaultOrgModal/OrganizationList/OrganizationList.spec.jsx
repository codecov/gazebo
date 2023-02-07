import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import OrganizationList from './OrganizationList'

const queryClient = new QueryClient()
const server = setupServer()
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh']}>
      <Route path="/:provider">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

// const orgList = [
//   {
//     username: 'fearne-calloway',
//     avatarUrl: 'https://github.com/fearne.png?size=40',
//     defaultOrgUsername: null,
//   },
//   {
//     username: 'ira-wendagoth',
//     avatarUrl: 'https://github.com/fearne.png?size=40',
//     defaultOrgUsername: null,
//   },
// ]

// const currentUser = {
//   username: 'morrigan',
//   avatarUrl: 'https://github.com/morri.png?size=40',
//   defaultOrgUsername: null,
// }

// const contextData = {
//   me: {
//     owner: currentUser,
//     myOrganizations: {
//       edges: [{ node: orgList }],
//     },
//   },
// }

const selectedOrgUsername = 'fearne-calloway'
const setSelectedOrgUsername = jest.fn()

const defaultProps = {
  selectedOrgUsername,
  setSelectedOrgUsername,
}

xdescribe('OrganizationList', () => {
  function setup() {
    server.use(
      graphql.query('MyContexts', (req, res, ctx) =>
        res(ctx.status(200), ctx.data('aaa'))
      )
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('displays the usernames and avatars', async () => {
      render(<OrganizationList {...defaultProps} />, { wrapper })
      await new Promise((r) => setTimeout(r, 5000))

      console.log('here')
      console.log(queryClient)
      // await waitFor(() => queryClient.isFetching)
      // await waitFor(() => !queryClient.isFetching)

      const header = await screen.findByText(/Header/)
      expect(header).toBeInTheDocument()
    })
  })

  // describe('when the owner doesnt exist', () => {
  //   beforeEach(() => {
  //     setup(null)
  //   })

  //   it('doesnt render the header', () => {
  //     render(<OrganizationList />, { wrapper })
  //     expect(screen.queryByText(/Header/)).not.toBeInTheDocument()
  //   })

  //   it('doesnt renders the tabs', () => {
  //     render(<OrganizationList />, { wrapper })
  //     expect(screen.queryByText(/Tabs/)).not.toBeInTheDocument()
  //   })

  //   it('doesnt render the ListRepo', () => {
  //     render(<OrganizationList />, { wrapper })
  //     expect(screen.queryByText(/ListRepo/)).not.toBeInTheDocument()
  //   })
  // })

  // describe('when user is not part of the org', () => {
  //   beforeEach(() => {
  //     setup({
  //       username: 'codecov',
  //       isCurrentUserPartOfOrg: false,
  //     })
  //   })

  //   it('doesnt render links to the settings', () => {
  //     render(<OrganizationList />, { wrapper })
  //     expect(screen.queryByText(/Tabs/)).not.toBeInTheDocument()
  //   })
  // })
})
