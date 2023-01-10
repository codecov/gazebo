import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepoBranchContents } from './index'

const queryClient = new QueryClient()

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/test']}>
    <Route path="/:provider/:owner/:repo">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useRepoContents', () => {
  const dataReturned = {
    owner: {
      username: 'Rabee-AbuBaker',
      repository: {
        branch: {
          head: {
            pathContents: [
              {
                name: 'flag1',
                filePath: null,
                percentCovered: 100.0,
                type: 'dir',
              },
            ],
          },
        },
      },
    },
  }

  function setup() {
    server.use(
      graphql.query('BranchContents', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )
  }

  describe('when called', () => {
    const expectedResponse = [
      {
        name: 'flag1',
        filePath: null,
        percentCovered: 100.0,
        type: 'dir',
      },
    ]

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
        const { result, waitFor } = renderHook(
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

        await waitFor(() =>
          expect(result.current.data).toEqual(expectedResponse)
        )
      })
    })
  })
})
