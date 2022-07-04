import { renderHook } from '@testing-library/react-hooks'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { useUploadPresignedUrl } from './hooks'

const downloadUrl =
  'v4/raw/2022-06-23/storage_hash/repo_hash/commit_id/file_name.txt'

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
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useUploadPresignedUrl', () => {
  let hookData

  function setup() {
    server.use(
      rest.get(`/upload/gh/codecov/test/download`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.text('presigned url'))
      })
    )
    hookData = renderHook(
      () => useUploadPresignedUrl({ pathUrl: downloadUrl }),
      {
        wrapper,
      }
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('renders isLoading true', () => {
      expect(hookData.result.current.isLoading).toBeTruthy()
    })

    describe('when data is loaded', () => {
      beforeEach(() => {
        return hookData.waitFor(() => hookData.result.current.isSuccess)
      })

      it('returns the data', () => {
        expect(hookData.result.current.data).toEqual('presigned url')
      })
    })
  })
})
