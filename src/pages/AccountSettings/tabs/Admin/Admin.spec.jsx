import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import Admin from './Admin'

jest.mock('./DetailsSection', () => () => 'DetailsSection')
jest.mock('./StudentSection', () => () => 'StudentSection')
jest.mock('./GithubIntegrationSection', () => () => 'GithubIntegrationSection')
jest.mock('./ManageAdminCard', () => () => 'ManageAdminCard')
jest.mock('./DeletionCard', () => () => 'DeletionCard')

const me = {
  user: {
    username: 'rula',
  },
  email: 'rula@codecov.io',
  name: 'rula',
  avatarUrl: 'http://127.0.0.1/avatar-url',
  onboardingCompleted: false,
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/account/gh/rula']}>
      <Route path="/account/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('AdminTab', () => {
  function setup() {
    server.use(
      graphql.query('CurrentUser', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data({ me }))
      })
    )
  }

  describe('when rendered for user', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the DetailsSection', async () => {
      render(<Admin />, { wrapper })

      const card = await screen.findByText(/DetailsSection/)
      expect(card).toBeInTheDocument()
    })

    it('renders the StudentSection', async () => {
      render(<Admin />, { wrapper })

      const card = await screen.findByText(/StudentSection/)
      expect(card).toBeInTheDocument()
    })

    it('renders the GithubIntegrationSection', async () => {
      render(<Admin />, { wrapper })

      const card = await screen.findByText(/GithubIntegrationSection/)
      expect(card).toBeInTheDocument()
    })

    it('renders the DeletionCard', async () => {
      render(<Admin />, { wrapper })

      const card = await screen.findByText(/DeletionCard/)
      expect(card).toBeInTheDocument()
    })
  })

  describe('when rendered for organization', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the ManageAdminCard', async () => {
      render(<Admin />, { wrapper })

      const card = await screen.findByText(/ManageAdminCard/)
      expect(card).toBeInTheDocument()
    })

    it('renders the GithubIntegrationSection', async () => {
      render(<Admin />, { wrapper })

      const card = await screen.findByText(/GithubIntegrationSection/)
      expect(card).toBeInTheDocument()
    })

    it('renders the DeletionCard', async () => {
      render(<Admin />, { wrapper })

      const card = await screen.findByText(/DeletionCard/)
      expect(card).toBeInTheDocument()
    })
  })
})
