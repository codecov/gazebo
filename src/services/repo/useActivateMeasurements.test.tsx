import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { type MockInstance } from 'vitest'

import { MEASUREMENT_TYPE, useActivateMeasurements } from './index'

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

describe('useActivateMeasurements', () => {
  function setup() {
    server.use(
      graphql.mutation('ActivateMeasurements', (info) => {
        return HttpResponse.json({ data: { activateMeasurements: null } })
      })
    )
  }

  describe('when called', () => {
    describe('When success', () => {
      it('returns expected output', async () => {
        setup()
        const { result } = renderHook(
          () =>
            useActivateMeasurements({
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
      let consoleSpy: MockInstance
      beforeAll(() => {
        consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      })

      afterAll(() => {
        consoleSpy.mockRestore()
      })

      it('returns expected output', async () => {
        server.use(
          graphql.mutation('ActivateMeasurements', (info) => {
            return HttpResponse.json({
              data: {
                activateMeasurements: {
                  error: {
                    __typename: 'ValidationError',
                    message: 'Some error message',
                  },
                },
              },
            })
          })
        )

        const { result } = renderHook(
          () =>
            useActivateMeasurements({
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
      let consoleSpy: MockInstance
      beforeAll(() => {
        consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      })

      afterAll(() => {
        consoleSpy.mockRestore()
      })

      it('returns expected output', async () => {
        server.use(
          graphql.mutation('ActivateMeasurements', (info) => {
            return HttpResponse.json({
              data: {
                activateMeasurements: {
                  error: {
                    __typename: 'ValidationError',
                    message: 123,
                  },
                },
              },
            })
          })
        )

        const { result } = renderHook(
          () =>
            useActivateMeasurements({
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
            dev: 'useActivateMeasurements - 404 failed to parse',
            status: 404,
          })
        )
      })
    })
  })
})
