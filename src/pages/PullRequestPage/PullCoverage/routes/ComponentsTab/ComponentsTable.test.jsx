import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import ComponentsTable from './ComponentsTable'

vi.mock('./ComponentsNotConfigured', () => ({
  default: () => 'ComponentsNotConfigured',
}))

const queryClient = new QueryClient()
const server = setupServer()

const wrapper =
  (initialEntries = '/gh/codecov/gazebo/pull/123/components') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider/:owner/:repo/pull/:pullId/components">
          {children}
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
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

const mockPull = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        compareWithBase: {
          __typename: 'Comparison',
          componentComparisons: [
            {
              name: 'secondTest',
              headTotals: {
                percentCovered: 82.71,
              },
              baseTotals: {
                percentCovered: 80.0,
              },
              patchTotals: {
                percentCovered: 59.0,
              },
            },
          ],
        },
        head: {
          branchName: 'abc',
        },
      },
    },
  },
}

describe('ComponentsTable', () => {
  function setup(overrideData) {
    const componentsMock = jest.fn()

    server.use(
      graphql.query('PullComponentComparison', (info) => {
        if (info.variables?.filters?.components) {
          componentsMock(info.variables.filters.components)
        }

        if (overrideData) {
          return HttpResponse.json({ data: overrideData })
        }

        return HttpResponse.json({ data: mockPull })
      })
    )

    return { componentsMock }
  }

  describe('when there are no components in the new tab', () => {
    beforeEach(() => {
      setup({
        owner: null,
      })
    })

    it('will render card with no dismiss button', async () => {
      render(<ComponentsTable />, { wrapper: wrapper() })

      const componentNotConfigured = await screen.findByText(
        /ComponentsNotConfigured/
      )
      expect(componentNotConfigured).toBeInTheDocument()
    })
  })

  describe('when rendered with populated data in the new tab', () => {
    beforeEach(() => {
      setup()
    })

    it('shows title and body', async () => {
      render(<ComponentsTable />, { wrapper: wrapper() })

      const nameTableField = await screen.findByText(`Name`)
      expect(nameTableField).toBeInTheDocument()

      const headTableField = await screen.findByText(`HEAD %`)
      expect(headTableField).toBeInTheDocument()

      const patchTableField = await screen.findByText(`Patch %`)
      expect(patchTableField).toBeInTheDocument()

      const changeTableField = await screen.findByText(`Change %`)
      expect(changeTableField).toBeInTheDocument()

      const comparisonName = await screen.findByText('secondTest')
      expect(comparisonName).toBeInTheDocument()

      const comparisonHeadCoverage = await screen.findByText('82.71%')
      expect(comparisonHeadCoverage).toBeInTheDocument()

      const comparisonPatchCoverage = await screen.findByText('59.00%')
      expect(comparisonPatchCoverage).toBeInTheDocument()

      const comparisonChangeCoverage = await screen.findByText('2.71%')
      expect(comparisonChangeCoverage).toBeInTheDocument()
    })
  })

  describe('when rendered with components filter', () => {
    it('sends default params to the API', async () => {
      const { componentsMock } = setup()
      render(<ComponentsTable />, {
        wrapper: wrapper(
          '/gh/codecov/gazebo/pull/123/components?components%5B0%5D=component1&components%5B1%5D=component2'
        ),
      })

      await waitFor(() => {
        expect(componentsMock).toHaveBeenCalledWith([
          'component1',
          'component2',
        ])
      })
    })
  })

  describe('when loading', () => {
    it('renders spinner', () => {
      render(<ComponentsTable />, { wrapper: wrapper() })

      const spinner = screen.getByTestId('spinner')
      expect(spinner).toBeInTheDocument()
    })
  })
})
