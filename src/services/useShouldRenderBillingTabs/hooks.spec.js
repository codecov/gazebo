import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

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
  function setup({ username = '', isEnterprise = false }) {
    config.IS_ENTERPRISE = isEnterprise

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
      setup({})
    })

    it('Account is not personal', () => {
      expect(hookData.result.current).toBeTruthy()
    })
  })

  describe('When render with same username', () => {
    beforeEach(() => {
      setup({ username: 'codecov' })
    })

    it('Account is personal', () => {
      expect(hookData.result.current).toBeFalsy()
    })
  })

  describe('when running in enterprise', () => {
    beforeEach(() => {
      setup({ isEnterprise: true })
    })

    it('returns false', () => {
      expect(hookData.result.current).toBeFalsy()
    })
  })
})
