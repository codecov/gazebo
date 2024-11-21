import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Router } from 'react-router-dom'

import config from 'config'

import { useEnterpriseRedirect } from './useEnterpriseRedirect'

vi.mock('config')

const server = setupServer()
const queryClient = new QueryClient()

const history = createMemoryHistory()
history.push('/')
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <Router history={history}>{children}</Router>
  </QueryClientProvider>
)

beforeAll(() => {
  console.error = () => null
  server.listen()
})

afterEach(() => {
  history.replace('/')
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('useEnterpriseRedirect', () => {
  function setup(defaultProvider: string | undefined, sendUser = false) {
    config.ENTERPRISE_DEFAULT_PROVIDER = defaultProvider

    server.use(
      graphql.query('EnterpriseLandingPageUser', () => {
        if (sendUser) {
          return HttpResponse.json({
            data: {
              me: {
                email: 'cool-user@email.com',
              },
            },
          })
        }

        return HttpResponse.json({ data: { me: undefined } })
      })
    )
  }

  describe('user is not logged in', () => {
    it('does not redirect the user', async () => {
      setup('gh', false)

      renderHook(() => useEnterpriseRedirect(), { wrapper })

      await waitFor(() => expect(queryClient.isFetching()).toBeGreaterThan(0))
      await waitFor(() => expect(queryClient.isFetching()).toBe(0))

      expect(history.location.pathname).toBe('/')
    })
  })

  describe('user is logged in', () => {
    it('redirects the user to the default redirect page', async () => {
      setup('gh', true)

      renderHook(() => useEnterpriseRedirect(), { wrapper })

      await waitFor(() => expect(queryClient.isFetching()).toBeGreaterThan(0))
      await waitFor(() => expect(queryClient.isFetching()).toBe(0))

      expect(history.location.pathname).toBe('/gh')
    })
  })

  describe('default provider is not set', () => {
    it('does not redirect the user', async () => {
      setup(undefined, true)

      renderHook(() => useEnterpriseRedirect(), { wrapper })

      expect(history.location.pathname).toBe('/')
    })
  })
})
