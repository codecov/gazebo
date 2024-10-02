import {
  act,
  renderHook,
  RenderHookResult,
  waitFor,
} from '@testing-library/react'

import {
  useCoverageRedirect,
  UseCoverageRedirectState,
} from './useCoverageRedirect'

const mocks = vi.hoisted(() => ({
  useParams: vi.fn(),
  useLocation: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual = vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: mocks.useParams,
    useLocation: mocks.useLocation,
  }
})

describe('useCoverageRedirect', () => {
  let hookData: RenderHookResult<
    {
      setNewPath: (path: string) => void
      redirectState: UseCoverageRedirectState
    },
    unknown
  >

  function setup({ useParamsValue = {}, startingLocation = 'some/path' }) {
    mocks.useParams.mockReturnValue(useParamsValue)
    mocks.useLocation.mockReturnValue({ pathname: startingLocation })

    // TODO: move this into the it() blocks rather than in setup function per RTL best practices.
    hookData = renderHook(() => useCoverageRedirect())
  }

  describe.each`
    desc                                                          | startingLocation                            | branchSelection        | branch       | ref          | expectedNewPath                                  | isRedirectionEnabled
    ${`from root`}                                                | ${`critical-role/c3`}                       | ${'chetney'}           | ${undefined} | ${undefined} | ${'critical-role/c3/tree/chetney'}               | ${true}
    ${`from root (manual extra /)`}                               | ${`critical-role/c3/`}                      | ${'chetney'}           | ${undefined} | ${undefined} | ${'critical-role/c3/tree/chetney'}               | ${true}
    ${`from a file view`}                                         | ${`critical-role/c3/blob/chetney/foo/bar`}  | ${'blood-hunter'}      | ${undefined} | ${'chetney'} | ${'critical-role/c3/blob/blood-hunter/foo/bar'}  | ${true}
    ${`from a file view (manual extra /)`}                        | ${`critical-role/c3/blob/chetney/foo/bar/`} | ${'blood-hunter'}      | ${undefined} | ${'chetney'} | ${'critical-role/c3/blob/blood-hunter/foo/bar'}  | ${true}
    ${`from a tree view`}                                         | ${`critical-role/c3/tree/laudna/foo/bar`}   | ${'chetney'}           | ${'laudna'}  | ${undefined} | ${'critical-role/c3/tree/chetney/foo/bar'}       | ${true}
    ${`from a tree view (manual extra /)`}                        | ${`critical-role/c3/tree/laudna/foo/bar/`}  | ${'chetney'}           | ${'laudna'}  | ${undefined} | ${'critical-role/c3/tree/chetney/foo/bar'}       | ${true}
    ${`fails if no new branch selected`}                          | ${`critical-role`}                          | ${undefined}           | ${undefined} | ${`wizard`}  | ${null}                                          | ${false}
    ${`fails if no params and no new selection`}                  | ${`critical-role/c3`}                       | ${undefined}           | ${undefined} | ${undefined} | ${null}                                          | ${false}
    ${`fails if startingLocation doesn't match org/repo pattern`} | ${`critical-role`}                          | ${'fcg'}               | ${undefined} | ${undefined} | ${null}                                          | ${false}
    ${`encodes branch with slash`}                                | ${`critical-role/c3/tree/laudna`}           | ${'branch/with/slash'} | ${'laudna'}  | ${undefined} | ${'critical-role/c3/tree/branch%2Fwith%2Fslash'} | ${true}
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
          expect(hookData.result.current.redirectState.newPath).toEqual(
            undefined
          )
        })

        it('resets state on layout change', async () => {
          hookData.rerender()
          await waitFor(() =>
            expect(
              hookData.result.current.redirectState.newPath
            ).toBeUndefined()
          )
          await waitFor(() =>
            expect(
              hookData.result.current.redirectState.isRedirectionEnabled
            ).toBeFalsy()
          )
        })

        it('isRedirectionEnabled starts false', () => {
          expect(
            hookData.result.current.redirectState.isRedirectionEnabled
          ).toBeFalsy()
        })

        describe('on setNewPath fired', () => {
          beforeEach(() => {
            act(() => {
              hookData.result.current.setNewPath(branchSelection)
            })
          })

          it('A newPath is set', () => {
            expect(hookData.result.current.redirectState.newPath).toBe(
              expectedNewPath
            )
          })

          it('isRedirectionEnabled is enabled', () => {
            expect(
              hookData.result.current.redirectState.isRedirectionEnabled
            ).toBe(isRedirectionEnabled)
          })
        })
      })
    }
  )
})
