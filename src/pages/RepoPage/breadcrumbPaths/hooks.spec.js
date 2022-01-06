import { renderHook } from '@testing-library/react-hooks'
import { useBreadcrumbPaths } from './hooks'
import { useLocation, useParams } from 'react-router-dom'

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
  useParams: jest.fn(),
}))

const commitsPaths = [
  { pageName: 'owner', text: 'codecov' },
  { pageName: 'repo', text: 'gazebo' },
  { pageName: '', readOnly: true, text: 'main' },
]
const paths = [
  { pageName: 'owner', text: 'codecov' },
  { pageName: 'repo', text: 'gazebo' },
]

describe('useBreadcrumbPaths', () => {
  let hookData

  function setup({ path }) {
    useParams.mockReturnValue({ owner: 'codecov', repo: 'gazebo' })
    useLocation.mockReturnValue({ pathname: `/gh/codecov/gazebo/${path}` })
    const { result } = renderHook(() => useBreadcrumbPaths())
    hookData = result
  }

  describe('when used in the commits page', () => {
    beforeEach(() => {
      setup({ path: 'commits' })
    })

    it('is truthy', () => {
      expect(hookData.current).toBeTruthy()
    })

    it('returns three paths objects', () => {
      expect(hookData.current.paths.length).toBe(3)
    })

    it('returns expected paths objects', () => {
      expect(hookData.current.paths).toEqual(commitsPaths)
    })

    it('returns true value for isCommitsPage', () => {
      expect(hookData.current.isCommitsPage).toBe(true)
    })
  })

  describe('when used in the any other page', () => {
    beforeEach(() => {
      setup({ path: 'settings' })
    })

    it('is truthy', () => {
      expect(hookData.current).toBeTruthy()
    })

    it('returns two paths objects', () => {
      expect(hookData.current.paths.length).toBe(2)
    })

    it('returns expected paths objects', () => {
      expect(hookData.current.paths).toEqual(paths)
    })

    it('returns fasle value for isCommitsPage', () => {
      expect(hookData.current.isCommitsPage).toBe(false)
    })
  })
})
