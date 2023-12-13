import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useFlags } from 'shared/featureFlags'

import ComponentsTab from './ComponentsTab'

jest.mock('./ComponentsNotConfigured', () => () => 'ComponentsNotConfigured')
jest.mock('../ComponentsSelector', () => () => 'ComponentsSelector')
jest.mock('shared/featureFlags')

const queryClient = new QueryClient()
const server = setupServer()

const wrapper =
  (initialEntries = '/gh/codecov/gazebo/pull/123/components') =>
  ({ children }) =>
    (
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
      },
    },
  },
}

describe('ComponentsTab', () => {
  function setup(overrideData) {
    const componentsMock = jest.fn()
    useFlags.mockReturnValue({
      componentsSelect: true,
    })

    server.use(
      graphql.query('PullComponentComparison', (req, res, ctx) => {
        if (req.variables?.filters?.components) {
          componentsMock(req.variables.filters.components)
        }

        if (overrideData) {
          return res(ctx.status(200), ctx.data(overrideData))
        }

        return res(ctx.status(200), ctx.data(mockPull))
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
      render(<ComponentsTab />, { wrapper: wrapper() })

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
      render(<ComponentsTab />, { wrapper: wrapper() })

      const nameTableField = await screen.findByText(`Name`)
      expect(nameTableField).toBeInTheDocument()

      const headTableField = await screen.findByText(`HEAD %`)
      expect(headTableField).toBeInTheDocument()

      const patchTableField = await screen.findByText(`Patch %`)
      expect(patchTableField).toBeInTheDocument()

      const changeTableField = await screen.findByText(`Change`)
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

    it('renders ComponentsSelector', async () => {
      render(<ComponentsTab />, { wrapper: wrapper() })

      const selector = await screen.findByText('ComponentsSelector')
      expect(selector).toBeInTheDocument()
    })
  })

  describe('when rendered with components filter', () => {
    it('sends default params to the API', async () => {
      const { componentsMock } = setup()
      render(<ComponentsTab />, {
        wrapper: wrapper(
          '/gh/codecov/gazebo/pull/123/components?components=component1,component2'
        ),
      })

      await waitFor(() => expect(componentsMock).toBeCalledTimes(1))
      await waitFor(() =>
        expect(componentsMock).toHaveBeenCalledWith('component1,component2')
      )
    })
  })
})
