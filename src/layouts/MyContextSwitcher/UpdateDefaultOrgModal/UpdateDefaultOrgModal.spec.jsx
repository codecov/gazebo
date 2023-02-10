import { render, screen, waitFor } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import UpdateDefaultOrgModal from './UpdateDefaultOrgModal'

jest.mock('ui/Avatar', () => () => 'Avatar')

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
  const closeModal = jest.fn()
  const defaultProps = {
    isOpen: true,
    closeModal,
  }
  function setup() {
    server.use(
      graphql.mutation('updateDefaultOrganization', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({}))
      ),
      graphql.query('MyContexts', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(contextData))
      )
    )
  }

  describe('when the modal is shown', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the organization list', async () => {
      render(<UpdateDefaultOrgModal {...defaultProps} />, { wrapper })
      const fearneUsername = await screen.findByText(/fearne-calloway/)
      expect(fearneUsername).toBeInTheDocument()

      const morriUsername = await screen.findByText(/morri/)
      expect(morriUsername).toBeInTheDocument()
    })

    it('renders update and cancel buttons', async () => {
      render(<UpdateDefaultOrgModal {...defaultProps} />, { wrapper })
      const updateButton = await screen.findByText(/Update/)
      expect(updateButton).toBeInTheDocument()
      const cancelButton = await screen.findByText(/Cancel/)
      expect(cancelButton).toBeInTheDocument()
    })

    it('renders appropriate labels', async () => {
      render(<UpdateDefaultOrgModal {...defaultProps} />, { wrapper })
      const title = await screen.findByText(/Select default organization/)
      expect(title).toBeInTheDocument()
      const subTitle = await screen.findByText(
        /Org will appear as default for landing page context/
      )
      expect(subTitle).toBeInTheDocument()
    })
  })

  describe('when clicking update button', () => {
    beforeEach(() => {
      setup()
    })

    it('selects a default organization', async () => {
      render(<UpdateDefaultOrgModal {...defaultProps} />, { wrapper })
      const updateButton = await screen.findByRole('button', { name: 'Update' })
      expect(updateButton).toHaveClass('disabled:cursor-not-allowed')

      // Select org
      const fearneUsername = await screen.findByRole('button', {
        name: /fearne-calloway/,
      })
      expect(fearneUsername).toBeInTheDocument()
      userEvent.click(fearneUsername)

      // Update org
      userEvent.click(updateButton)

      await waitFor(() => expect(closeModal).toHaveBeenCalled())
    })
  })

  describe('when clicking cancel button', () => {
    beforeEach(() => {
      setup()
    })

    it('closes the modal', async () => {
      render(<UpdateDefaultOrgModal {...defaultProps} />, { wrapper })
      const cancelButton = await screen.findByRole('button', { name: 'Cancel' })
      userEvent.click(cancelButton)

      await waitFor(() => expect(closeModal).toHaveBeenCalled())
    })
  })
})
