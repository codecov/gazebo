import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepoBranchContents } from './index'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/test']}>
    <Route path="/:provider/:owner/:repo">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

const dataReturned = {
  owner: {
    username: 'Rabee-AbuBaker',
    repository: {
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      branch: {
        head: {
          pathContents: {
            results: [
              {
                name: 'flag1',
                filePath: null,
                percentCovered: 100.0,
                type: 'dir',
              },
            ],
            __typename: 'PathContents',
          },
        },
      },
    },
  },
}

const mockDataUnknownPath = {
  owner: {
    username: 'codecov',
    repository: {
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      branch: {
        head: {
          pathContents: {
            message: 'path cannot be found',
          },
          __typename: 'UnknownPath',
        },
      },
    },
  },
}

const mockDataMissingCoverage = {
  owner: {
    username: 'codecov',
    repository: {
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      branch: {
        head: {
          pathContents: {
            message: 'files missing coverage',
          },
          __typename: 'MissingCoverage',
        },
      },
    },
  },
}

describe('useRepoBranchContents', () => {
  function setup(isMissingCoverage = false, isUnknownPath = false) {
    server.use(
      graphql.query('BranchContents', (req, res, ctx) => {
        if (isMissingCoverage) {
          return res(ctx.status(200), ctx.data(mockDataMissingCoverage))
        }
        if (isUnknownPath) {
          return res(ctx.status(200), ctx.data(mockDataUnknownPath))
        }
        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('renders isLoading true', () => {
      const { result } = renderHook(
        () =>
          useRepoBranchContents({
            provider: 'gh',
            owner: 'Rabee-AbuBaker',
            repo: 'another-test',
            branch: 'main',
            path: '',
          }),
        {
          wrapper,
        }
      )

      expect(result.current.isLoading).toBeTruthy()
    })

    describe('when data is loaded', () => {
      it('returns the data', async () => {
        const { result } = renderHook(
          () =>
            useRepoBranchContents({
              provider: 'gh',
              owner: 'Rabee-AbuBaker',
              repo: 'another-test',
              branch: 'main',
              path: '',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)
        await waitFor(() => result.current.isSuccess)

        expect(queryClient.getQueryState().data).toEqual(
          expect.objectContaining({
            results: [
              {
                name: 'flag1',
                filePath: null,
                percentCovered: 100.0,
                type: 'dir',
              },
            ],
            indicationRange: {
              upperRange: 80,
              lowerRange: 60,
            },
          })
        )
      })
    })

    describe('on missing coverage', () => {
      it('returns no results', async () => {
        setup(true)
        const { result } = renderHook(
          () =>
            useRepoBranchContents({
              provider: 'gh',
              owner: 'Rabee-AbuBaker',
              repo: 'another-test',
              branch: 'main',
              path: '',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)
        await waitFor(() => result.current.isSuccess)

        expect(result.current.data).toStrictEqual({
          __typename: 'MissingCoverage',
          indicationRange: {
            upperRange: 80,
            lowerRange: 60,
          },
          results: null,
        })
      })
    })

    describe('on unknown path', () => {
      it('returns no results', async () => {
        setup(false, true)
        const { result } = renderHook(
          () =>
            useRepoBranchContents({
              provider: 'gh',
              owner: 'Rabee-AbuBaker',
              repo: 'another-test',
              branch: 'main',
              path: '',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)
        await waitFor(() => result.current.isSuccess)

        expect(result.current.data).toStrictEqual({
          __typename: 'UnknownPath',
          indicationRange: {
            upperRange: 80,
            lowerRange: 60,
          },
          results: null,
        })
      })
    })
  })
})
