import { renderHook } from '@testing-library/react-hooks'
import Cookie from 'js-cookie'
import { useLocation } from 'react-router-dom'

import { useImpersonate } from './useImpersonate'

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}))

// Note, calling rerender manually after setting the location to ensure
// the useEffect hook has ran at least once.
describe('useImpersonate', () => {
  function setup({ search }) {
    useLocation.mockReturnValue({ search })
  }

  describe('no staff_user cookie', () => {
    afterEach(() => {
      Cookie.remove('staff_user')
    })
    it('returns false no search', () => {
      setup({ search: '' })
      const { result, rerender } = renderHook(() => useImpersonate())

      rerender()

      expect(Cookie.get('staff_user')).toBeUndefined()
      expect(result.current.isImpersonating).toBe(false)
    })

    it('returns true when setting a user in the url', () => {
      setup({ search: '?user=doggo' })
      const { result, rerender } = renderHook(() => useImpersonate())

      rerender()

      expect(Cookie.get('staff_user')).toBe('doggo')
      expect(result.current.isImpersonating).toBe(true)
    })

    it('returns false when sending an empty user', () => {
      setup({ search: '?user' })
      const { result, rerender } = renderHook(() => useImpersonate())

      rerender()

      expect(Cookie.get('staff_user')).toBeUndefined()
      expect(result.current.isImpersonating).toBe(false)
    })
  })

  describe('existing staff_user cookie', () => {
    beforeEach(() => {
      Cookie.set('staff_user', 'doggo')
    })
    afterEach(() => {
      Cookie.remove('staff_user')
    })
    it('returns false no search', () => {
      setup({ search: '' })
      const { result, rerender } = renderHook(() => useImpersonate())

      rerender()

      expect(Cookie.get('staff_user')).toBe('doggo')
      expect(result.current.isImpersonating).toBe(true)
    })

    it('returns true when setting a user in the url', () => {
      setup({ search: '?user=kitty' })
      const { result, rerender } = renderHook(() => useImpersonate())

      rerender()

      expect(Cookie.get('staff_user')).toBe('kitty')
      expect(result.current.isImpersonating).toBe(true)
    })

    it('returns false when sending an empty user', () => {
      setup({ search: '?user=' })
      const { result, rerender } = renderHook(() => useImpersonate())

      rerender()

      expect(Cookie.get('staff_user')).toBeUndefined()
      expect(result.current.isImpersonating).toBe(false)
    })
  })
})
