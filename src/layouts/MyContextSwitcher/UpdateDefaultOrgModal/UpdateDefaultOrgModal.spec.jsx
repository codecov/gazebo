import { render, screen, waitFor } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import UpdateDefaultOrgModal from './UpdateDefaultOrgModal'

jest.mock('ui/Avatar', () => () => 'Avatar')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
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
  console.error = () => {}
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

const orgList = [
  {
    username: 'fearne-calloway',
    avatarUrl: 'https://github.com/fearne.png?size=40',
    defaultOrgUsername: null,
  },
]

const currentUser = {
  username: 'morrigan',
  avatarUrl: 'https://github.com/morri.png?size=40',
  defaultOrgUsername: null,
}

const contextData = {
  me: {
    owner: currentUser,
    myOrganizations: {
      edges: [{ node: orgList[0] }],
    },
  },
}

describe('UpdateDefaultOrgModal', () => {
  function setup() {
    server.use(
      graphql.mutation('updateDefaultOrganization', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({}))
      ),
      graphql.query('MyContexts', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(contextData))
      )
    )

    return { user: userEvent.setup() }
  }

  describe('when the modal is shown', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the organization list', async () => {
      render(<UpdateDefaultOrgModal isOpen={true} closeModal={jest.fn()} />, {
        wrapper,
      })
      const fearneUsername = await screen.findByText(/fearne-calloway/)
      expect(fearneUsername).toBeInTheDocument()

      const morriUsername = await screen.findByText(/morri/)
      expect(morriUsername).toBeInTheDocument()
    })

    it('renders update and cancel buttons', async () => {
      render(<UpdateDefaultOrgModal isOpen={true} closeModal={jest.fn()} />, {
        wrapper,
      })
      const updateButton = await screen.findByText(/Update/)
      expect(updateButton).toBeInTheDocument()
      const cancelButton = await screen.findByText(/Cancel/)
      expect(cancelButton).toBeInTheDocument()
    })

    it('renders appropriate labels', async () => {
      render(<UpdateDefaultOrgModal isOpen={true} closeModal={jest.fn()} />, {
        wrapper,
      })
      const title = await screen.findByText(/Select default organization/)
      expect(title).toBeInTheDocument()
      const subTitle = await screen.findByText(
        /Org will appear as default for landing page context/
      )
      expect(subTitle).toBeInTheDocument()
    })
  })

  describe('when clicking update button', () => {
    it('selects a default organization', async () => {
      const { user } = setup()
      const closeModal = jest.fn()
      render(<UpdateDefaultOrgModal isOpen={true} closeModal={closeModal} />, {
        wrapper,
      })
      const updateButton = await screen.findByRole('button', { name: 'Update' })
      expect(updateButton).toHaveClass('disabled:cursor-not-allowed')

      // Select org
      const fearneUsername = await screen.findByRole('button', {
        name: /fearne-calloway/,
      })
      expect(fearneUsername).toBeInTheDocument()
      await user.click(fearneUsername)

      // Update org
      await user.click(updateButton)

      await waitFor(() => expect(closeModal).toHaveBeenCalled())
    })
  })

  describe('when clicking cancel button', () => {
    it('closes the modal', async () => {
      const { user } = setup()
      const closeModal = jest.fn()
      render(<UpdateDefaultOrgModal isOpen={true} closeModal={closeModal} />, {
        wrapper,
      })
      const cancelButton = await screen.findByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)

      await waitFor(() => expect(closeModal).toHaveBeenCalled())
    })
  })

  describe('when clicking all orgs and repos button', () => {
    it('updates default org to all orgs', async () => {
      const { user } = setup()
      render(<UpdateDefaultOrgModal isOpen={true} closeModal={jest.fn()} />, {
        wrapper,
      })
      const allOrgsAndReposButton = await screen.findByRole('button', {
        name: /All orgs and repos/,
      })
      expect(allOrgsAndReposButton).toBeInTheDocument()
      await user.click(allOrgsAndReposButton)

      const defaultOrgText = await screen.findByText(/Current default org/)
      expect(defaultOrgText).toBeInTheDocument()
    })
  })
})
