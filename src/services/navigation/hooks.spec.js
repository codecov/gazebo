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

  describe('setParams', () => {
    describe('no settings', () => {
      beforeEach(() => {
        setup()
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

    describe('default props', () => {
      beforeEach(() => {
        setup({ options: { foo: 'bar' } })
      })

      it('location is not pushed to url if only default params', () => {
        hookData.result.current.setParams({ fiz: 'baz' })
        expect(testLocation.search).toBe('?fiz=baz')
        hookData.result.current.setParams({ foo: 'bar' })
        expect(testLocation.search).toBe('')
      })

      it('overwrites state', () => {
        hookData.result.current.setParams({ foo: 'baz' })
        expect(hookData.result.current.params).toStrictEqual({
          foo: 'baz',
        })
      })

      // Add aditional param state check
    })

    describe('Reading from url location', () => {
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

  describe('updateParams', () => {
    describe('no settings', () => {
      beforeEach(() => {
        setup()
      })

      it('updates the window location', () => {
        expect(testLocation.search).toBe('')
        hookData.result.current.updateParams({ fiz: 'baz' })
        expect(testLocation.search).toBe('?fiz=baz')
      })

      it('updated state is received after updating location', () => {
        expect(hookData.result.current.params).toStrictEqual({})
        hookData.result.current.updateParams({ fiz: 'baz' })
        expect(hookData.result.current.params).toStrictEqual({ fiz: 'baz' })
      })
    })

    describe('default props', () => {
      beforeEach(() => {
        setup({ options: { foo: 'bar' } })
      })
      it('location is not pushed to url if only default params', () => {
        hookData.result.current.updateParams({ fiz: 'baz' })
        expect(testLocation.search).toBe('?fiz=baz')
        hookData.result.current.updateParams({ foo: 'bar' })
        expect(testLocation.search).toBe('?fiz=baz')
      })

      it('overwrites state', () => {
        hookData.result.current.updateParams({ foo: 'baz' })
        expect(hookData.result.current.params).toStrictEqual({
          foo: 'baz',
        })
      })

      // Add aditional param state check, maintains old
    })

    describe('Reading from url location', () => {
      beforeEach(() => {
        setup({ location: '/?apple=fruit' })
      })
      it('overwrites state', () => {
        hookData.result.current.updateParams({ potato: 'vegetable' })
        expect(hookData.result.current.params).toStrictEqual({
          potato: 'vegetable',
          apple: 'fruit',
        })
      })

      it('updates the window location', () => {
        expect(testLocation.search).toBe('?apple=fruit')
        hookData.result.current.updateParams({ fiz: 'baz' })
        expect(testLocation.search).toBe('?apple=fruit&fiz=baz')
      })
    })
  })

  describe('params', () => {
    describe('no settings', () => {
      beforeEach(() => {
        setup()
      })

      it('returns no current params', () => {
        expect(hookData.result.current.params).toStrictEqual({})
      })
    })

    describe('default props', () => {
      beforeEach(() => {
        setup({ options: { foo: 'bar' } })
      })
      it('returns with default params', () => {
        expect(hookData.result.current.params).toStrictEqual({ foo: 'bar' })
      })
    })

    describe('Reading from url location', () => {
      beforeEach(() => {
        setup({ location: '/?apple=fruit' })
      })
      it('returns with url params', () => {
        expect(hookData.result.current.params).toStrictEqual({
          apple: 'fruit',
        })
      })
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
})
