import { MemoryRouter, Route } from 'react-router-dom'
import { renderHook } from '@testing-library/react-hooks'

import {
  ListenToRouter,
  useCurrentResource,
  CurrentResourceProvider,
} from './context'

describe('ToastNotificationProvider', () => {
  let hookData, testHistory

  function setup() {
    hookData = renderHook(() => useCurrentResource(), {
      wrapper: ({ children, ...props }) => (
        <MemoryRouter>
          <CurrentResourceProvider {...props}>
            <Route
              path="/:provider/:owner/:repo"
              render={({ history }) => {
                testHistory = history
                return <ListenToRouter>{children}</ListenToRouter>
              }}
            />
            <Route
              path="*"
              render={({ history }) => {
                testHistory = history
                return <ListenToRouter>{children}</ListenToRouter>
              }}
            />
          </CurrentResourceProvider>
        </MemoryRouter>
      ),
    })
  }

  describe('when initial render', () => {
    beforeEach(() => {
      setup()
    })

    it('doesnt have resource', () => {
      expect(hookData.result.current).toEqual({
        provider: undefined,
        owner: undefined,
        repo: undefined,
      })
    })
  })

  describe('when going to page with resource from URL', () => {
    beforeEach(() => {
      setup()
      testHistory.push('/gh/codecov/gazebo')
    })

    it('has the resource from the URL', () => {
      expect(hookData.result.current).toEqual({
        provider: 'gh',
        owner: 'codecov',
        repo: 'gazebo',
      })
    })
  })
})
