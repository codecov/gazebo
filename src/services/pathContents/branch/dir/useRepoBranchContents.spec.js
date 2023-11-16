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
          },
          __typename: 'PathContents',
        },
      },
    },
  },
}

describe('useRepoBranchContents', () => {
  function setup() {
    server.use(
      graphql.query('BranchContents', (req, res, ctx) => {
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

        const expectedResponse = {
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
          __typename: 'PathContents',
        }

        await waitFor(() =>
          expect(result.current.data).toEqual(expectedResponse)
        )
      })
    })
  })
})
