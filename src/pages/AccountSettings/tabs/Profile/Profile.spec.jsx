import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useFlags } from 'shared/featureFlags'
import { ThemeContextProvider } from 'shared/ThemeContext'

import Profile from './Profile'

const queryClient = new QueryClient()
const mockUser = {
  name: 'Codecov User',
  username: 'codecov-user',
  email: 'codecov-user@codecov.io',
  isAdmin: true,
}

const server = setupServer()
beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

jest.mock('shared/featureFlags')

describe('Profile', () => {
  function setup() {
    useFlags.mockReturnValue({ showThemeToggle: true })

    server.use(
      rest.get('/internal/users/current', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(mockUser))
      ),
      graphql.query('Seats', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({ config: { seatsUsed: 0, seatsLimit: 10 } })
        )
      )
    )

    render(
      <QueryClientProvider client={queryClient}>
        <ThemeContextProvider>
          <MemoryRouter initialEntries={['/account/gh/codecov-user']}>
            <Route path="/account/:provider/:owner">
              <Profile owner="codecov-user" provider="gh" />
            </Route>
          </MemoryRouter>
        </ThemeContextProvider>
      </QueryClientProvider>
    )
  }
  describe('rendering component', () => {
    beforeEach(() => {
      setup()
    })

    it('renders profile', async () => {
      const text = await screen.findByText('Activation Status')
      expect(text).toBeInTheDocument()
    })
  })

  describe('when show theme toggle flag is set to true', () => {
    beforeEach(() => {
      setup({ showThemeToggle: true })
    })

    it('renders colorblind label', async () => {
      const label = await screen.findByText(/Colorblind Friendly/)
      expect(label).toBeInTheDocument()
    })

    it('renders colorblind toggle', async () => {
      const toggles = await screen.findAllByTestId('switch')
      expect(toggles.length).toBe(2)
    })

    describe('on toggle switch', () => {
      window.localStorage.__proto__.setItem = jest.fn()

      beforeEach(async () => {
        const themeToggle = await screen.findByText(/Colorblind Friendly/)
        themeToggle.click()
      })

      it('sets color-blind theme in local storage', () => {
        expect(localStorage.setItem).toBeCalledWith(
          'current-theme',
          'color-blind'
        )
      })
    })
  })
})
