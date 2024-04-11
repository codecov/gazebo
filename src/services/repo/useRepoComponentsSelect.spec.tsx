import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import A from 'ui/A'

import { useRepoComponentsSelect } from './useRepoComponentsSelect'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo/flags']}>
    <Route path="/:provider/:owner/:repo/flags">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const dataReturned = {
  owner: {
    repository: {
      __typename: 'Repository',
      componentsYaml: [
        {
          name: 'foo',
          id: '1',
        },
        {
          name: 'bar',
          id: '2',
        },
      ],
    },
  },
}

describe('RepoComponentsYamlSelector', () => {
  function setup({
    isSchemaInvalid = false,
    isOwnerActivationError = false,
    isNotFoundError = false,
  } = {}) {
    server.use(
      graphql.query('RepoComponentsSelector', (req, res, ctx) => {
        if (isSchemaInvalid) {
          return res(ctx.status(200), ctx.data({}))
        }

        if (isOwnerActivationError) {
          return res(
            ctx.status(200),
            ctx.data({
              owner: {
                repository: {
                  __typename: 'OwnerNotActivatedError',
                  message: 'Owner not activated',
                },
              },
            })
          )
        }

        if (isNotFoundError) {
          return res(
            ctx.status(200),
            ctx.data({
              owner: {
                repository: {
                  __typename: 'NotFoundError',
                  message: 'Repo not found',
                },
              },
            })
          )
        }

        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    describe('when data is loaded', () => {
      it('returns the data', async () => {
        const { result } = renderHook(
          () =>
            useRepoComponentsSelect({
              termId: 'foo',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(result.current.data).toEqual({
            components: dataReturned.owner.repository.componentsYaml,
          })
        )
      })
    })
  })

  describe('when the schema is invalid', () => {
    beforeEach(() => {
      setup({ isSchemaInvalid: true })
    })

    it('returns an error', async () => {
      const { result } = renderHook(() => useRepoComponentsSelect(), {
        wrapper,
      })

      await waitFor(() =>
        expect(result.current.error).toEqual({
          status: 404,
          data: {},
          dev: 'useRepoComponentsSelect - 404 Error parsing repo components data',
        })
      )
    })
  })

  describe('when repo is not found', () => {
    beforeEach(() => {
      setup({ isNotFoundError: true })
    })

    it('returns an error', async () => {
      const { result } = renderHook(() => useRepoComponentsSelect(), {
        wrapper,
      })

      await waitFor(() =>
        expect(result.current.error).toEqual({
          status: 404,
          data: {},
          dev: 'useRepoComponentsSelect - 404 RepoNotFoundError',
        })
      )
    })
  })

  describe('when owner is not activated', () => {
    beforeEach(() => {
      setup({ isOwnerActivationError: true })
    })

    it('returns an error', async () => {
      const { result } = renderHook(() => useRepoComponentsSelect(), {
        wrapper,
      })

      await waitFor(() =>
        expect(result.current.error).toEqual({
          status: 403,
          data: {
            detail: (
              <p>
                Activation is required to view this repo, please{' '}
                <A
                  to={{ pageName: 'membersTab' }}
                  hook="members-page-link"
                  isExternal={false}
                >
                  click here{' '}
                </A>{' '}
                to activate your account.
              </p>
            ),
          },
          dev: 'useRepoComponentsSelect - 403 OwnerNotActivatedError',
        })
      )
    })
  })
})
