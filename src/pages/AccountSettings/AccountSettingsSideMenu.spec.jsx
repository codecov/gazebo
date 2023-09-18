import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import AccountSettingsSideMenu from './AccountSettingsSideMenu'

jest.mock('config')

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
})

const wrapper =
  (
    { initialEntries = '/account/gh/codecov' } = {
      initialEntries: '/account/gh/codecov',
    }
  ) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/account/:provider/:owner">
            <Suspense fallback={<p>Loading</p>}>{children}</Suspense>
          </Route>
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

describe('AccountSettingsSideMenu', () => {
  function setup(
    {
      isAdmin = false,
      username = 'codecov',
      owner = 'codecov',
      isSelfHosted = false,
      hideAccessTab = false,
    } = {
      isAdmin: false,
      username: 'codecov',
      isSelfHosted: false,
      owner: 'codecov',
      hideAccessTab: false,
    }
  ) {
    config.IS_SELF_HOSTED = isSelfHosted
    config.HIDE_ACCESS_TAB = hideAccessTab

    server.use(
      graphql.query('CurrentUser', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            me: { user: { username } },
          })
        )
      }),
      graphql.query('DetailOwner', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({ owner: { username: owner, isAdmin } }))
      )
    )
  }

  describe('running in self hosted mode', () => {
    describe('user is viewing their personal settings', () => {
      it('renders profile link', async () => {
        setup({ isSelfHosted: true })

        render(<AccountSettingsSideMenu />, { wrapper: wrapper() })

        const link = await screen.findByRole('link', { name: 'Profile' })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/account/gh/codecov')
      })

      describe('hide access tab is set to false', () => {
        it('renders access tab link', async () => {
          setup({ isSelfHosted: true })

          render(<AccountSettingsSideMenu />, { wrapper: wrapper() })

          const link = await screen.findByRole('link', { name: 'Access' })
          expect(link).toBeInTheDocument()
          expect(link).toHaveAttribute('href', '/account/gh/codecov/access')
        })
      })

      describe('hide access tab is set to true', () => {
        it('does not render access tab link', async () => {
          setup({ isSelfHosted: true, hideAccessTab: true })

          render(<AccountSettingsSideMenu />, { wrapper: wrapper() })

          const suspense = await screen.findByText('Loading')
          expect(suspense).toBeInTheDocument()
          await waitFor(() =>
            expect(screen.queryByText('Loading')).not.toBeInTheDocument()
          )

          const link = screen.queryByRole('link', {
            name: 'Access',
          })
          expect(link).not.toBeInTheDocument()
        })
      })
    })

    describe('user is not viewing their personal settings', () => {
      it('does not render profile link', async () => {
        setup({ isSelfHosted: true })

        render(<AccountSettingsSideMenu />, {
          wrapper: wrapper({ initialEntries: '/account/gh/cool-new-user' }),
        })

        const suspense = await screen.findByText('Loading')
        expect(suspense).toBeInTheDocument()
        await waitFor(() =>
          expect(screen.queryByText('Loading')).not.toBeInTheDocument()
        )

        const link = screen.queryByRole('link', { name: 'Profile' })
        expect(link).not.toBeInTheDocument()
      })
    })

    it('renders yaml link', async () => {
      setup({ isSelfHosted: true })

      render(<AccountSettingsSideMenu />, { wrapper: wrapper() })

      const link = await screen.findByRole('link', { name: 'Global YAML' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/account/gh/codecov/yaml')
    })

    it('does not render org upload token link', async () => {
      setup({ isSelfHosted: true })

      render(<AccountSettingsSideMenu />, { wrapper: wrapper() })

      const suspense = await screen.findByText('Loading')
      expect(suspense).toBeInTheDocument()
      await waitFor(() =>
        expect(screen.queryByText('Loading')).not.toBeInTheDocument()
      )

      const link = screen.queryByRole('link', { name: 'Global Upload Token' })
      expect(link).not.toBeInTheDocument()
    })
  })

  describe('not running in self hosted mode', () => {
    describe('user is an admin', () => {
      it('renders admin link', async () => {
        setup({ isAdmin: true })

        render(<AccountSettingsSideMenu />, { wrapper: wrapper() })

        const link = await screen.findByRole('link', { name: 'Admin' })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/account/gh/codecov')
      })

      describe('user is viewing personal settings', () => {
        it('renders internal access link', async () => {
          setup({ isAdmin: true })

          render(<AccountSettingsSideMenu />, { wrapper: wrapper() })

          const link = await screen.findByRole('link', { name: 'Access' })
          expect(link).toBeInTheDocument()
          expect(link).toHaveAttribute('href', '/account/gh/codecov/access')
        })
      })

      describe('user is not viewing personal settings', () => {
        it('does not render internal access link', async () => {
          setup({ isAdmin: true, username: 'cool-new-user' })

          render(<AccountSettingsSideMenu />, {
            wrapper: wrapper('/account/gh/cool-new-owner'),
          })

          const suspense = await screen.findByText('Loading')
          expect(suspense).toBeInTheDocument()
          await waitFor(() =>
            expect(screen.queryByText('Loading')).not.toBeInTheDocument()
          )

          const link = screen.queryByRole('link', { name: 'Access' })
          await waitFor(() => {
            expect(link).not.toBeInTheDocument()
          })
        })
      })

      it('renders yaml link', async () => {
        setup({ isAdmin: true })

        render(<AccountSettingsSideMenu />, { wrapper: wrapper() })

        const link = await screen.findByRole('link', { name: 'Global YAML' })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/account/gh/codecov/yaml')
      })

      it('renders org upload link', async () => {
        setup({ isAdmin: true })

        render(<AccountSettingsSideMenu />, { wrapper: wrapper() })

        const link = await screen.findByRole('link', {
          name: 'Global Upload Token',
        })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute(
          'href',
          '/account/gh/codecov/org-upload-token'
        )
      })
    })

    describe('user is not an admin', () => {
      describe('user is viewing personal settings', () => {
        it('renders internal access link', async () => {
          setup()

          render(<AccountSettingsSideMenu />, { wrapper: wrapper() })

          const link = await screen.findByRole('link', { name: 'Access' })
          expect(link).toBeInTheDocument()
          expect(link).toHaveAttribute('href', '/account/gh/codecov/access')
        })
      })

      describe('user is not viewing personal settings', () => {
        it('does not render internal access link', async () => {
          setup({ username: 'cool-new-owner' })

          render(<AccountSettingsSideMenu />, {
            wrapper: wrapper(),
          })

          const suspense = await screen.findByText('Loading')
          expect(suspense).toBeInTheDocument()
          await waitFor(() =>
            expect(screen.queryByText('Loading')).not.toBeInTheDocument()
          )

          const link = screen.queryByRole('link', { name: 'Access' })
          expect(link).not.toBeInTheDocument()
        })
      })

      it('renders yaml link', async () => {
        setup()

        render(<AccountSettingsSideMenu />, { wrapper: wrapper() })

        const link = await screen.findByRole('link', { name: 'Global YAML' })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/account/gh/codecov/yaml')
      })
    })
  })
})
