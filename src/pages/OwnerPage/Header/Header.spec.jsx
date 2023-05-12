import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import Header from './Header'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')
jest.mock('./HeaderBanners/HeaderBanners', () => () => 'HeaderBanners')
jest.mock('ui/Avatar', () => () => 'Avatar')
jest.mock('config')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/gh/codecov']}>
        <Route path="/:provider/:owner">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

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

const mockOwner = {
  username: 'Scanlan',
  isCurrentUserPartOfOrg: true,
  numberOfUploads: 3,
}

const isSelfHosted = false

describe('Header', () => {
  afterAll(() => jest.clearAllMocks())

  function setup(owner = mockOwner) {
    config.IS_SELF_HOSTED = isSelfHosted
    server.use(
      graphql.query('OwnerPageData', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({ ...mockOwner, owner }))
      )
    )
  }

  describe('when user is part of the org', () => {
    beforeEach(() => {
      setup({
        username: 'Scanlan',
        isCurrentUserPartOfOrg: true,
      })
    })

    it('renders the context switcher', async () => {
      render(<Header />, { wrapper })
      const contextSwitcher = await screen.findByText(/MyContextSwitcher/)
      expect(contextSwitcher).toBeInTheDocument()
    })
  })

  describe('in cloud', () => {
    describe('when user is part of the org', () => {
      beforeEach(() => {
        setup({
          username: 'Scanlan',
          isCurrentUserPartOfOrg: true,
        })
      })

      it('renders the context switcher', async () => {
        render(<Header />, { wrapper })
        const contextSwitcher = await screen.findByText(/MyContextSwitcher/)
        expect(contextSwitcher).toBeInTheDocument()
      })
    })

    describe('when user is not part of the org', () => {
      beforeEach(() => {
        setup({
          username: 'Scanlan',
          isCurrentUserPartOfOrg: false,
        })
      })

      it('renders the title of the owner', async () => {
        render(<Header />, { wrapper })
        expect(
          await screen.findByRole('heading', {
            name: /Scanlan/i,
          })
        ).toBeInTheDocument()
        expect(await screen.findByText(/Avatar/)).toBeInTheDocument()
      })

      it('does not render the context switcher', async () => {
        render(<Header />, { wrapper })
        expect(screen.queryByText(/MyContextSwitcher/)).not.toBeInTheDocument()
      })
    })
  })

  describe('in enterprise', () => {
    describe('when user is part of the org', () => {
      beforeEach(() => {
        setup({
          username: 'Scanlan',
          isCurrentUserPartOfOrg: true,
        })
      })

      it('renders the context switcher', async () => {
        render(<Header />, { wrapper })
        const contextSwitcher = await screen.findByText(/MyContextSwitcher/)
        expect(contextSwitcher).toBeInTheDocument()
      })
    })

    describe('when user is not part of the org', () => {
      beforeEach(() => {
        setup({
          username: 'Scanlan',
          isCurrentUserPartOfOrg: false,
        })
      })

      it('renders the title of the owner', async () => {
        render(<Header />, { wrapper })
        expect(
          await screen.findByRole('heading', {
            name: /Scanlan/i,
          })
        ).toBeInTheDocument()
        expect(await screen.findByText(/Avatar/)).toBeInTheDocument()
      })

      it('does not render the context switcher', () => {
        render(<Header />, { wrapper })
        expect(screen.queryByText(/MyContextSwitcher/)).not.toBeInTheDocument()
      })
    })
  })
})
