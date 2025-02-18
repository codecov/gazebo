import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
// eslint-disable-next-line no-restricted-imports
import _ from 'lodash'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { type MockInstance } from 'vitest'

import { useFileWithMainCoverage } from 'services/pathContents'

const mockCommitDetails = {
  commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
  coverageAnalytics: {
    flagNames: ['a', 'b'],
    components: [{ id: 'dir_component', name: 'component' }],
    coverageFile: {
      hashedPath: 'hashedPath',

      content:
        'import pytest\nfrom path1 import index\n\ndef test_uncovered_if():\n    assert index.uncovered_if() == False\n\ndef test_fully_covered():\n    assert index.fully_covered() == True\n\n\n\n\n',
      coverage: [
        { line: 1, coverage: 'H' },
        { line: 2, coverage: 'H' },
        { line: 4, coverage: 'H' },
        { line: 5, coverage: 'H' },
        { line: 7, coverage: 'H' },
        { line: 8, coverage: 'H' },
      ],
      totals: {
        percentCovered: 100,
      },
    },
  },
}

const mockCommitCoverage = mockCommitDetails

const mockBranchCoverage = {
  name: 'master',
  head: mockCommitDetails,
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

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh']}>
    <Route path="/:provider">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const provider = 'gh'

const server = setupServer()

beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  sendBranchData?: boolean
  sendCommitData?: boolean
  isNotFoundError?: boolean
  isOwnerNotActivatedError?: boolean
  isUnsuccessfulParseError?: boolean
  isNullOwner?: boolean
}

describe('useFileWithMainCoverage', () => {
  function setup({
    sendBranchData = false,
    sendCommitData = false,
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    server.use(
      graphql.query('CoverageForFile', () => {
        if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivatedError })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else if (isNullOwner) {
          return HttpResponse.json({ data: mockNullOwner })
        } else {
          const mockCoverage = {
            owner: {
              repository: {
                __typename: 'Repository',
                branch: sendBranchData ? mockBranchCoverage : null,
                commit: sendCommitData ? mockCommitCoverage : null,
              },
            },
          }

          return HttpResponse.json({ data: mockCoverage })
        }
      })
    )
  }

  describe('when called for commit', () => {
    it('returns commit file coverage', async () => {
      setup({ sendCommitData: true })
      const { result } = renderHook(
        () =>
          useFileWithMainCoverage({
            provider,
            owner: 'codecov',
            repo: 'test-repo',
            path: 'path',
            ref: 'ref',
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() =>
        expect(result.current.data).toEqual({
          ...mockCommitCoverage.coverageAnalytics.coverageFile,
          totals: 100,
          flagNames: ['a', 'b'],
          componentNames: ['component'],
          coverage: _.chain(
            mockCommitCoverage.coverageAnalytics.coverageFile.coverage
          )
            .keyBy('line')
            .mapValues('coverage')
            .value(),
        })
      )
    })
  })

  describe('when called for branch', () => {
    it('returns branch file coverage', async () => {
      setup({ sendBranchData: true })
      const { result } = renderHook(
        () =>
          useFileWithMainCoverage({
            provider,
            owner: 'codecov',
            repo: 'test-repo',
            path: 'path',
            ref: 'ref',
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() =>
        expect(result.current.data).toEqual({
          ...mockBranchCoverage.head.coverageAnalytics.coverageFile,
          totals: 100,
          flagNames: ['a', 'b'],
          componentNames: ['component'],

          coverage: _.chain(
            mockBranchCoverage.head.coverageAnalytics.coverageFile.coverage
          )
            .keyBy('line')
            .mapValues('coverage')
            .value(),
        })
      )
    })
  })

  describe('returns null owner', () => {
    it('returns commit file coverage', async () => {
      setup({ isNullOwner: true })
      const { result } = renderHook(
        () =>
          useFileWithMainCoverage({
            provider,
            owner: 'codecov',
            repo: 'test-repo',
            path: 'path',
            ref: 'ref',
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() => expect(result.current.data).toEqual(null))
    })
  })

  describe('returns NotFoundError __typename', () => {
    let consoleSpy: MockInstance
    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('throws a 404', async () => {
      setup({ isNotFoundError: true })
      const { result } = renderHook(
        () =>
          useFileWithMainCoverage({
            provider,
            owner: 'codecov',
            repo: 'test-repo',
            path: 'path',
            ref: 'ref',
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'useFileWithMainCoverage - 404 NotFoundError',
          })
        )
      )
    })
  })

  describe('returns OwnerNotActivatedError __typename', () => {
    let consoleSpy: MockInstance
    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('throws a 403', async () => {
      setup({ isOwnerNotActivatedError: true })
      const { result } = renderHook(
        () =>
          useFileWithMainCoverage({
            provider,
            owner: 'codecov',
            repo: 'test-repo',
            path: 'path',
            ref: 'ref',
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 403,
            dev: 'useFileWithMainCoverage - 403 OwnerNotActivatedError',
          })
        )
      )
    })
  })

  describe('unsuccessful parse of zod schema', () => {
    let consoleSpy: MockInstance
    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('throws a 404', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(
        () =>
          useFileWithMainCoverage({
            provider,
            owner: 'codecov',
            repo: 'test-repo',
            path: 'path',
            ref: 'ref',
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'useFileWithMainCoverage - 404 schema parsing failed',
          })
        )
      )
    })
  })
})
