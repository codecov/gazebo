import { Router, Route } from 'react-router-dom'
import { renderHook } from '@testing-library/react-hooks'
import { createMemoryHistory } from 'history'

import { useLocationParams } from './hooks'

describe('useLocationParams', () => {
  let hookData
  let testLocation
  let history

  function setup({ options, location } = {}) {
    testLocation = location
    history = createMemoryHistory()

    const wrapper = ({ children }) => (
      <Router history={history}>
        {children}
        <Route
          path="*"
          render={({ location }) => {
            testLocation = location
            return null
          }}
        />
      </Router>
    )

    if (testLocation) {
      history.push(testLocation)
    }

    hookData = renderHook(() => useLocationParams(options), {
      wrapper,
    })
  }

  describe('esential functionality', () => {
    beforeEach(() => {
      setup()
    })

    it('returns no current params', () => {
      expect(hookData.result.current.params).toStrictEqual({})
    })

    it('returns setParams function', () => {
      expect(
        typeof hookData.result.current.setParams === 'function'
      ).toBeTruthy()
    })

    it('setParams updates the window location', () => {
      expect(testLocation.search).toBe('')
      hookData.result.current.setParams({ fiz: 'baz' })
      expect(testLocation.search).toBe('?fiz=baz')
    })

    it('updated state is received after updating location', () => {
      expect(hookData.result.current.params).toStrictEqual({})
      hookData.result.current.setParams({ fiz: 'baz' })
      expect(hookData.result.current.params).toStrictEqual({ fiz: 'baz' })
    })
  })

  describe('handles location changes', () => {
    describe('previous location', () => {
      beforeEach(() => {
        setup({ location: '/?starting=place' })
      })

      it('returns state', () => {
        history.push('/?next=place')

        expect(hookData.result.current.params).toStrictEqual({
          next: 'place',
        })

        history.goBack()

        expect(hookData.result.current.params).toStrictEqual({
          starting: 'place',
        })
      })
    })
    describe('forward location', () => {
      beforeEach(() => {
        setup({ location: '/?starting=place' })
      })

      it('returns state', () => {
        history.push('/?next=place')

        expect(hookData.result.current.params).toStrictEqual({
          next: 'place',
        })

        history.goBack()

        expect(hookData.result.current.params).toStrictEqual({
          starting: 'place',
        })

        history.goForward()

        expect(hookData.result.current.params).toStrictEqual({
          next: 'place',
        })
      })
    })
    describe('new location', () => {
      beforeEach(() => {
        setup({ location: '/?starting=place' })
      })

      it('returns state', () => {
        expect(hookData.result.current.params).toStrictEqual({
          starting: 'place',
        })

        history.push('/?next=place')

        expect(hookData.result.current.params).toStrictEqual({ next: 'place' })
      })
    })
  })

  describe('No params', () => {
    describe('Initial values', () => {
      beforeEach(() => {
        setup({ options: { foo: 'bar' } })
      })
      it('returns with default params', () => {
        expect(hookData.result.current.params).toStrictEqual({ foo: 'bar' })
      })

      it('location is not pushed to url if only default params', () => {
        hookData.result.current.setParams({ fiz: 'baz' })
        expect(testLocation.search).toBe('?fiz=baz')
        hookData.result.current.setParams({ foo: 'bar' })
        expect(testLocation.search).toBe('')
      })
    })

    describe('setParams', () => {
      beforeEach(() => {
        setup({ options: { foo: 'bar' } })
      })
      it('overwrites state', () => {
        hookData.result.current.setParams({ fiz: 'baz' })
        expect(hookData.result.current.params).toStrictEqual({
          fiz: 'baz',
        })
      })
    })
  })

  describe('Fresh page load has params', () => {
    describe('Initial values', () => {
      beforeEach(() => {
        setup({ location: '/?apple=fruit' })
      })
      it('returns with url params', () => {
        expect(hookData.result.current.params).toStrictEqual({
          apple: 'fruit',
        })
      })
    })

    describe('setParams', () => {
      beforeEach(() => {
        setup({ location: '/?apple=fruit' })
      })
      it('overwrites state', () => {
        hookData.result.current.setParams({ potato: 'vegetable' })
        expect(hookData.result.current.params).toStrictEqual({
          potato: 'vegetable',
        })
      })

      it('updates the window location', () => {
        expect(testLocation.search).toBe('?apple=fruit')
        hookData.result.current.setParams({ fiz: 'baz' })
        expect(testLocation.search).toBe('?fiz=baz')
      })
    })
  })
})
