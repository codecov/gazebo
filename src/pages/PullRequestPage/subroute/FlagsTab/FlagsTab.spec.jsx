import { render, screen, waitFor } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import FlagsTab from './FlagsTab'

const mockPull = {
  owner: {
    repository: {
      pull: {
        compareWithBase: {
          flagComparisons: [
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

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper =
  (initialEntries = '/gh/test-org/test-repo/pull/5') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

beforeAll(() => {
  server.listen()
  console.error = () => {}
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('FlagsTab', () => {
  function setup(overrideData) {
    const variablesPassed = jest.fn()
    server.use(
      graphql.query('Pull', (req, res, ctx) => {
        variablesPassed(req.variables)
        if (overrideData) {
          return res(ctx.status(200), ctx.data(overrideData))
        }

        return res(ctx.status(200), ctx.data(mockPull))
      })
    )

    return { variablesPassed }
  }

  describe('when rendered without flags but card is not dismissed', () => {
    beforeEach(() => {
      setup({})
    })

    it('renders a card for every valid field', async () => {
      render(<FlagsTab />, { wrapper: wrapper() })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const nameTableField = screen.queryByText(`Name`)
      expect(nameTableField).not.toBeInTheDocument()

      const headTableField = screen.queryByText(`HEAD %`)
      expect(headTableField).not.toBeInTheDocument()

      const patchTableField = screen.queryByText(`Patch %`)
      expect(patchTableField).not.toBeInTheDocument()

      const changeTableField = screen.queryByText(`+/-`)
      expect(changeTableField).not.toBeInTheDocument()

      const flagsDescription = await screen.findByText(
        /The Flags feature is not yet configured/i
      )
      expect(flagsDescription).toBeInTheDocument()

      const flagsAnchor = await screen.findByRole(
        'link',
        /help your team today/i
      )
      expect(flagsAnchor).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/flags'
      )
      expect(flagsDescription).toBeInTheDocument()

      const flagsMarketingImg = await screen.findByRole('img', {
        name: /Flags feature not configured/,
      })
      expect(flagsMarketingImg).toBeInTheDocument()
      expect(flagsMarketingImg).toHaveAttribute('src', 'flagManagement.svg')
      expect(flagsMarketingImg).toHaveAttribute(
        'alt',
        'Flags feature not configured'
      )
    })
  })

  describe('when there are no flags in the new tab', () => {
    beforeEach(() => {
      setup({})
    })

    it('will render card with no dismiss button', async () => {
      render(<FlagsTab />, { wrapper: wrapper() })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const nameTableField = screen.queryByText(`Name`)
      expect(nameTableField).not.toBeInTheDocument()

      const headTableField = screen.queryByText(`HEAD %`)
      expect(headTableField).not.toBeInTheDocument()

      const patchTableField = screen.queryByText(`Patch %`)
      expect(patchTableField).not.toBeInTheDocument()

      const changeTableField = screen.queryByText(`+/-`)
      expect(changeTableField).not.toBeInTheDocument()

      const flagsCardTitle = screen.queryByText('FlagsTab')
      expect(flagsCardTitle).not.toBeInTheDocument()

      const dismissButton = screen.queryByText('Dismiss')
      expect(dismissButton).not.toBeInTheDocument()

      const flagsDescription = screen.queryByText(
        /FlagsTab feature is not yet configured. Learn how flags can/i
      )
      expect(flagsDescription).not.toBeInTheDocument()
    })
  })

  describe('when rendered with populated data in the new tab', () => {
    beforeEach(() => {
      setup()
    })

    it('renders columns with expected data', async () => {
      render(<FlagsTab />, { wrapper: wrapper() })

      const flagsCardTitle = screen.queryByText('FlagsTab')
      expect(flagsCardTitle).not.toBeInTheDocument()

      const nameTableField = await screen.findByText(`Name`)
      expect(nameTableField).toBeInTheDocument()

      const headTableField = await screen.findByText(`HEAD %`)
      expect(headTableField).toBeInTheDocument()

      const patchTableField = await screen.findByText(`Patch %`)
      expect(patchTableField).toBeInTheDocument()

      const changeTableField = await screen.findByText(`Change`)
      expect(changeTableField).toBeInTheDocument()

      const flagName = await screen.findByText('secondTest')
      expect(flagName).toBeInTheDocument()

      const flagHeadCoverage = await screen.findByText('82.71%')
      expect(flagHeadCoverage).toBeInTheDocument()

      const flagPatchCoverage = await screen.findByText('59.00%')
      expect(flagPatchCoverage).toBeInTheDocument()

      const flagChangeCoverage = await screen.findByText('2.71%')
      expect(flagChangeCoverage).toBeInTheDocument()
    })
  })

  describe('passed flags to API when flags are present in the url', () => {
    it('will pass flags to API', async () => {
      const { variablesPassed } = setup({})
      render(<FlagsTab />, {
        wrapper: wrapper(
          '/gh/test-org/test-repo/pull/5?flags=firstTest,secondTest'
        ),
      })

      await waitFor(() =>
        expect(variablesPassed).toHaveBeenCalledWith({
          provider: 'gh',
          owner: 'test-org',
          repo: 'test-repo',
          pullId: 5,
          filters: { flags: 'firstTest,secondTest' },
        })
      )
    })
  })
})
