import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useRepoOverview } from './useRepoOverview'

const mockOverview = (language?: string) => {
  let languages: string[] = []
  if (language) {
    languages = [language]
  }

  return {
    owner: {
      repository: {
        __typename: 'Repository',
        private: false,
        defaultBranch: 'main',
        oldestCommitAt: '2022-10-10T11:59:59',
        coverageEnabled: true,
        bundleAnalysisEnabled: true,
        languages,
      },
    },
  }
}

const mockNotFoundError = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'NotFoundError',
      message: 'commit not found',
    },
  },
}

const mockOwnerNotActivatedError = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'OwnerNotActivatedError',
      message: 'owner not activated',
    },
  },
}

const mockNullOwner = {
  owner: null,
}

const mockUnsuccessfulParseError = {}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  isNotFoundError?: boolean
  isOwnerNotActivatedError?: boolean
  isUnsuccessfulParseError?: boolean
  isNullOwner?: boolean
  language?: string
}

describe('useRepoOverview', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
    language,
  }: SetupArgs) {
    server.use(
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        if (isNotFoundError) {
          return res(ctx.status(200), ctx.data(mockNotFoundError))
        } else if (isOwnerNotActivatedError) {
          return res(ctx.status(200), ctx.data(mockOwnerNotActivatedError))
        } else if (isUnsuccessfulParseError) {
          return res(ctx.status(200), ctx.data(mockUnsuccessfulParseError))
        } else if (isNullOwner) {
          return res(ctx.status(200), ctx.data(mockNullOwner))
        }
        return res(ctx.status(200), ctx.data(mockOverview(language)))
      })
    )
  }

  describe('returns repository typename of Repository', () => {
    describe('there is valid data', () => {
      it('fetches the repo overview', async () => {
        setup({})
        const { result } = renderHook(
          () =>
            useRepoOverview({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
            }),
          { wrapper }
        )

        await waitFor(() =>
          expect(result.current.data).toStrictEqual({
            __typename: 'Repository',
            private: false,
            defaultBranch: 'main',
            oldestCommitAt: '2022-10-10T11:59:59',
            coverageEnabled: true,
            bundleAnalysisEnabled: true,
            languages: [],
            jsOrTsPresent: false,
          })
        )
      })

      describe('javascript is in the languages array', () => {
        it('returns jsOrTsPresent as true', async () => {
          setup({ language: 'javascript' })
          const { result } = renderHook(
            () =>
              useRepoOverview({
                provider: 'gh',
                owner: 'codecov',
                repo: 'cool-repo',
              }),
            { wrapper }
          )

          await waitFor(() =>
            expect(result.current.data).toStrictEqual({
              __typename: 'Repository',
              private: false,
              defaultBranch: 'main',
              oldestCommitAt: '2022-10-10T11:59:59',
              coverageEnabled: true,
              bundleAnalysisEnabled: true,
              languages: ['javascript'],
              jsOrTsPresent: true,
            })
          )
        })
      })

      describe('typescript is in the languages array', () => {
        it('returns jsOrTsPresent as true', async () => {
          setup({ language: 'typescript' })
          const { result } = renderHook(
            () =>
              useRepoOverview({
                provider: 'gh',
                owner: 'codecov',
                repo: 'cool-repo',
              }),
            { wrapper }
          )

          await waitFor(() =>
            expect(result.current.data).toStrictEqual({
              __typename: 'Repository',
              private: false,
              defaultBranch: 'main',
              oldestCommitAt: '2022-10-10T11:59:59',
              coverageEnabled: true,
              bundleAnalysisEnabled: true,
              languages: ['typescript'],
              jsOrTsPresent: true,
            })
          )
        })
      })
    })

    describe('there is a null owner', () => {
      it('returns a null value', async () => {
        setup({ isNullOwner: true })
        const { result } = renderHook(
          () =>
            useRepoOverview({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
            }),
          { wrapper }
        )

        await waitFor(() => expect(result.current.data).toBeNull())
      })
    })
  })

  describe('returns NotFoundError __typename', () => {
    let oldConsoleError = console.error

    beforeEach(() => {
      console.error = () => null
    })

    afterEach(() => {
      console.error = oldConsoleError
    })

    it('throws a 404', async () => {
      setup({ isNotFoundError: true })
      const { result } = renderHook(
        () =>
          useRepoOverview({
            provider: 'gh',
            owner: 'codecov',
            repo: 'cool-repo',
          }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
          })
        )
      )
    })
  })

  describe('returns OwnerNotActivatedError __typename', () => {
    let oldConsoleError = console.error

    beforeEach(() => {
      console.error = () => null
    })

    afterEach(() => {
      console.error = oldConsoleError
    })

    it('throws a 403', async () => {
      setup({ isOwnerNotActivatedError: true })
      const { result } = renderHook(
        () =>
          useRepoOverview({
            provider: 'gh',
            owner: 'codecov',
            repo: 'cool-repo',
          }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 403,
          })
        )
      )
    })
  })

  describe('unsuccessful parse of zod schema', () => {
    let oldConsoleError = console.error

    beforeEach(() => {
      console.error = () => null
    })

    afterEach(() => {
      console.error = oldConsoleError
    })

    it('throws a 404', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(
        () =>
          useRepoOverview({
            provider: 'gh',
            owner: 'codecov',
            repo: 'cool-repo',
          }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
          })
        )
      )
    })
  })
})
