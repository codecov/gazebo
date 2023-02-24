import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import IndirectChangesTable from './IndirectChangesTable'

jest.mock('./CommitFileView', () => () => 'CommitFileView')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
})
const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh']}>
      <Route path="/:provider">
        <Suspense fallback="Loading...">{children}</Suspense>
      </Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('IndirectChangesTable', () => {
  function setup(data = [], state = 'processed') {
    server.use(
      graphql.query('Commit', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: {
              repository: {
                commit: {
                  state,
                  compareWithParent: { impactedFiles: data },
                },
              },
            },
          })
        )
      )
    )
  }

  describe('when data is available', () => {
    beforeEach(() =>
      setup([
        {
          headName: 'src/index2.py',
          baseCoverage: {
            coverage: 62.5,
          },
          headCoverage: {
            coverage: 50.0,
          },
          patchCoverage: {
            coverage: 37.5,
          },
        },
      ])
    )

    it('renders name', async () => {
      render(<IndirectChangesTable />, { wrapper })

      const link = await screen.findByRole('link', {
        name: 'src/index2.py',
      })
      expect(link).toBeInTheDocument()
    })

    it('renders coverage', async () => {
      render(<IndirectChangesTable />, { wrapper })

      const coverage = await screen.findByText(/50.00%/)
      expect(coverage).toBeInTheDocument()
    })

    it('render change', async () => {
      render(<IndirectChangesTable />, { wrapper })

      const noData = await screen.findByText(/-12.50%/)
      expect(noData).toBeInTheDocument()
    })
  })

  describe('when all data is missing', () => {
    beforeEach(() => {
      setup([
        {
          headName: '',
          baseCoverage: {},
          headCoverage: {},
          patchCoverage: {},
        },
      ])
    })

    it('does not render coverage', () => {
      render(<IndirectChangesTable />, { wrapper })

      const coverage = screen.queryByText(/0.00%/)
      expect(coverage).not.toBeInTheDocument()
    })

    it('renders no available data copy', async () => {
      render(<IndirectChangesTable />, { wrapper })

      const copy = await screen.findByText('No data')
      expect(copy).toBeInTheDocument()
    })
  })

  describe('when some data is missing', () => {
    beforeEach(() => {
      setup([
        {
          headName: '',
          baseCoverage: {},
          headCoverage: {
            coverage: 67,
          },
          patchCoverage: {
            coverage: 98,
          },
        },
      ])
    })

    it('renders head coverage', async () => {
      render(<IndirectChangesTable />, { wrapper })

      const coverage = await screen.findByText(/67.00%/)
      expect(coverage).toBeInTheDocument()
    })

    it('renders dash for change', async () => {
      render(<IndirectChangesTable />, { wrapper })

      const dash = await screen.findByText('-')
      expect(dash).toBeInTheDocument()
    })
  })

  describe('when no changes', () => {
    beforeEach(() => {
      setup()
    })

    it('renders coverage', async () => {
      render(<IndirectChangesTable />, { wrapper })

      const coverage = await screen.findByText(
        'No files covered by tests were changed'
      )
      expect(coverage).toBeInTheDocument()
    })
  })

  describe('when impacted files are in pending state', () => {
    beforeEach(() => {
      setup([], 'pending')
    })

    it('renders spinner', async () => {
      render(<IndirectChangesTable />, { wrapper })

      const spinner = await screen.findByTestId('spinner')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('when expanding the name column', () => {
    beforeEach(() => {
      setup([
        {
          headName: 'src/index2.py',
          baseCoverage: {
            coverage: 62.5,
          },
          headCoverage: {
            coverage: 50.0,
          },
          patchCoverage: {
            coverage: 37.5,
          },
        },
      ])
    })

    it('renders the CommitFileView component', async () => {
      render(<IndirectChangesTable />, { wrapper })

      const nameExpander = await screen.findByText('src/index2.py')
      userEvent.click(nameExpander)

      const commitFileView = await screen.findByText('CommitFileView')
      expect(commitFileView).toBeInTheDocument()
    })
  })
})
