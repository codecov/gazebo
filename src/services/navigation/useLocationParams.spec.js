import { renderHook } from '@testing-library/react-hooks'
import { createMemoryHistory } from 'history'
import { Route, Router } from 'react-router-dom'

import { useLocationParams } from './useLocationParams'

describe('useLocationParams', () => {
  let testLocation
  let history

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

  function setup({ location } = {}) {
    testLocation = location
    history = createMemoryHistory()

    if (testLocation) {
      history.push(testLocation)
    }
  }

  describe('setParams', () => {
    describe('no settings', () => {
      beforeEach(() => {
        setup()
      })

      it('setParams updates the window location', () => {
        const { result } = renderHook(() => useLocationParams(), {
          wrapper,
        })

        expect(testLocation.search).toBe('')
        result.current.setParams({ fiz: 'baz' })
        expect(testLocation.search).toBe('?fiz=baz')
      })

      it('updated state is received after updating location', () => {
        const { result } = renderHook(() => useLocationParams(), {
          wrapper,
        })

        expect(result.current.params).toStrictEqual({})
        result.current.setParams({ fiz: 'baz' })
        expect(result.current.params).toStrictEqual({ fiz: 'baz' })
      })
    })

    describe('default props', () => {
      beforeEach(() => {
        setup()
      })

      it('location is not pushed to url if only default params', () => {
        const { result } = renderHook(() => useLocationParams({ foo: 'bar' }), {
          wrapper,
        })

        result.current.setParams({ fiz: 'baz' })
        expect(testLocation.search).toBe('?fiz=baz')
        result.current.setParams({ foo: 'bar' })
        expect(testLocation.search).toBe('')
      })

      it('overwrites state', () => {
        const { result } = renderHook(() => useLocationParams({ foo: 'bar' }), {
          wrapper,
        })

        result.current.setParams({ foo: 'baz' })
        expect(result.current.params).toStrictEqual({
          foo: 'baz',
        })
      })
    })

    describe('Reading from url location', () => {
      beforeEach(() => {
        setup({ location: '/?apple=fruit' })
      })
      it('overwrites state', () => {
        const { result } = renderHook(() => useLocationParams(), {
          wrapper,
        })

        result.current.setParams({ potato: 'vegetable' })
        expect(result.current.params).toStrictEqual({
          potato: 'vegetable',
        })
      })

      it('updates the window location', () => {
        const { result } = renderHook(() => useLocationParams(), {
          wrapper,
        })

        expect(testLocation.search).toBe('?apple=fruit')
        result.current.setParams({ fiz: 'baz' })
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
        const { result } = renderHook(() => useLocationParams(), {
          wrapper,
        })

        expect(testLocation.search).toBe('')
        result.current.updateParams({ fiz: 'baz' })
        expect(testLocation.search).toBe('?fiz=baz')
      })

      it('updated state is received after updating location', () => {
        const { result } = renderHook(() => useLocationParams(), {
          wrapper,
        })

        expect(result.current.params).toStrictEqual({})
        result.current.updateParams({ fiz: 'baz' })
        expect(result.current.params).toStrictEqual({ fiz: 'baz' })
      })
    })

    describe('default props', () => {
      beforeEach(() => {
        setup()
      })
      it('location is not pushed to url if only default params', () => {
        const { result } = renderHook(() => useLocationParams({ foo: 'bar' }), {
          wrapper,
        })

        result.current.updateParams({ fiz: 'baz' })
        expect(testLocation.search).toBe('?fiz=baz')
        result.current.updateParams({ foo: 'bar' })
        expect(testLocation.search).toBe('?fiz=baz')
      })

      it('overwrites state', () => {
        const { result } = renderHook(() => useLocationParams(), {
          wrapper,
        })

        result.current.updateParams({ foo: 'baz' })
        expect(result.current.params).toStrictEqual({
          foo: 'baz',
        })
      })
    })

    describe('Reading from url location', () => {
      beforeEach(() => {
        setup({ location: '/?apple=fruit' })
      })

      it('overwrites state', () => {
        const { result } = renderHook(() => useLocationParams(), {
          wrapper,
        })

        result.current.updateParams({ potato: 'vegetable' })
        expect(result.current.params).toStrictEqual({
          potato: 'vegetable',
          apple: 'fruit',
        })
      })

      it('updates the window location', () => {
        const { result } = renderHook(() => useLocationParams(), {
          wrapper,
        })

        expect(testLocation.search).toBe('?apple=fruit')
        result.current.updateParams({ fiz: 'baz' })
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
        const { result } = renderHook(() => useLocationParams(), {
          wrapper,
        })

        expect(result.current.params).toStrictEqual({})
      })
    })

    describe('default props', () => {
      beforeEach(() => {
        setup()
      })
      it('returns with default params', () => {
        const { result } = renderHook(() => useLocationParams({ foo: 'bar' }), {
          wrapper,
        })

        expect(result.current.params).toStrictEqual({ foo: 'bar' })
      })
    })

    describe('Reading from url location', () => {
      beforeEach(() => {
        setup({ location: '/?apple=fruit' })
      })
      it('returns with url params', () => {
        const { result } = renderHook(() => useLocationParams(), {
          wrapper,
        })

        expect(result.current.params).toStrictEqual({
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
        const { result } = renderHook(() => useLocationParams(), {
          wrapper,
        })

        history.push('/?next=place')

        expect(result.current.params).toStrictEqual({
          next: 'place',
        })

        history.goBack()

        expect(result.current.params).toStrictEqual({
          starting: 'place',
        })
      })
    })
    describe('forward location', () => {
      beforeEach(() => {
        setup({ location: '/?starting=place' })
      })

      it('returns state', () => {
        const { result } = renderHook(() => useLocationParams(), {
          wrapper,
        })

        history.push('/?next=place')

        expect(result.current.params).toStrictEqual({
          next: 'place',
        })

        history.goBack()

        expect(result.current.params).toStrictEqual({
          starting: 'place',
        })

        history.goForward()

        expect(result.current.params).toStrictEqual({
          next: 'place',
        })
      })
    })
    describe('new location', () => {
      beforeEach(() => {
        setup({ location: '/?starting=place' })
      })

      it('returns state', () => {
        const { result } = renderHook(() => useLocationParams(), {
          wrapper,
        })

        expect(result.current.params).toStrictEqual({
          starting: 'place',
        })

        history.push('/?next=place')

        expect(result.current.params).toStrictEqual({ next: 'place' })
      })
    })
  })
})
