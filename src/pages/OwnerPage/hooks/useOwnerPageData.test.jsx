import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useOwnerPageData } from './useOwnerPageData'

const mockOwner = {
  username: 'TerrySmithDC',
  isCurrentUserPartOfOrg: true,
  numberOfUploads: 30,
  avatarUrl: 'cool-image-url',
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh']}>
    <Route path="/:provider">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useOwnerPageData', () => {
  function setup() {
    server.use(
      graphql.query('OwnerPageData', (info) => {
        return HttpResponse.json({ data: { owner: mockOwner } })
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns data for the owner page', async () => {
      const { result } = renderHook(
        () => useOwnerPageData({ username: mockOwner.username }),
        { wrapper }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() => expect(result.current.data).toEqual(mockOwner))
    })
  })
})
