import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { MemoryRouter, Route } from 'react-router-dom'

import { useUser } from 'services/user'

import { useShouldRenderBillingTabs } from './hooks'

jest.mock('services/user')

const queryClient = new QueryClient({})

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/']}>
    <Route path="/:provider/:owner">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

describe('useShouldRenderTabs', () => {
  let hookData
  function setup(username = '') {
    useUser.mockReturnValue({
      data: {
        user: {
          username,
        },
      },
    })

    hookData = renderHook(() => useShouldRenderBillingTabs(), {
      wrapper,
    })
  }

  describe('When render with different username', () => {
    beforeEach(() => {
      setup()
    })

    it('Account is not personal', () => {
      expect(hookData.result.current).toBeTruthy()
    })
  })

  describe('When render with same username', () => {
    beforeEach(() => {
      setup('codecov')
    })

    it('Account is personal', () => {
      expect(hookData.result.current).toBeFalsy()
    })
  })
})
