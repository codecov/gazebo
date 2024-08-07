import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import NameColumn from './NameColumn'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const mockSingularImpactedFilesData = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        compareWithBase: {
          __typename: 'Comparison',
          impactedFile: {
            headName: 'file A',
            hashedPath: 'hashed-path',
            isNewFile: true,
            isRenamedFile: false,
            isDeletedFile: false,
            isCriticalFile: false,
            headCoverage: {
              percentCovered: 90.23,
            },
            baseCoverage: {
              percentCovered: 23.42,
            },
            patchCoverage: {
              percentCovered: 27.43,
            },
            changeCoverage: 58.333333333333336,
            segments: {
              results: [
                {
                  header: '@@ -0,0 1,45 @@',
                  hasUnintendedChanges: false,
                  lines: [
                    {
                      baseNumber: null,
                      headNumber: '1',
                      baseCoverage: null,
                      headCoverage: 'H',
                      content: 'export default class Calculator {',
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    },
  },
}

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

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/test-org/test-repo/pull/12']}>
      <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('NameColumn', () => {
  function setup() {
    const user = userEvent.setup()

    server.use(
      graphql.query('ImpactedFileComparison', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockSingularImpactedFilesData))
      )
    )

    return { user }
  }

  describe('when component is not expanded', () => {
    it('renders value', async () => {
      setup()
      const getValue = jest.fn()
      getValue.mockImplementation(() => 'file.ts')

      const row = {
        getValue: jest.fn().mockImplementation(() => ({
          props: {
            children: ['file.ts'],
          },
        })),
        getIsExpanded: jest.fn().mockImplementation(() => false),
      }

      render(<NameColumn row={row} getValue={getValue} />, { wrapper })

      const name = screen.getByText('file.ts')
      expect(name).toBeInTheDocument()
    })

    it('prefetches query data', async () => {
      const { user } = setup()
      const getValue = jest.fn()
      getValue.mockImplementation(() => 'file.ts')

      const row = {
        getValue: jest.fn().mockImplementation(() => ({
          props: {
            children: ['file.ts'],
          },
        })),
        getIsExpanded: jest.fn().mockImplementation(() => false),
      }

      render(<NameColumn row={row} getValue={getValue} />, { wrapper })

      const expander = await screen.findByTestId('name-expand')
      await user.hover(expander)

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      await waitFor(() =>
        expect(queryClient.getQueryData()).toStrictEqual({
          fileLabel: 'New',
          headName: 'file A',
          hashedPath: 'hashed-path',
          isCriticalFile: false,
          segments: [
            {
              header: '@@ -0,0 1,45 @@',
              hasUnintendedChanges: false,
              lines: [
                {
                  baseCoverage: null,
                  baseNumber: null,
                  content: 'export default class Calculator {',
                  headCoverage: 'H',
                  headNumber: '1',
                },
              ],
            },
          ],
        })
      )
    })
  })

  describe('when component is expanded', () => {
    it('renders value', async () => {
      setup()
      const getValue = jest.fn()
      getValue.mockImplementation(() => 'file.ts')

      const row = {
        getValue: jest.fn().mockImplementation(() => ({
          props: {
            children: ['file.ts'],
          },
        })),
        getIsExpanded: jest.fn().mockImplementation(() => true),
      }

      render(<NameColumn row={row} getValue={getValue} />, { wrapper })

      const name = screen.getByText('file.ts')
      expect(name).toBeInTheDocument()
    })

    it('prefetches query data', async () => {
      const { user } = setup()
      const getValue = jest.fn()
      getValue.mockImplementation(() => 'file.ts')

      const row = {
        getValue: jest.fn().mockImplementation(() => ({
          props: {
            children: ['file.ts'],
          },
        })),
        getIsExpanded: jest.fn().mockImplementation(() => true),
      }

      render(<NameColumn row={row} getValue={getValue} />, { wrapper })

      const expander = await screen.findByTestId('name-expand')
      await user.hover(expander)

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      await waitFor(() => expect(queryClient.getQueryData()).toBe(undefined))
    })
  })
})
