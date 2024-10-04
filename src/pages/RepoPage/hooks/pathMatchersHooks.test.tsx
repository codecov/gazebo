import { renderHook } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import {
  useMatchBlobsPath,
  useMatchCoverageOnboardingPath,
  useMatchTreePath,
} from './pathMatchersHooks'

const wrapper =
  (
    initialEntries = '/gh/test-owner/test-repo',
    path = '/:provider/:owner/:repo'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <MemoryRouter initialEntries={[initialEntries]}>
      <Route path={path}>{children}</Route>
    </MemoryRouter>
  )

describe('useMatchBlobsPath', () => {
  it('returns false when not on a blob path', () => {
    const { result } = renderHook(() => useMatchBlobsPath(), {
      wrapper: wrapper(),
    })

    expect(result.current).toBe(false)
  })

  it('returns true when on a blob path', () => {
    const { result } = renderHook(() => useMatchBlobsPath(), {
      wrapper: wrapper('/gh/test-owner/test-repo/blob/master/src/index.ts'),
    })

    expect(result.current).toBe(true)
  })
})

describe('useMatchTreePath', () => {
  it('returns false when not on a tree path', () => {
    const { result } = renderHook(() => useMatchTreePath(), {
      wrapper: wrapper(),
    })

    expect(result.current).toBe(false)
  })

  it('returns true when on a tree path', () => {
    const { result } = renderHook(() => useMatchTreePath(), {
      wrapper: wrapper('/gh/test-owner/test-repo/tree/master/src'),
    })

    expect(result.current).toBe(true)
  })
})

describe('useMatchCoverageOnboardingPath', () => {
  it('returns false when not on a coverage onboarding path', () => {
    const { result } = renderHook(() => useMatchCoverageOnboardingPath(), {
      wrapper: wrapper(),
    })

    expect(result.current).toBe(false)
  })

  describe('when on a coverage onboarding path', () => {
    it('returns true when on /new path', () => {
      const { result } = renderHook(() => useMatchCoverageOnboardingPath(), {
        wrapper: wrapper('/gh/test-owner/test-repo/new'),
      })

      expect(result.current).toBe(true)
    })

    it('returns true when on /new/circle-ci path', () => {
      const { result } = renderHook(() => useMatchCoverageOnboardingPath(), {
        wrapper: wrapper('/gh/test-owner/test-repo/new/circle-ci'),
      })

      expect(result.current).toBe(true)
    })

    it('returns true when on /new/other-ci path', () => {
      const { result } = renderHook(() => useMatchCoverageOnboardingPath(), {
        wrapper: wrapper('/gh/test-owner/test-repo/new/other-ci'),
      })

      expect(result.current).toBe(true)
    })
  })
})
