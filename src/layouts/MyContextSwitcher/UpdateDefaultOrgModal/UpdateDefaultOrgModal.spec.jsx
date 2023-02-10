import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import UpdateDefaultOrgModal from './UpdateDefaultOrgModal'

jest.mock('./OrganizationList', () => () => 'OrganizationList')

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

describe('UpdateDefaultOrgModal', () => {
  const closeModal = jest.fn()
  const defaultProps = {
    isLoading: false,
    closeModal,
  }
  function setup() {
    server.use(
      graphql.mutation('updateDefaultOrganization', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({}))
      )
    )
  }

  describe('when the modal is shown', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the organization list', async () => {
      render(<UpdateDefaultOrgModal {...defaultProps} />, { wrapper })
      const orgList = await screen.findByText(/OrganizationList/)
      expect(orgList).toBeInTheDocument()
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
})
