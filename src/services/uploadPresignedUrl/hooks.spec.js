import { renderHook } from '@testing-library/react-hooks'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { useUploadPresignedUrl } from './hooks'

const downloadUrl =
  'v4/raw/2022-06-23/storage_hash/repo_hash/commit_id/file_name.txt'
  
const mockedPresignedUrl = {presignedUrl: "http://minio:9000/archive/v4/raw/2022-06-23/942173DE95CBF167C5683F40B7DB34C0/ee3ecad424e67419d6c4531540f1ef5df045ff12/919ccc6d-7972-4895-b289-f2d569683a17.txt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=codecov-default-key%2F20220705%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220705T101702Z&X-Amz-Expires=10&X-Amz-SignedHeaders=host&X-Amz-Signature=8846492d85f62187493cbff3631ec7f0ccf2d355f768eecf294f0572cf758e4c"}

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
      rest.get(downloadUrl, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockedPresignedUrl))
      })
    )
    hookData = renderHook(
      () => useUploadPresignedUrl({ path: downloadUrl }),
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
        expect(hookData.result.current.data).toEqual(mockedPresignedUrl)
      })
    })
  })
})
