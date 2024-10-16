import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MockInstance } from 'vitest'

import { useRepoOverview } from './useRepoOverview'

const mockOverview = (language?: string) => {
  let languages: string[] = []
  if (language) {
    languages = [language]
  }

  return {
    owner: {
      isCurrentUserActivated: true,
      repository: {
        __typename: 'Repository',
        private: false,
        defaultBranch: 'main',
        oldestCommitAt: '2022-10-10T11:59:59',
        coverageEnabled: true,
        bundleAnalysisEnabled: true,
        languages,
        testAnalyticsEnabled: true,
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

const mockNullOwner = {
  owner: null,
}

const mockUnsuccessfulParseError = {}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const server = setupServer()
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
  isUnsuccessfulParseError?: boolean
  isNullOwner?: boolean
  language?: string
}

describe('useRepoOverview', () => {
  function setup({
    isNotFoundError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
    language,
  }: SetupArgs) {
    server.use(
      graphql.query('GetRepoOverview', (info) => {
        if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else if (isNullOwner) {
          return HttpResponse.json({ data: mockNullOwner })
        }
        return HttpResponse.json({ data: mockOverview(language) })
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
            testAnalyticsEnabled: true,
            isCurrentUserActivated: true,
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
              testAnalyticsEnabled: true,
              isCurrentUserActivated: true,
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
              testAnalyticsEnabled: true,
              isCurrentUserActivated: true,
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
    let consoleSpy: MockInstance
    beforeAll(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      consoleSpy.mockRestore()
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

      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
          })
        )
      )
    })
  })

  describe('unsuccessful parse of zod schema', () => {
    let consoleSpy: MockInstance
    beforeAll(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      consoleSpy.mockRestore()
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
