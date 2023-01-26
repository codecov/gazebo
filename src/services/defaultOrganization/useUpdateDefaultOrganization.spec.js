// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { renderHook } from '@testing-library/react-hooks'
// import { graphql } from 'msw'
// import { setupServer } from 'msw/node'
// import { MemoryRouter, Route } from 'react-router-dom'

// import { useUpdateDefaultOrganization } from './useUpdateDefaultOrganization'

// const data = {
//   data: {
//     regenerateOrgUploadToken: {
//       orgUploadToken: 'new token',
//     },
//   },
// }

// const server = setupServer()

// beforeAll(() => server.listen())
// afterEach(() => server.resetHandlers())
// afterAll(() => server.close())

// const queryClient = new QueryClient()
// const wrapper = ({ children }) => (
//   <MemoryRouter initialEntries={['/gh/codecov']}>
//     <Route path="/:provider/:owner/">
//       <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
//     </Route>
//   </MemoryRouter>
// )

// describe('useUpdateDefaultOrganization', () => {
//   let hookData

//   function setup() {
//     server.use(
//       graphql.mutation('updateDefaultOrganization', (req, res, ctx) => {
//         return res(ctx.status(200))
//       })
//     )
//     hookData = renderHook(() => useUpdateDefaultOrganization(), {
//       wrapper,
//     })
//   }

//   describe('when called', () => {
//     beforeEach(() => {
//       setup()
//     })

//     it('returns isLoading false', () => {
//       expect(hookData.result.current.isLoading).toBeFalsy()
//     })

//     describe('when calling the mutation', () => {
//       beforeEach(() => {
//         hookData.result.current.mutate({ username: 'codecov' })
//         return hookData.waitFor(() => hookData.result.current.status !== 'idle')
//       })

//       it('returns isLoading true', () => {
//         expect(hookData.result.current.isLoading).toBeTruthy()
//       })
//     })

//     describe('When mutation is a success', () => {
//       beforeEach(async () => {
//         hookData.result.current.mutate()
//         await hookData.waitFor(() => hookData.result.current.isLoading)
//         await hookData.waitFor(() => !hookData.result.current.isLoading)
//       })

//       it('returns isSuccess true', () => {
//         expect(hookData.result.current.isSuccess).toBeTruthy()
//       })
//     })
//   })
// })
