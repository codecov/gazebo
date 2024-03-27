import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { MEASUREMENT_TYPE, useActivateFlagMeasurements } from './index'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const server = setupServer()

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useActivateFlagMeasurements', () => {
  function setup() {
    server.use(
      graphql.mutation('ActivateMeasurements', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            activateMeasurements: null,
          })
        )
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    describe('When success', () => {
      it('returns expected output', async () => {
        const { result } = renderHook(
          () =>
            useActivateFlagMeasurements({
              provider: 'gh',
              owner: 'dancer',
              repo: 'bassuras',
              measurementType: MEASUREMENT_TYPE.FLAG_COVERAGE,
            }),
          {
            wrapper,
          }
        )

        result.current.mutate()

        await waitFor(() =>
          expect(result.current.data).toEqual({
            data: {
              activateMeasurements: null,
            },
          })
        )
      })
    })

    describe('When error', () => {
      it('returns expected output', async () => {
        server.use(
          graphql.mutation('ActivateMeasurements', (req, res, ctx) => {
            return res(
              ctx.status(200),
              ctx.data({
                activateMeasurements: {
                  error: {
                    __typename: 'ValidationError',
                    message: 'Some error message',
                  },
                },
              })
            )
          })
        )

        const { result } = renderHook(
          () =>
            useActivateFlagMeasurements({
              provider: 'gh',
              owner: 'dancer',
              repo: 'bassuras',
              measurementType: MEASUREMENT_TYPE.FLAG_COVERAGE,
            }),
          {
            wrapper,
          }
        )

        result.current.mutate()

        await waitFor(() =>
          expect(result.current.error).toEqual(new Error('Some error message'))
        )
      })
    })

    describe('when schema validation fails', () => {
      it('returns expected output', async () => {
        server.use(
          graphql.mutation('ActivateMeasurements', (req, res, ctx) => {
            return res(
              ctx.status(200),
              ctx.data({
                activateMeasurements: {
                  error: {
                    __typename: 'ValidationError',
                    message: 123,
                  },
                },
              })
            )
          })
        )

        const { result } = renderHook(
          () =>
            useActivateFlagMeasurements({
              provider: 'gh',
              owner: 'dancer',
              repo: 'bassuras',
              measurementType: MEASUREMENT_TYPE.FLAG_COVERAGE,
            }),
          {
            wrapper,
          }
        )

        result.current.mutate()

        await waitFor(() =>
          expect(result.current.error).toEqual({
            data: {},
            dev: 'useActivateFlagMeasurements - 404 failed to parse',
            status: 404,
          })
        )
      })
    })
  })
})
