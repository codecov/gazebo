import { act, renderHook } from '@testing-library/react-hooks'
import { useLocation, useParams } from 'react-router-dom'

import { useCoverageRedirect } from './useCoverageRedirect'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useLocation: jest.fn(),
}))

describe('useCoverageRedirect', () => {
  let hookData

  function setup({ useParamsValue = {}, startingLocation = 'some/path' }) {
    useParams.mockReturnValue(useParamsValue)
    useLocation.mockReturnValue({ pathname: startingLocation })

    hookData = renderHook(() => useCoverageRedirect())
  }

  describe.each`
    desc                                                          | startingLocation                             | branchSelection   | branch       | ref          | expectedNewPath                                  | isRedirectionEnabled
    ${`from root`}                                                | ${`critical-role/c3`}                        | ${'chetney'}      | ${undefined} | ${undefined} | ${'critical-role/c3/tree/chetney'}               | ${true}
    ${`from root (manual extra /)`}                               | ${`critical-role/c3/`}                       | ${'chetney'}      | ${undefined} | ${undefined} | ${'critical-role/c3/tree/chetney'}               | ${true}
    ${`from a file view`}                                         | ${`critical-role/c3/blobs/chetney/foo/bar`}  | ${'blood-hunter'} | ${undefined} | ${'chetney'} | ${'critical-role/c3/blobs/blood-hunter/foo/bar'} | ${true}
    ${`from a file view (manual extra /)`}                        | ${`critical-role/c3/blobs/chetney/foo/bar/`} | ${'blood-hunter'} | ${undefined} | ${'chetney'} | ${'critical-role/c3/blobs/blood-hunter/foo/bar'} | ${true}
    ${`from a tree view`}                                         | ${`critical-role/c3/tree/laudna/foo/bar`}    | ${'chetney'}      | ${'laudna'}  | ${undefined} | ${'critical-role/c3/tree/chetney/foo/bar'}       | ${true}
    ${`from a tree view (manual extra /)`}                        | ${`critical-role/c3/tree/laudna/foo/bar/`}   | ${'chetney'}      | ${'laudna'}  | ${undefined} | ${'critical-role/c3/tree/chetney/foo/bar'}       | ${true}
    ${`fails if no new branch selected`}                          | ${`critical-role`}                           | ${undefined}      | ${undefined} | ${`wizard`}  | ${null}                                          | ${false}
    ${`fails if no params and no new selection`}                  | ${`critical-role/c3`}                        | ${undefined}      | ${undefined} | ${undefined} | ${null}                                          | ${false}
    ${`fails if startingLocation doesn't match org/repo pattern`} | ${`critical-role`}                           | ${'fcg'}          | ${undefined} | ${undefined} | ${null}                                          | ${false}
  `(
    `redirects`,
    ({
      desc,
      startingLocation,
      branchSelection,
      ref,
      branch,
      expectedNewPath,
      isRedirectionEnabled,
    }) => {
      const [owner, repo] = startingLocation.split('/')
      beforeEach(() => {
        setup({
          useParamsValue: {
            repo,
            ref,
            owner,
            branch,
          },
          startingLocation,
        })
      })

      describe(`${desc}`, () => {
        it('starts with no new path', () => {
          expect(hookData.result.current.state.newPath).toEqual(undefined)
        })

        it('isRedirectionEnabled starts false', () => {
          expect(hookData.result.current.state.isRedirectionEnabled).toBeFalsy()
        })

        describe('on setNewPath fired', () => {
          beforeEach(() => {
            act(() => {
              hookData.result.current.setNewPath(branchSelection)
            })
          })

          it('A newPath is set', () => {
            expect(hookData.result.current.state.newPath).toBe(expectedNewPath)
          })

          it('isRedirectionEnabled is enabled', () => {
            expect(hookData.result.current.state.isRedirectionEnabled).toBe(
              isRedirectionEnabled
            )
          })
        })
      })
    }
  )
})
