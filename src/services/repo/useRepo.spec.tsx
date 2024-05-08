import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'

import { useRepo } from './useRepo'

const mockRepo = {
  owner: {
    isCurrentUserPartOfOrg: true,
    isAdmin: null,
    isCurrentUserActivated: null,
    repository: {
      __typename: 'Repository',
      private: false,
      uploadToken: '9e6a6189-20f1-482d-ab62-ecfaa2629295',
      defaultBranch: 'main',
      yaml: '',
      activated: false,
      oldestCommitAt: '',
      active: true,
      isFirstPullRequest: false,
    },
  },
}

const mockNotFoundError = {
  owner: {
    isCurrentUserPartOfOrg: true,
    isAdmin: null,
    isCurrentUserActivated: null,
    repository: {
      __typename: 'NotFoundError',
      message: 'repo not found',
    },
  },
}

const mockOwnerNotActivatedError = {
  owner: {
    isCurrentUserPartOfOrg: true,
    isAdmin: null,
    isCurrentUserActivated: null,
    repository: {
      __typename: 'OwnerNotActivatedError',
      message: 'owner not activated',
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

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

describe('useRepo', () => {
  function setup({
    failedToParseError = false,
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
  }: {
    failedToParseError?: boolean
    isNotFoundError?: boolean
    isOwnerNotActivatedError?: boolean
  }) {
    server.use(
      graphql.query('GetRepo', (req, res, ctx) => {
        if (failedToParseError) {
          return res(ctx.status(200), ctx.data({}))
        } else if (isOwnerNotActivatedError) {
          return res(ctx.status(200), ctx.data(mockOwnerNotActivatedError))
        } else if (isNotFoundError) {
          return res(ctx.status(200), ctx.data(mockNotFoundError))
        }

        return res(ctx.status(200), ctx.data(mockRepo))
      })
    )
  }

  describe('calling hook', () => {
    it('returns the repository details successfully', async () => {
      setup({})
      const { result } = renderHook(
        () =>
          useRepo({
            provider: 'gh',
            owner: 'codecov',
            repo: 'cool-repo',
          }),
        { wrapper }
      )

      await waitFor(() => result.current.isSuccess)

      await waitFor(() =>
        expect(result.current.data).toEqual({
          isCurrentUserPartOfOrg: true,
          isAdmin: null,
          isCurrentUserActivated: null,
          repository: {
            __typename: 'Repository',
            private: false,
            uploadToken: '9e6a6189-20f1-482d-ab62-ecfaa2629295',
            defaultBranch: 'main',
            yaml: '',
            activated: false,
            oldestCommitAt: '',
            active: true,
            isFirstPullRequest: false,
          },
        })
      )
    })

    it('can return a failed to parse error', async () => {
      setup({ failedToParseError: true })
      const { result } = renderHook(
        () =>
          useRepo({
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
            dev: 'useRepo - 404 failed to parse',
          })
        )
      )
    })
    it('can return a not found error', async () => {
      setup({ isNotFoundError: true })
      const { result } = renderHook(
        () =>
          useRepo({
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
            dev: 'useRepo - 404 NotFoundError',
          })
        )
      )
    })
    it('returns a subset of data when owner not activated', async () => {
      setup({ isOwnerNotActivatedError: true })
      const { result } = renderHook(
        () =>
          useRepo({
            provider: 'gh',
            owner: 'codecov',
            repo: 'cool-repo',
          }),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.data).toEqual(
          expect.objectContaining({
            isCurrentUserActivated: false,
            repository: null,
            isRepoPrivate: true,
          })
        )
      )
    })
  })
})
