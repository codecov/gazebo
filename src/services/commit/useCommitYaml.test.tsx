import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useCommitYaml } from './useCommitYaml'

const mockCommitYaml = (yaml: string) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      commit: { commitid: 'asdf', yaml },
    },
  },
})

const mockCommitYamlBadSchema = {
  owner: { repository: { asdf: 'asdf' } },
}

const mockCommitYamlNotFound = {
  owner: {
    repository: {
      __typename: 'NotFoundError',
      message: 'Repository not found',
    },
  },
}

const mockCommitYamlOwnerNotActivated = {
  owner: {
    repository: {
      __typename: 'OwnerNotActivatedError',
      message: 'Owner not activated',
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh']}>
    <Route path="/:provider">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const server = setupServer()

console.error = () => null

beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  vi.useRealTimers()
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  badSchema?: boolean
  notFoundError?: boolean
  ownerNotActivatedError?: boolean
}

describe('useCommitYaml', () => {
  const yaml =
    'codecov:\n  max_report_age: false\n  require_ci_to_pass: true\ncomment:\n  behavior: default\n  layout: reach,diff,flags,tree,reach\n  show_carryforward_flags: false\ncoverage:\n  precision: 2\n  range:\n  - 70.0\n  - 100.0\n  round: down\n  status:\n    changes: false\n    default_rules:\n      flag_coverage_not_uploaded_behavior: include\n    patch:\n      default:\n        target: 80.0\n    project:\n      library:\n        paths:\n        - src/path1/.*\n        target: auto\n        threshold: 0.1\n      tests:\n        paths:\n        - src/path2/.*\n        target: 100.0\ngithub_checks:\n  annotations: true\n'

  function setup({
    badSchema = false,
    notFoundError = false,
    ownerNotActivatedError = false,
  }: SetupArgs) {
    server.use(
      graphql.query(`CommitYaml`, () => {
        if (badSchema) {
          return HttpResponse.json({ data: mockCommitYamlBadSchema })
        } else if (notFoundError) {
          return HttpResponse.json({ data: mockCommitYamlNotFound })
        } else if (ownerNotActivatedError) {
          return HttpResponse.json({ data: mockCommitYamlOwnerNotActivated })
        }
        return HttpResponse.json({ data: mockCommitYaml(yaml) })
      })
    )
  }

  describe('when called and user is authenticated', () => {
    it('returns commit info', async () => {
      setup({})
      const { result } = renderHook(
        () =>
          useCommitYaml({
            provider: 'gh',
            owner: 'febg',
            repo: 'repo-test',
            commitid: 'a23sda3',
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() => expect(result.current.data).toEqual(yaml))
    })
  })

  describe('when bad response', () => {
    it('returns 400 failed to parse', async () => {
      setup({ badSchema: true })
      const { result } = renderHook(
        () =>
          useCommitYaml({
            provider: 'gh',
            owner: 'febg',
            repo: 'repo-test',
            commitid: 'a23sda3',
          }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      expect(result.current.error).toEqual(
        expect.objectContaining({
          dev: 'useCommitYaml - Parsing Error',
          status: 400,
        })
      )
    })
  })

  describe('when repository not found error', () => {
    it('returns 404 not found', async () => {
      setup({ notFoundError: true })
      const { result } = renderHook(
        () =>
          useCommitYaml({
            provider: 'gh',
            owner: 'febg',
            repo: 'repo-test',
            commitid: 'a23sda3',
          }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      expect(result.current.error).toEqual(
        expect.objectContaining({
          dev: 'useCommitYaml - Not Found Error',
          status: 404,
        })
      )
    })
  })

  describe('when owner not activated error', () => {
    it('returns 403 owner not activated', async () => {
      setup({ ownerNotActivatedError: true })
      const { result } = renderHook(
        () =>
          useCommitYaml({
            provider: 'gh',
            owner: 'febg',
            repo: 'repo-test',
            commitid: 'a23sda3',
          }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      expect(result.current.error).toEqual(
        expect.objectContaining({
          dev: 'useCommitYaml - Owner Not Activated',
          status: 403,
        })
      )
    })
  })
})
