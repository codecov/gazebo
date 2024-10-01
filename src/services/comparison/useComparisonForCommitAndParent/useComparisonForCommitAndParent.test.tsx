import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import React from 'react'
import { type MockInstance } from 'vitest'

import { useComparisonForCommitAndParent } from './useComparisonForCommitAndParent'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const provider = 'gh'
const owner = 'codecov'
const repo = 'gazebo'
const commitid = 'sha123'

const mockImpactedFile = {
  headName: 'flag1/file.js',
  hashedPath: 'hashedFilePath',
  isCriticalFile: false,
  isNewFile: false,
  isRenamedFile: false,
  isDeletedFile: false,
  baseCoverage: {
    coverage: 100,
  },
  headCoverage: {
    coverage: 100,
  },
  patchCoverage: {
    coverage: 100,
  },
  changeCoverage: 0,
  segments: {
    results: [
      {
        header: '-0,0 +1,45',
        hasUnintendedChanges: false,
        lines: [
          {
            baseNumber: null,
            headNumber: '1',
            baseCoverage: null,
            headCoverage: 'H',
            content: '+export default class Calculator {',
            coverageInfo: {
              hitCount: null,
              hitUploadIds: null,
            },
          },
          {
            baseNumber: null,
            headNumber: '2',
            baseCoverage: null,
            headCoverage: 'H',
            content: '+  private value = 0;',
            coverageInfo: {
              hitCount: 1,
              hitUploadIds: [1],
            },
          },
          {
            baseNumber: null,
            headNumber: '3',
            baseCoverage: null,
            headCoverage: 'H',
            content: '+  private calcMode = ""',
            coverageInfo: {
              hitCount: null,
              hitUploadIds: null,
            },
          },
        ],
      },
    ],
  },
}

const baseMock = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        compareWithParent: {
          __typename: 'Comparison',
          impactedFile: {
            ...mockImpactedFile,
          },
        },
      },
    },
  },
}

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

interface SetupArgs {
  isNotFoundError?: boolean
  isOwnerNotActivatedError?: boolean
  isUnsuccessfulParseError?: boolean
}

const mockNotFoundError = {
  owner: {
    repository: {
      __typename: 'NotFoundError',
      message: 'commit not found',
    },
  },
}

const mockOwnerNotActivatedError = {
  owner: {
    repository: {
      __typename: 'OwnerNotActivatedError',
      message: 'owner not activated',
    },
  },
}

const mockUnsuccessfulParseError = {}

describe('useComparisonForCommitAndParent', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
  }: SetupArgs) {
    server.use(
      graphql.query('ImpactedFileComparedWithParent', (info) => {
        if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivatedError })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else {
          return HttpResponse.json({ data: baseMock })
        }
      })
    )
  }

  describe('when called', () => {
    it('returns the data', async () => {
      setup({})
      const { result } = renderHook(
        () =>
          useComparisonForCommitAndParent({
            provider,
            owner,
            repo,
            commitid,
            path: 'someFile.js',
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => expect(result.current.data.data).toEqual(baseMock))
    })
  })

  describe('when called and error', () => {
    let consoleSpy: MockInstance

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => null)
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('can return unsuccessful parse error', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(
        () =>
          useComparisonForCommitAndParent({
            provider,
            owner,
            repo,
            commitid,
            path: 'someFile.js',
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
          })
        )
      )
    })

    it('can return not found error', async () => {
      setup({ isNotFoundError: true })
      const { result } = renderHook(
        () =>
          useComparisonForCommitAndParent({
            provider,
            owner,
            repo,
            commitid,
            path: 'someFile.js',
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
          })
        )
      )
    })

    it('can return owner not activated error', async () => {
      setup({ isOwnerNotActivatedError: true })
      const { result } = renderHook(
        () =>
          useComparisonForCommitAndParent({
            provider,
            owner,
            repo,
            commitid,
            path: 'someFile.js',
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
          })
        )
      )
    })
  })
})
