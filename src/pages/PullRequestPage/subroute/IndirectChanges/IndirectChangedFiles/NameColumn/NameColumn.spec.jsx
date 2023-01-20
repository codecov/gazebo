import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import NameColumn from './NameColumn'

const queryClient = new QueryClient()
const server = setupServer()

const mockSingularImpactedFilesData = {
  owner: {
    repository: {
      pull: {
        compareWithBase: {
          impactedFile: {
            headName: 'file A',
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
            segments: [
              {
                header: '@@ -0,0 1,45 @@',
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
  const row = {}
  const getValue = jest.fn()

  function setup({ isExpanded = false }) {
    server.use(
      graphql.query('ImpactedFileComparison', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockSingularImpactedFilesData))
      )
    )

    getValue.mockImplementation(() => 'file.ts')
    row.getValue = jest.fn().mockImplementation(() => ({
      props: {
        children: ['file.ts'],
      },
    }))
    row.getIsExpanded = jest.fn().mockImplementation(() => isExpanded)
  }

  describe('when component is not expanded', () => {
    beforeEach(() => {
      setup({})
    })

    it('renders value', async () => {
      render(<NameColumn row={row} getValue={getValue} />, { wrapper })

      const name = screen.getByText('file.ts')
      expect(name).toBeInTheDocument()
    })

    it('prefetches query data', async () => {
      render(<NameColumn row={row} getValue={getValue} />, { wrapper })

      const expander = await screen.findByTestId('name-expand')
      userEvent.hover(expander)

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      await waitFor(() =>
        expect(queryClient.getQueryData()).toStrictEqual({
          fileLabel: 'New',
          headName: 'file A',
          isCriticalFile: false,
          segments: [
            {
              header: '@@ -0,0 1,45 @@',
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
    beforeEach(() => {
      setup({ isExpanded: true })
    })

    it('renders value', async () => {
      render(<NameColumn row={row} getValue={getValue} />, { wrapper })

      const name = screen.getByText('file.ts')
      expect(name).toBeInTheDocument()
    })

    it('prefetches query data', async () => {
      render(<NameColumn row={row} getValue={getValue} />, { wrapper })

      const expander = await screen.findByTestId('name-expand')
      userEvent.hover(expander)

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      await waitFor(() => expect(queryClient.getQueryData()).toBe(undefined))
    })
  })
})
