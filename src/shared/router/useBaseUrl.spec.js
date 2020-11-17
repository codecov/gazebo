import { renderHook } from '@testing-library/react-hooks'
import { MemoryRouter, Switch, Route } from 'react-router-dom'

import useBaseUrl from './useBaseUrl'

describe('useBaseUrl', () => {
  let hookData

  function setup(currentUrl) {
    hookData = renderHook(() => useBaseUrl(), {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={[currentUrl]}>
          <Switch>
            <Route path={currentUrl}>{children}</Route>
          </Switch>
        </MemoryRouter>
      ),
    })
  }

  describe('when called without a / at the end of URL', () => {
    beforeEach(() => {
      setup('/hello')
    })

    it('renders the same URL with a / at the end', () => {
      expect(hookData.result.current).toBe('/hello/')
    })
  })

  describe('when called with a / at the end of URL', () => {
    beforeEach(() => {
      setup('/hello/')
    })

    it('renders the same URL', () => {
      expect(hookData.result.current).toBe('/hello/')
    })
  })
})
